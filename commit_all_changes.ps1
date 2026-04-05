# Identify all changes (Staged, Unstaged, Untracked, and Deleted)
$changes = git status --porcelain | ForEach-Object {
    # Extract filename from status line (taking second part after the status flags)
    $line = $_.Trim()
    $file = $line.Substring(3)
    # Handle cases where path might have quotes or arrows (renames)
    if ($file -match " -> ") {
        $file = ($file -split " -> ")[1]
    }
    $file.Trim('"')
} | Select-Object -Unique

Write-Host "Found $($changes.Count) changes to commit individually..." -ForegroundColor Cyan

foreach ($file in $changes) {
    if (Test-Path $file -PathType Leaf) {
        Write-Host "Committing: $file" -ForegroundColor Yellow
        git add $file
        git commit -m "Refactor: Update $file for Astro conversion"
    } elseif (Test-Path $file -PathType Container) {
        # If it's a directory (untracked ones might show up this way)
        Write-Host "Adding Directory: $file" -ForegroundColor Yellow
        git add "$file"
        git commit -m "Refactor: Add directory $file"
    } else {
        # Likely a deletion
        Write-Host "Committing Deletion: $file" -ForegroundColor Red
        git rm --cached $file | Out-Null
        git add -u $file
        git commit -m "Cleanup: Remove $file (refactored/moved)"
    }
}

Write-Host "All individual commits complete! You can now push manually." -ForegroundColor Green
