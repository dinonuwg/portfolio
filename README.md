# D-Portfolio

A React Native portfolio website for dinonuwg, built with Expo for web support.

## Features

- Inverted color scheme (black background, white text)
- Placeholder square images
- Sections: About, Projects, Contact
- Interests: Programming, UI Design, Software Development
- GitHub: [github.com/dinonuwg](https://github.com/dinonuwg)
- Contact: Email and Discord

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the web server:
   ```bash
   npm run web
   ```

3. Open [http://localhost:19006](http://localhost:19006) in your browser.

## Technologies

- React Native
- Expo
- TypeScript

## Build & Deploy to GitHub Pages

Recommended flow (PowerShell):

1) Create a new repository on GitHub under the account `dinonuwg` named `D-Portfolio` (or another name).

2) Locally, initialize git (if not already), add remote, and push:

```powershell
# make sure you're in the project root
git init
git add .
git commit -m "Initial commit"
# replace the URL if you chose a different repo name
git remote add origin https://github.com/dinonuwg/D-Portfolio.git
git branch -M main
git push -u origin main
```

3) The included GitHub Actions workflow at `.github/workflows/deploy.yml` will run on push to `main` and deploy the static web build to the `gh-pages` branch automatically.

Notes:
- The workflow uses `npx expo export:web --output-dir dist` to produce a static `dist` folder that gets deployed.
- You can also build locally with `npx expo export:web --output-dir dist` and verify the `dist` folder before pushing.
- If you prefer full automation (creating the remote repo and pushing for you), I can prepare a small script — you'll need to provide a GitHub personal access token (PAT) or perform the remote creation yourself.