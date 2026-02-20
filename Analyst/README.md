# 🌱 Analyst — Electron + React App

A small Electron + React application scaffolded from Create React App and adapted for desktop use. This repository houses the UI (`src`) and the Electron main process (`src/electron.js`) so you can run the app in both web and desktop environments.

---

## Quick Overview

- **Main entry (Electron)**: `src/electron.js`
- **Web UI**: React app under `src/`
- **Build target**: `build/` (web) and packaged Electron app via `electron-builder`
- **Scripts**: `start`, `build`, `test`, `electron`, `package`

## Features

- Desktop-ready React UI (Electron)
- Easy local development: hot-reload for React and Electron helper scripts
- Unit testing with Jest / React Testing Library
- Packaging support via `electron-builder`

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourorg/GreenPrompt.git
cd GreenPrompt/Analyst
npm install
```

## Development

Run the web UI (Create React App development server):

```bash
npm start
```

Run Electron (development mode):

```bash
npm run electron
```

Notes:

- `npm start` starts the React dev server at http://localhost:3000.
- `npm run electron` uses `nodemon` + `electron` to restart the app when Electron main files change.

## Scripts (most important)

- `npm start` — Run React dev server
- `npm run electron` — Start Electron for development
- `npm run build` — Build React app for production
- `npm run package` — Package the Electron app (uses `electron-builder`)
- `npm test` — Run tests

See `package.json` for the full list of scripts and configuration.

## Project Structure

```
Analyst/
├─ package.json          # scripts + build config
├─ public/               # static web assets
├─ src/
│  ├─ electron.js        # Electron main process
│  ├─ index.js           # React entry
│  ├─ App.jsx
│  └─ components/        # React components
└─ README.md
```

## Architecture & How It Works

1. React provides the renderer (UI) in `src/`.
2. Electron's `src/electron.js` boots a BrowserWindow and loads the web bundle (or the dev server during development).
3. IPC channels may be used (if implemented) to communicate between renderer and main process for native functionality.

## Testing

Run unit tests with:

```bash
npm test
```

This project uses Jest and React Testing Library. See `src/App.test.js` for examples.

## Building & Packaging

Build the React production bundle:

```bash
npm run build
```

Package the Electron app (platform-specific configuration is in `package.json` under `build`):

```bash
npm run package
```

Check `package.json` `build` section to configure `appID`, icons, and platform options.

## Contributing

Contributions welcome — please follow these steps:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Install dependencies and run tests
4. Open a Pull Request with a clear description

## Notes & Tips

- On Windows you may need to run `npm run electron` from PowerShell with appropriate permissions.
- If packaging fails due to native code, ensure your Node/Electron versions are compatible and consult `electron-builder` docs.

## License

This project is released under the MIT License. See the `LICENSE` file in the repository root.

---

If you'd like, I can also add a short `QUICKSTART.md` for running Electron locally and a `BUILD.md` for packaging notes.
