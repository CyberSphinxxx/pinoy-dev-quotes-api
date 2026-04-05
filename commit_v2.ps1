# Robustly identify all changes
$status_lines = git status --porcelain

Write-Host "Analyzing $($status_lines.Count) remaining changes..." -ForegroundColor Cyan

foreach ($line in $status_lines) {
    if ($line.Trim() -eq "") { continue }

    # Extract the file path (everything after the first 3 characters)
    # Porcelain format: XY path or XY "quoted path" or XY path1 -> path2
    $status = $line.Substring(0, 2)
    $file = $line.Substring(3).Trim('"')

    # Handle Renames (e.g., path1 -> path2)
    if ($file -match " -> ") {
        $file = ($file -split " -> ")[1].Trim('"')
    }

    if ($status -match "D") {
        # File was deleted
        Write-Host "Committing Deletion: $file" -ForegroundColor Red
        git rm --cached $file | Out-Null
        git add -u $file
        git commit -m "Cleanup: Remove $file" | Out-Null
    } else {
        # File was added or modified
        Write-Host "Committing Change: $file" -ForegroundColor Yellow
        git add "$file"
        git commit -m "Refactor: Update $file for Astro conversion" | Out-Null
    }
}

Write-Host "`nFinal Check:" -ForegroundColor Cyan
git status --short

Write-Host "`nAll commits finished! You're ready to push." -ForegroundColor Green
