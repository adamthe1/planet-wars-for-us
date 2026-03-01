import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const STARTER_CODE = `from PlanetWars import PlanetWars


def DoTurn(pw):
    # Get my strongest planet
    my_planets = pw.MyPlanets()
    if not my_planets:
        return

    source = max(my_planets, key=lambda p: p.NumShips())

    # Attack the weakest enemy or neutral planet
    targets = pw.EnemyPlanets() + pw.NeutralPlanets()
    if not targets:
        return

    target = min(targets, key=lambda p: p.NumShips())

    if source.NumShips() > 10:
        pw.IssueOrder(source.PlanetID(), target.PlanetID(), source.NumShips() // 2)


def main():
    map_data = ''
    while True:
        current_line = input()
        if current_line.startswith('go'):
            pw = PlanetWars(map_data)
            DoTurn(pw)
            pw.FinishTurn()
            map_data = ''
        else:
            map_data += current_line + '\\n'


if __name__ == '__main__':
    main()
`

export default function Upload() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [author, setAuthor] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => setCode(evt.target.result)
    reader.readAsText(file)
    if (!name) setName(file.name.replace('.py', ''))
  }

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/" style={{
          color: '#555',
          textDecoration: 'none',
          fontSize: 20,
          lineHeight: 1,
        }}>←</Link>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Upload Your Bot</h1>
          <p style={{ margin: '4px 0 0', color: '#555', fontSize: 13 }}>
            Write a Python bot that plays Planet Wars
          </p>
        </div>
      </div>

      {/* Tips */}
      <div style={{
        background: '#0d1a2a',
        border: '1px solid #1a3a5a',
        borderRadius: 8,
        padding: '14px 18px',
        marginBottom: 28,
        fontSize: 13,
        color: '#7aa',
        lineHeight: 1.7,
      }}>
        <strong style={{ color: '#4488bb' }}>Bot requirements:</strong>
        <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
          <li>Python 3 bot using the <code style={{ color: '#88bbdd' }}>PlanetWars</code> class</li>
          <li>Must have a <code style={{ color: '#88bbdd' }}>main()</code> function with the standard input loop</li>
          <li>Only standard library + <code style={{ color: '#88bbdd' }}>PlanetWars</code> imports</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name & Author */}
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

        {/* File Upload */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
            Upload .py file
          </label>
          <input
            type="file"
            accept=".py"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#111',
              border: '1px dashed #333',
              borderRadius: 6,
              color: '#888',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Code Editor */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: '#666', letterSpacing: 1, textTransform: 'uppercase' }}>
              Bot Code (Python) *
            </label>
            <button
              type="button"
              onClick={() => setCode(STARTER_CODE)}
              style={{
                background: 'none',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#555',
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Load starter template
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={24}
            required
            placeholder="Paste your bot code here, or upload a .py file above..."
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
          <div style={{ textAlign: 'right', fontSize: 12, color: '#444', marginTop: 4 }}>
            {code.length.toLocaleString()} / 100,000 chars
          </div>
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
