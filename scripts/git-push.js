#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

const fileToStage = 'App.tsx';
const commitMsg = process.argv.slice(2).join(' ') || `chore: update ${fileToStage} - ${new Date().toISOString()}`;

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    // rethrow to allow caller to see error
    throw err;
  }
}

if (!fs.existsSync(fileToStage)) {
  console.error(`File not found: ${fileToStage}`);
  process.exit(1);
}

try {
  // Stage the file
  run(`git add ${fileToStage}`);

  // Commit (if there are no changes, git will exit non-zero)
  try {
    run(`git commit -m "${commitMsg.replace(/\"/g, '\\\"')}"`);
  } catch (err) {
    console.log('No changes to commit or commit failed; continuing.');
  }

  // Push current branch to origin
  run('git push');
  console.log('Pushed changes to origin.');
} catch (err) {
  console.error('Failed to commit and push:', err.message || err);
  process.exit(1);
}
