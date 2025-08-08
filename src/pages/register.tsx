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
      setError(res.error || "Registration failed")
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-pink-50 via-white to-brand-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm text-neutral-600">Start collaborating with your team</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div className="grid gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
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
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="role" className="text-sm font-medium">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-neutral-500">
              Backend controls actual privileges; this is only for initial preference.
            </p>
          </div>
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-neutral-600">
          Already have an account?{" "}
          <Link className="text-brand-700 underline" to="/login">Login</Link>
        </p>
      </div>
    </main>
  )
}
