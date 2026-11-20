# Installs the usage status line for Claude Code (context, 5 hour, weekly bars).
# Usage:  powershell -ExecutionPolicy Bypass -File install.ps1

$ErrorActionPreference = 'Stop'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error 'Node.js is required (https://nodejs.org). Install it and run this again.'
}

$claudeDir = Join-Path $HOME '.claude'
New-Item -ItemType Directory -Force $claudeDir | Out-Null

$src = Join-Path $PSScriptRoot 'statusline-meters.js'
$dst = Join-Path $claudeDir 'statusline-meters.js'
Copy-Item $src $dst -Force
Write-Host "Copied script to $dst"

$settings = Join-Path $claudeDir 'settings.json'
if (Test-Path $settings) {
    Copy-Item $settings "$settings.bak" -Force
    Write-Host "Backed up settings to $settings.bak"
}

# Merge the statusLine entry with Node so existing settings are kept intact.
$merge = @'
const fs = require('fs')
const [file, script] = process.argv.slice(1)
let s = {}
try { s = JSON.parse(fs.readFileSync(file, 'utf8')) } catch {}
const q = String.fromCharCode(34)
s.statusLine = { type: 'command', command: 'node ' + q + script + q, padding: 0 }
fs.writeFileSync(file, JSON.stringify(s, null, 2) + '\n')
'@
node -e $merge $settings ($dst -replace '\\', '/')

Write-Host 'Done. Restart Claude Code (or send a message) to see the status line.'
