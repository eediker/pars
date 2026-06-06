# Pars Desktop UI

The desktop frontend for **Pars (Anatolian Leopard)**, built with Tauri, React, Vite, and TypeScript.

## Overview
This directory contains the desktop GUI component of the Pars agent. It interacts with the local Pars Daemon via a fast local server, giving you a visual, sleek *Cyber-Shamanism* themed interface to interact with your workspace.

## Development Setup

Make sure you have [Rust installed](https://www.rust-lang.org/tools/install) before proceeding, as Tauri requires it.

```bash
# Install dependencies
npm install

# Start the development server and open the Tauri app
npx tauri dev
```

## Running via CLI
The easiest way to launch the desktop app in your current workspace is through the globally installed `pars` CLI:

```bash
pars ui
# or
pars .
```

This will automatically spin up the daemon server and launch the Tauri window.
