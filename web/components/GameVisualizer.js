import { useEffect, useRef } from 'react'

export default function GameVisualizer({ playbackString, playerOne, playerTwo }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!playbackString || !iframeRef.current) return

    // Build a self-contained HTML document that mirrors visualizer/index.php.
    // The playbackString is injected as `const data = '...'` exactly like
    // visualize_locally.py does when generating the static HTML file.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${playerOne} vs ${playerTwo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');
    html { background: #000; }
    body { color: #9b9b9b; font-family: 'Open Sans', sans-serif; font-size: small; margin: 0; }
    #container { margin: auto; width: 640px; }
    #players { font-size: 24px; width: 100%; }
    #turnCounter { margin: 0; }
    #controls { text-align: center; margin: 0; }
    #controls a { text-decoration: none; font-size: 32px; padding: 0 12px; }
    a, a:active, a:visited { color: #607890; }
    #chart { background: #000; border-top: solid 1px #607890; border-bottom: solid 1px #607890; }
  </style>
</head>
<body>
  <div id="container">
    <header>
      <table id="players">
        <tr>
          <td style="width:40%;text-align:right;" class="player1Name"></td>
          <td style="width:20%;text-align:center;" class="playerVs">Loading</td>
          <td style="width:40%;text-align:left;" class="player2Name"></td>
        </tr>
      </table>
    </header>
    <div id="main">
      <canvas id="display" width="640" height="640"></canvas>
      <p id="turnCounter">Loading</p>
      <p id="controls">
        <a href="#" id="start-button" title="Jump to start"><span class="small">|</span>&laquo;</a> |
        <a href="#" id="prev-frame-button" title="Previous frame (left arrow)">&laquo;</a> |
        <a href="#" id="play-button" title="Pause (space bar)">&#9654;</a> |
        <a href="#" id="next-frame-button" title="Next frame (right arrow)">&raquo;</a> |
        <a href="#" id="end-button" title="Jump to end">&raquo;<span class="small">|</span></a><br />
        <a href="#" id="speeddown" title="Slow down (down arrow)">&ndash;</a>
        <a href="#" id="speedup" title="Speed up (up arrow)">+</a>
      </p>
      <p><canvas id="chart" width="640" height="100"></canvas></p>
    </div>
  </div>

  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script>!window.jQuery && document.write('<scr'+'ipt src="/visualizer/jquery-3.4.1.js"><\\/scr'+'ipt>')</script>
  <script>const data = ${JSON.stringify(playbackString)};</script>
  <script src="/visualizer/visualizer.js"></script>
</body>
</html>`

    iframeRef.current.srcdoc = html
  }, [playbackString, playerOne, playerTwo])

  if (!playbackString) return null

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 18,
        color: '#aaa',
      }}>
        <span style={{ color: '#cc3333', fontWeight: 700 }}>{playerOne}</span>
        <span style={{ margin: '0 12px', color: '#444' }}>vs</span>
        <span style={{ color: '#4488bb', fontWeight: 700 }}>{playerTwo}</span>
      </div>
      <iframe
        ref={iframeRef}
        style={{
          width: '660px',
          height: '880px',
          border: 'none',
          background: '#000',
          display: 'block',
          margin: '0 auto',
          borderRadius: 8,
        }}
        title="Game Visualizer"
        sandbox="allow-scripts"
      />
    </div>
  )
}
