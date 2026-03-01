import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import BotList from '../components/BotList'
import GameVisualizer from '../components/GameVisualizer'

const LOCAL_RUNNER_URL = process.env.NEXT_PUBLIC_LOCAL_RUNNER_URL || 'http://localhost:3737'

export default function Home() {
  const [bots, setBots] = useState([])
  const [botsLoading, setBotsLoading] = useState(true)
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [runnerStatus, setRunnerStatus] = useState('checking') // checking | ok | error
  const [gameResult, setGameResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState(null)

  // Load bot list
  useEffect(() => {
    fetch('/api/bots')
      .then((r) => r.json())
      .then((data) => setBots(data.bots || []))
      .catch(() => setBots([]))
      .finally(() => setBotsLoading(false))
  }, [])

  // Check local runner health
  const checkRunner = useCallback(async () => {
    setRunnerStatus('checking')
    try {
      const resp = await fetch(`${LOCAL_RUNNER_URL}/health`, {
        signal: AbortSignal.timeout(3000),
      })
      const data = await resp.json()
      setRunnerStatus(data.status === 'ok' ? 'ok' : 'error')
    } catch {
      setRunnerStatus('error')
    }
  }, [])

  useEffect(() => {
    checkRunner()
  }, [checkRunner])

  const startGame = async () => {
    if (!player1 || !player2 || isRunning) return
    setIsRunning(true)
    setError(null)
    setGameResult(null)

    try {
      // Fetch full bot code from our API (server-side blob fetch)
      const [r1, r2] = await Promise.all([
        fetch(`/api/bots/${player1.id}`),
        fetch(`/api/bots/${player2.id}`),
      ])
      const { bot: bot1 } = await r1.json()
      const { bot: bot2 } = await r2.json()

      // Send to local runner running on the user's machine
      const gameResp = await fetch(`${LOCAL_RUNNER_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot1_name: bot1.name,
          bot2_name: bot2.name,
          bot1_code: bot1.code,
          bot2_code: bot2.code,
        }),
        signal: AbortSignal.timeout(130_000), // 2min + buffer
      })

      const result = await gameResp.json()
      if (!result.success) throw new Error(result.error || 'Game failed')
      setGameResult(result)
    } catch (err) {
      if (err.name === 'TimeoutError') {
        setError('Game timed out. Try reducing max turns in local runner settings.')
      } else {
        setError(err.message)
      }
    } finally {
      setIsRunning(false)
    }
  }

  const canStart = player1 && player2 && runnerStatus === 'ok' && !isRunning

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff' }}>
            🪐 Planet Wars Arena
          </h1>
          <p style={{ margin: '4px 0 0', color: '#555', fontSize: 14 }}>
            Upload a bot, pick your fighter, start the battle.
          </p>
        </div>
        <Link href="/upload" style={{
          padding: '10px 20px',
          background: '#1a2a3a',
          border: '1px solid #2a4a6a',
          borderRadius: 8,
          color: '#4488bb',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 600,
        }}>
          + Upload Bot
        </Link>
      </div>

      {/* Local Runner Status */}
      <div style={{
        padding: '12px 16px',
        marginBottom: 24,
        borderRadius: 8,
        border: `1px solid ${runnerStatus === 'ok' ? '#1a3a1a' : runnerStatus === 'error' ? '#3a1a1a' : '#2a2a2a'}`,
        background: runnerStatus === 'ok' ? '#0d1f0d' : runnerStatus === 'error' ? '#1f0d0d' : '#111',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 14,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: runnerStatus === 'ok' ? '#4caf50' : runnerStatus === 'error' ? '#f44336' : '#666',
          boxShadow: runnerStatus === 'ok' ? '0 0 6px #4caf50' : runnerStatus === 'error' ? '0 0 6px #f44336' : 'none',
        }} />
        <span style={{ color: runnerStatus === 'ok' ? '#4caf50' : runnerStatus === 'error' ? '#f44336' : '#888' }}>
          {runnerStatus === 'ok' && 'Local runner is online — ready to play'}
          {runnerStatus === 'error' && (
            <>
              Local runner is offline.{' '}
              <Link href="/setup" style={{ color: '#f44336' }}>Setup guide</Link>
              {' · '}
              <button
                onClick={checkRunner}
                style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: 14 }}
              >
                Retry
              </button>
            </>
          )}
          {runnerStatus === 'checking' && 'Checking local runner...'}
        </span>
      </div>

      {/* Bot Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <BotList
          bots={bots}
          selected={player1}
          onSelect={setPlayer1}
          accentColor="#cc3333"
          label="Player 1"
        />
        <BotList
          bots={bots}
          selected={player2}
          onSelect={setPlayer2}
          accentColor="#4488bb"
          label="Player 2"
        />
      </div>

      {botsLoading && (
        <p style={{ color: '#444', fontSize: 14, textAlign: 'center' }}>Loading bots...</p>
      )}

      {/* Start Button */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {!canStart && !isRunning && (
          <p style={{ color: '#444', fontSize: 13, marginBottom: 12 }}>
            {runnerStatus !== 'ok'
              ? 'Start your local runner to play games'
              : !player1 || !player2
              ? 'Select a bot for each player to begin'
              : ''}
          </p>
        )}
        <button
          onClick={startGame}
          disabled={!canStart}
          style={{
            padding: '14px 48px',
            fontSize: 18,
            fontWeight: 700,
            background: canStart ? 'linear-gradient(135deg, #aa1111, #cc3333)' : '#1a1a1a',
            color: canStart ? '#fff' : '#444',
            border: `2px solid ${canStart ? '#cc3333' : '#2a2a2a'}`,
            borderRadius: 10,
            cursor: canStart ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: canStart ? '0 0 20px #cc333344' : 'none',
            letterSpacing: 1,
          }}
        >
          {isRunning ? '⚡ Running...' : '▶ Start Game'}
        </button>

        {error && (
          <p style={{ color: '#f44336', marginTop: 12, fontSize: 14 }}>{error}</p>
        )}
      </div>

      {/* Game Result Winner Banner */}
      {gameResult && (
        <div style={{
          textAlign: 'center',
          marginBottom: 8,
          padding: '10px 16px',
          borderRadius: 8,
          background: '#111',
          border: '1px solid #2a2a2a',
          fontSize: 15,
          color: '#aaa',
        }}>
          {gameResult.winner === '1' && (
            <><span style={{ color: '#cc3333', fontWeight: 700 }}>{gameResult.player_one}</span> wins! 🏆</>
          )}
          {gameResult.winner === '2' && (
            <><span style={{ color: '#4488bb', fontWeight: 700 }}>{gameResult.player_two}</span> wins! 🏆</>
          )}
          {gameResult.winner !== '1' && gameResult.winner !== '2' && (
            <>Draw — no winner</>
          )}
        </div>
      )}

      {/* Game Visualizer */}
      <GameVisualizer
        playbackString={gameResult?.playback_string}
        playerOne={gameResult?.player_one}
        playerTwo={gameResult?.player_two}
      />
    </div>
  )
}
