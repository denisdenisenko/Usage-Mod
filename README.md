# Usage status line for Claude Code

Shows three colored bars under the prompt textbox:

```
context  ██░░░░░░░░░░░░░░░░░░ 12% (119k/1.0M)      (cyan)
5 hour   █████░░░░░░░░░░░░░░░ 25% (resets 14:50, in 1h 30m)   (yellow)
weekly   ██████████░░░░░░░░░░ 51%                  (magenta)
cost     ~$2.63 est.                               (dim)
```

## Install (Windows)

Requires [Node.js](https://nodejs.org).

```powershell
git clone https://github.com/denisdenisenko/Usage-Mod.git
powershell -ExecutionPolicy Bypass -File Usage-Mod\install.ps1
```

This copies `statusline-meters.js` to `~/.claude/`, backs up `~/.claude/settings.json`
to `settings.json.bak`, and adds a `statusLine` entry. Restart Claude Code afterwards.

## Manual install (any OS)

1. Copy `statusline-meters.js` to `~/.claude/`.
2. Add to `~/.claude/settings.json`:
   ```json
   "statusLine": { "type": "command", "command": "node \"/full/path/to/.claude/statusline-meters.js\"", "padding": 0 }
   ```

## Notes

- 5 hour / weekly limits appear only on a Claude subscription (Pro/Max); otherwise they show `n/a`.
- Cost is a local estimate, not your bill.
- The script saves its last input to `~/.claude/statusline-last.json` for debugging.
