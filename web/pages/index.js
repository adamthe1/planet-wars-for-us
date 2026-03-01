import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import BotList from '../components/BotList'
import GameVisualizer from '../components/GameVisualizer'

const LOCAL_RUNNER_URL = process.env.NEXT_PUBLIC_LOCAL_RUNNER_URL || 'http://localhost:3737'

export default function Home() {
  const [bots, setBots] = useState([])
  const [botsLoading, setBotsLoading] = useState(true)
  const [champion, setChampion] = useState(null)   // just a name string
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [runnerStatus, setRunnerStatus] = useState('checking')
  const [gameResult, setGameResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState(null)
  const [newChampion, setNewChampion] = useState(null)  // name of newly crowned champion

  useEffect(() => {
    fetch('/api/bots')
      .then((r) => r.json())
      .then((data) => setBots(data.bots || []))
      .catch(() => setBots([]))
      .finally(() => setBotsLoading(false))

    fetch('/api/champion')
      .then((r) => r.json())
      .then((data) => setChampion(data.name ? { name: data.name, wins: data.wins || 0 } : null))
      .catch(() => {})
  }, [])

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

  useEffect(() => { checkRunner() }, [checkRunner])

  const setNewChampionRemote = async (name, wins) => {
    try {
      const resp = await fetch('/api/champion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, wins }),
      })
      const data = await resp.json()
      setChampion({ name: data.name, wins: data.wins })
      setNewChampion(name)
    } catch {}
  }

  const startGame = async () => {
    if (!player1 || !player2 || isRunning) return
    setIsRunning(true)
    setError(null)
    setGameResult(null)
    setNewChampion(null)

    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/bots/${player1.id}`),
        fetch(`/api/bots/${player2.id}`),
      ])
      const { bot: bot1 } = await r1.json()
      const { bot: bot2 } = await r2.json()

      const gameResp = await fetch(`${LOCAL_RUNNER_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot1_name: bot1.name,
          bot2_name: bot2.name,
          bot1_code: bot1.code,
          bot2_code: bot2.code,
        }),
        signal: AbortSignal.timeout(130_000),
      })

      const result = await gameResp.json()
      if (!result.success) throw new Error(result.error || 'Game failed')
      setGameResult(result)

      // Crown logic
      const championName = champion?.name || null
      if (result.winner === '1' && bot2.name === championName) {
        // Champion (player 2) lost — player 1 takes the crown
        await setNewChampionRemote(bot1.name, 1)
      } else if (result.winner === '2' && bot1.name === championName) {
        // Champion (player 1) lost — player 2 takes the crown
        await setNewChampionRemote(bot2.name, 1)
      } else if (result.winner === '1' && bot1.name === championName) {
        // Champion (player 1) defended — increment wins
        await setNewChampionRemote(bot1.name, (champion?.wins || 0) + 1)
      } else if (result.winner === '2' && bot2.name === championName) {
        // Champion (player 2) defended — increment wins
        await setNewChampionRemote(bot2.name, (champion?.wins || 0) + 1)
      } else if (!championName && (result.winner === '1' || result.winner === '2')) {
        // No champion yet — first winner takes the crown
        const winnerName = result.winner === '1' ? bot1.name : bot2.name
        await setNewChampionRemote(winnerName, 1)
      }
    } catch (err) {
      setError(err.name === 'TimeoutError' ? 'Game timed out.' : err.message)
    } finally {
      setIsRunning(false)
    }
  }

  const canStart = player1 && player2 && player1.id !== player2.id && runnerStatus === 'ok' && !isRunning

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff' }}>
            Planet Wars Arena
          </h1>
          <p style={{ margin: '4px 0 0', color: '#555', fontSize: 14 }}>
            Upload bots, pick two, and let them fight.
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

      {/* Champion Banner */}
      <div style={{
        textAlign: 'center',
        padding: '14px 20px',
        marginBottom: 24,
        borderRadius: 8,
        background: champion ? '#1a0f00' : '#111',
        border: `1px solid ${champion ? '#664400' : '#222'}`,
      }}>
        {champion ? (
          <span style={{ fontSize: 18, color: '#ffaa33', fontWeight: 700 }}>
            👑 Champion: {champion.name}
            <span style={{ fontSize: 13, color: '#aa7722', fontWeight: 400, marginLeft: 12 }}>
              {champion.wins} {champion.wins === 1 ? 'win' : 'wins'}
            </span>
          </span>
        ) : (
          <span style={{ fontSize: 14, color: '#444' }}>
            No champion yet — first game winner takes the crown
          </span>
        )}
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
        flexWrap: 'wrap',
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
              <button onClick={checkRunner} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: 14 }}>
                Retry
              </button>
              <span style={{ color: '#555' }}> · Chrome: lock icon → Local network access → Allow</span>
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
              : !player1
              ? 'Select Player 1'
              : !player2
              ? 'Select Player 2'
              : player1.id === player2.id
              ? 'Pick two different bots'
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

        {error && <p style={{ color: '#f44336', marginTop: 12, fontSize: 14 }}>{error}</p>}
      </div>

      {/* Game Result */}
      {gameResult && (
        <div style={{
          textAlign: 'center',
          marginBottom: 8,
          padding: '14px 16px',
          borderRadius: 8,
          background: newChampion ? '#1a0d00' : '#111',
          border: `1px solid ${newChampion ? '#cc8800' : '#2a2a2a'}`,
          fontSize: 16,
          color: '#aaa',
        }}>
          {newChampion && newChampion !== (champion?.name) && (
            <div style={{ fontSize: 22, marginBottom: 4, color: '#ffaa33' }}>
              👑 New Champion: {newChampion}!
            </div>
          )}
          {newChampion && newChampion === champion?.name && champion?.wins > 1 && (
            <div style={{ fontSize: 16, marginBottom: 4, color: '#aa7722' }}>
              Champion defends! ({champion.wins} wins)
            </div>
          )}
          {gameResult.winner === '1' && (
            <><span style={{ color: '#cc3333', fontWeight: 700 }}>{gameResult.player_one}</span> wins!</>
          )}
          {gameResult.winner === '2' && (
            <><span style={{ color: '#4488bb', fontWeight: 700 }}>{gameResult.player_two}</span> wins!</>
          )}
          {gameResult.winner !== '1' && gameResult.winner !== '2' && <>Draw</>}
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
