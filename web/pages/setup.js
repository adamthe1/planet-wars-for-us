import Link from 'next/link'

const Step = ({ n, title, children }) => (
  <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: '#1a2a3a', border: '2px solid #4488bb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontWeight: 700, color: '#4488bb', fontSize: 14,
    }}>
      {n}
    </div>
    <div>
      <div style={{ fontWeight: 700, color: '#ddd', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  </div>
)

const Code = ({ children }) => (
  <pre style={{
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: 6,
    padding: '12px 16px',
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#88ccff',
    overflowX: 'auto',
    margin: '8px 0 0',
  }}>
    {children}
  </pre>
)

export default function Setup() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>
            Local Runner Setup
          </h1>
          <p style={{ margin: '4px 0 0', color: '#555', fontSize: 13 }}>
            Run this once to enable game execution from the website
          </p>
        </div>
      </div>

      <div style={{
        background: '#0d1a0d',
        border: '1px solid #1a3a1a',
        borderRadius: 8,
        padding: '14px 18px',
        marginBottom: 32,
        fontSize: 13,
        color: '#7a9',
      }}>
        <strong style={{ color: '#4caf50' }}>Why this is needed:</strong> Games run on your own machine
        because they require Python and Java. The website sends bot code to your local runner,
        which executes the game and streams back the result.
      </div>

      <Step n="1" title="Requirements">
        <ul style={{ color: '#888', lineHeight: 2, margin: 0, paddingLeft: 20, fontSize: 14 }}>
          <li>Python 3.8 or newer</li>
          <li>Java JRE 8 or newer (<code style={{ color: '#88bbdd' }}>java --version</code> to check)</li>
          <li>The planet-wars-starterpackage repo cloned locally</li>
        </ul>
      </Step>

      <Step n="2" title="Install the local runner dependencies">
        <Code>{`cd planet-wars-starterpackage/local_runner
pip install -r requirements.txt`}</Code>
      </Step>

      <Step n="3" title="Start the local runner">
        <Code>{`python server.py`}</Code>
        <p style={{ color: '#666', fontSize: 13, marginTop: 8 }}>
          You should see: <span style={{ color: '#88ccff', fontFamily: 'monospace' }}>Planet Wars local runner starting on http://localhost:3737</span>
        </p>
        <p style={{ color: '#555', fontSize: 13 }}>
          Keep this terminal open while playing games. Press <code style={{ color: '#88bbdd' }}>Ctrl+C</code> to stop it.
        </p>
      </Step>

      <Step n="4" title="Come back here and start a game">
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
          The green banner on the home page will confirm the runner is online.
        </p>
      </Step>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link href="/" style={{
          padding: '12px 32px',
          background: '#1a3a5a',
          border: '2px solid #4488bb',
          borderRadius: 8,
          color: '#4488bb',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 15,
        }}>
          ← Back to Arena
        </Link>
      </div>
    </div>
  )
}
