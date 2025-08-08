import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { Permission, Role, User } from "@/lib/types"
import { can as roleCan } from "@/lib/rbac"
import { apiPost, setAuthToken, getAuthToken, decodeJwt } from "@/lib/api"

type AuthContextType = {
  user: User | null
  users: User[]
  register: (input: { name: string; email: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string }>
  login: (input: { email: string; password: string }) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  can: (permission: Permission) => boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_USER_KEY = "flowboard.user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = getAuthToken()
    setToken(t)
    const stored = localStorage.getItem(AUTH_USER_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User)
      } catch {
        // ignore
      }
    }
  }, [])

  async function login(input: { email: string; password: string }) {
    try {
      const res = await apiPost<{ ok: boolean; message?: string; token?: string }>("/auth/login", {
        email: input.email,
        password_hash: input.password, // texto plano, el backend lo maneja
      })
      if (!res?.ok || !res?.token) {
        return { ok: false, error: res?.message || "Credenciales inválidas" }
      }
      setAuthToken(res.token)
      setToken(res.token)

      type Payload = { id?: string; userLanguage?: string; typeUser?: string }
      const payload = decodeJwt<Payload>(res.token) || {}
      const nextUser: User = {
        id: (payload.id as string) || crypto.randomUUID(),
        name: input.email.split("@")[0],
        email: input.email,
        role: "member",
        createdAt: Date.now(),
      }
      setUser(nextUser)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
      return { ok: true }
    } catch {
      return { ok: false, error: "No se pudo iniciar sesión. Error de red." }
    }
  }

  async function register(input: { name: string; email: string; password: string; role: Role }) {
    try {
      const res = await apiPost<{ ok: boolean; message?: string }>("/auth/signup", {
        name: input.name,
        email: input.email,
        password_hash: input.password,
      })
      if (!res?.ok) {
        return { ok: false, error: res?.message || "No se pudo registrar" }
      }
      return await login({ email: input.email, password: input.password })
    } catch {
      return { ok: false, error: "No se pudo registrar. Error de red." }
    }
  }

  async function logout() {
    try {
      await apiPost("/auth/logout")
    } catch {
      // ignore
    } finally {
      setUser(null)
      setToken(null)
      setAuthToken(null)
      localStorage.removeItem(AUTH_USER_KEY)
    }
  }

  const usersList = useMemo(() => (user ? [user] : []), [user])
  const can = (permission: Permission) => roleCan(user?.role, permission)

  return (
    <AuthContext.Provider value={{ user, users: usersList, register, login, logout, can, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
