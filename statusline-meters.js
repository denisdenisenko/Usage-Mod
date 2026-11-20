// Claude Code status line: context, 5-hour and weekly usage bars.
const fs = require('fs')
const path = require('path')
const os = require('os')

let raw = ''
process.stdin.on('data', c => (raw += c))
process.stdin.on('end', () => {
  let d = {}
  try {
    d = JSON.parse(raw)
  } catch {}

  // Keep the last input for debugging the field names.
  try {
    fs.writeFileSync(path.join(os.homedir(), '.claude', 'statusline-last.json'), raw)
  } catch {}

  const C = { cyan: 36, yellow: 33, magenta: 35, dim: 2 }
  const paint = (code, s) => `\x1b[${code}m${s}\x1b[0m`

  const bar = (p, w = 20) => {
    const f = Math.max(0, Math.min(w, Math.round(((p || 0) / 100) * w)))
    return '█'.repeat(f) + '░'.repeat(w - f)
  }
  const fmt = n => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `${n}`)
  const pct = p => (p == null ? 'n/a' : `${Math.round(p)}%`)

  // Context window
  const cw = d.context_window || {}
  const ctxPct = cw.used_percentage
  const ctxTokens = cw.total_input_tokens
  const ctxSize = cw.context_window_size

  // Rate limits: accept an object keyed by window, or an array of { kind, ... }
  const rl = d.rate_limits || {}
  const pick = key => {
    if (Array.isArray(rl)) return rl.find(r => r && (r.kind === key || r.type === key)) || null
    return rl[key] || null
  }
  const usedOf = r =>
    r == null ? null : r.used_percentage ?? r.percent_used ?? r.percentUsed ?? r.utilization ?? null

  const resetOf = r => {
    if (!r) return ''
    let t = r.resets_at ?? r.resetsAt ?? r.reset_at
    if (t == null) return ''
    if (typeof t === 'number') t = t < 1e12 ? t * 1000 : t
    const at = new Date(t)
    const ms = at.getTime() - Date.now()
    if (Number.isNaN(ms)) return ''
    const hh = String(at.getHours()).padStart(2, '0')
    const mm = String(at.getMinutes()).padStart(2, '0')
    const mins = Math.max(0, Math.round(ms / 60000))
    const left = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`
    return ` (resets ${hh}:${mm}, in ${left})`
  }

  const five = pick('five_hour')
  const week = pick('seven_day')

  const lines = [
    paint(
      C.cyan,
      `context  ${bar(ctxPct)} ${pct(ctxPct)}` +
        (ctxTokens != null && ctxSize ? ` (${fmt(ctxTokens)}/${fmt(ctxSize)})` : ''),
    ),
    paint(C.yellow, `5 hour   ${bar(usedOf(five))} ${pct(usedOf(five))}${resetOf(five)}`),
    paint(C.magenta, `weekly   ${bar(usedOf(week))} ${pct(usedOf(week))}`),
  ]

  const usd = d.cost && d.cost.total_cost_usd
  if (typeof usd === 'number') lines.push(paint(C.dim, `cost     ~$${usd.toFixed(2)} est.`))

  process.stdout.write(lines.join('\n'))
})
