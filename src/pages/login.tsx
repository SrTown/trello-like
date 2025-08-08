import { useAuth } from "@/auth/auth-provider"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await login({ email, password })
    setLoading(false)
    if (res.ok) {
      navigate("/board")
    } else {
      setError(res.error || "Error al iniciar sesión")
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-brand-50 via-white to-pink-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        <p className="text-sm text-neutral-600">
          Accede a tu espacio de trabajo de FlowBoard
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
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
              placeholder="Tu contraseña"
            />
          </div>
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-sm text-neutral-600">
          ¿No tienes cuenta?{" "}
          <Link className="text-brand-700 underline" to="/register">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  )
}