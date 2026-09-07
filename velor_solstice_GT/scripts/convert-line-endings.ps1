#!/usr/bin/env pwsh
<#
Convert selected text files in the repository to CRLF line endings.
Usage: Run this script from the repository root in PowerShell (preferably PowerShell 7+):
  pwsh .\scripts\convert-line-endings.ps1
#>

$root = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
Set-Location $root

$excludeDirs = @('.git', 'node_modules', '.vs', '.idea')
$exts = @('.js','.jsx','.ts','.tsx','.json','.html','.htm','.css','.scss','.md','.txt','.vue','.yml','.yaml','.cs','.slnx','.csproj','.props','.xml','.ps1','.sh','.env','.bat','.sql','.dockerfile')

Write-Host "Scanning for files to convert to CRLF..."

Get-ChildItem -Path . -Recurse -File | ForEach-Object {
	$full = $_.FullName
	foreach ($d in $excludeDirs) {
		if ($full -like "*${d}*") { return }
	}

	if (-not ($exts -contains $_.Extension.ToLower())) { return }

	try {
		$bytes = [IO.File]::ReadAllBytes($full)
	} catch {
		Write-Warning "Skipping unreadable file: $full"
		return
	}

	if ($bytes -contains 0) {
		# binary file, skip
		return
	}

	try {
		$text = [System.Text.Encoding]::UTF8.GetString($bytes)
	} catch {
		# fallback to default reader
		try { $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $full } catch { Write-Warning "Failed to read $full"; return }
	}

	# Normalize: convert CRLF -> LF, then LF -> CRLF
	$normalized = $text -replace "\r\n", "\n"
	$crlf = $normalized -replace "\n", "\r\n"

	if ($crlf -ne $text) {
		try {
			[IO.File]::WriteAllText($full, $crlf, [System.Text.Encoding]::UTF8)
			Write-Host "Converted: $full"
		} catch {
			Write-Warning "Failed to write $full: $_"
		}
	}
}

Write-Host "Done. Review changes and commit with git add/commit." 
