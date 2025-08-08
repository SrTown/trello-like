import { useAuth } from "@/auth/auth-provider"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "manager" | "member">("member")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await register({ name, email, password, role })
    setLoading(false)
    if (res.ok) {
      navigate("/board")
    } else {
      setError(res.error || "Error al registrarse")
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-pink-50 via-white to-brand-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
        <p className="text-sm text-neutral-600">
          Comienza a colaborar con tu equipo
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div className="grid gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Ada Lovelace"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="tu@email.com"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Crea una contraseña"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="role" className="text-sm font-medium">
              Rol (opcional)
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="member">Miembro</option>
              <option value="manager">Gestor</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-neutral-500">
              El backend define los permisos reales; este valor es sólo de
              preferencia inicial.
            </p>
          </div>
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-4 text-sm text-neutral-600">
          ¿Ya tienes cuenta?{" "}
          <Link className="text-brand-700 underline" to="/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}