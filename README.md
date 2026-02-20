# Maanasa Narayan - Portfolio

This repository contains the source code for [Maanasa's personal portfolio website](https://maanasanarayan.github.io).

## Repository Structure

- `/maanasa`: The React frontend application powered by Vite.
- `/.github/workflows`: GitHub Actions CI/CD workflows for automated deployment to GitHub Pages.

## Local Development

The project uses [Bun](https://bun.sh/) for dependency management. To run the site locally:

1. `cd maanasa`
2. `bun install`
3. `bun run dev`

The local dev server will start instantly (usually at `http://localhost:5174` or `5173`).

## Deployment

The site is automatically built and deployed via GitHub Actions whenever changes are pushed to the `main` branch.
