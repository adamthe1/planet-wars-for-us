export default function BotList({ bots, selected, onSelect, accentColor, label }) {
  return (
    <div>
      <div style={{
        fontSize: 11,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: accentColor,
        marginBottom: 8,
        fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{
        border: `1px solid ${selected ? accentColor + '66' : '#2a2a2a'}`,
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        maxHeight: 320,
        overflowY: 'auto',
      }}>
        {bots.length === 0 && (
          <div style={{ padding: '20px 16px', color: '#555', fontSize: 14 }}>
            No bots yet.{' '}
            <a href="/upload" style={{ color: accentColor }}>Upload one!</a>
          </div>
        )}
        {bots.map((bot) => {
          const isSelected = selected?.id === bot.id
          return (
            <div
              key={bot.id}
              onClick={() => onSelect(isSelected ? null : bot)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #1a1a1a',
                background: isSelected ? accentColor + '22' : 'transparent',
                borderLeft: `3px solid ${isSelected ? accentColor : 'transparent'}`,
                transition: 'background 0.15s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{
                  fontWeight: 600,
                  color: isSelected ? accentColor : '#ddd',
                  fontSize: 14,
                }}>
                  {bot.name}
                </div>
                <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
                  by {bot.author}
                </div>
              </div>
              {isSelected && (
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: accentColor,
                  flexShrink: 0,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
