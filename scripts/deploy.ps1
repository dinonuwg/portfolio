param(
  [string]$repoName = "D-Portfolio",
  [string]$owner = "dinonuwg"
)

Write-Host "Deploy helper: will attempt to create repo '$owner/$repoName' and push to 'main'."

function Run-Command($cmd) {
  Write-Host "=> $cmd"
  & pwsh -NoProfile -Command $cmd
}

if (Get-Command gh -ErrorAction SilentlyContinue) {
  Write-Host "Found GitHub CLI 'gh' — creating repo and pushing."
  gh repo create $owner/$repoName --public --confirm
  if (-not (Test-Path .git)) {
    git init
  }
  git add .
  git commit -m "Initial commit" -q
  git branch -M main
  git remote add origin https://github.com/$owner/$repoName.git -f
  git push -u origin main
  Write-Host "Pushed to https://github.com/$owner/$repoName — GitHub Actions will deploy to GitHub Pages on main push."
} else {
  Write-Host "GitHub CLI 'gh' not found. Please run the manual steps from README.md or install 'gh' (https://cli.github.com/)."
  Write-Host "Manual steps (PowerShell):"
  Write-Host "git init"
  Write-Host "git add ."
  Write-Host "git commit -m 'Initial commit'"
  Write-Host "git remote add origin https://github.com/$owner/$repoName.git"
  Write-Host "git branch -M main"
  Write-Host "git push -u origin main"
}

Write-Host "Done."
