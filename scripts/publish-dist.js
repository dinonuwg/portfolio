#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repo = execSync('git config --get remote.origin.url').toString().trim();
if (!repo) {
  console.error('No remote origin found.');
  process.exit(1);
}

const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error('dist directory not found. Run the build/export step first.');
  process.exit(1);
}

try {
  execSync('git init -b gh-pages', { cwd: distPath, stdio: 'inherit' });
  execSync('git add -A', { cwd: distPath, stdio: 'inherit' });
  execSync('git commit -m "Publish dist" || true', { cwd: distPath, stdio: 'inherit' });
  execSync(`git remote add origin ${repo}`, { cwd: distPath, stdio: 'inherit' });
  execSync('git push -f origin gh-pages', { cwd: distPath, stdio: 'inherit' });
  // remove the temporary git metadata
  execSync('rm -rf .git', { cwd: distPath, stdio: 'inherit' });
  console.log('Published dist to gh-pages');
} catch (err) {
  console.error('Publish failed:', err.message || err);
  process.exit(1);
}
