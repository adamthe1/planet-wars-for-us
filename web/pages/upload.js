import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Upload() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [author, setAuthor] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const resp = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, author, code }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Upload failed')
      router.push('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Upload Your Bot</h1>
          <p style={{ margin: '4px 0 0', color: '#555', fontSize: 13 }}>
            Paste your Python bot code below
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
              Bot Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. AggressiveBot"
              style={{ width: '100%' }}
              maxLength={50}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
              Your Name
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Adam"
              style={{ width: '100%' }}
              maxLength={50}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
            Bot Code (Python) *
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={24}
            required
            placeholder="Paste your bot code here..."
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: 13,
              lineHeight: 1.6,
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              resize: 'vertical',
            }}
          />
        </div>

        {error && (
          <div style={{
            background: '#1f0d0d',
            border: '1px solid #3a1a1a',
            borderRadius: 6,
            padding: '10px 14px',
            color: '#f44336',
            fontSize: 14,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 32px',
              fontSize: 15,
              fontWeight: 700,
              background: submitting ? '#1a1a1a' : 'linear-gradient(135deg, #1a3a5a, #2255aa)',
              color: submitting ? '#444' : '#fff',
              border: '2px solid #2255aa',
              borderRadius: 8,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Uploading...' : '↑ Upload Bot'}
          </button>
          <Link href="/" style={{ color: '#555', fontSize: 14 }}>Cancel</Link>
        </div>
      </form>
    </div>
  )
}
