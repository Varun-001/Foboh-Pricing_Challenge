import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [slug, setSlug] = useState('acme')
  const [email, setEmail] = useState('owner@acme.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': slug },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      setError('Invalid credentials')
      return
    }
    const { token } = await res.json()
    login(token, slug)
    nav('/pricing')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-foboh-teal-bg">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow w-80 space-y-4">
        <h1 className="text-xl font-semibold text-foboh-teal">Sign in</h1>
        <input className="w-full border p-2 rounded" placeholder="Tenant (acme / globex)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-foboh-teal text-white py-2 rounded">Sign in</button>
      </form>
    </div>
  )
}
