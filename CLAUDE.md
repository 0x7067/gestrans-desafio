# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a React Native/Expo project called "gestrans-desafio" using Expo Router for file-based navigation. The project is configured for cross-platform development (iOS, Android, Web) with TypeScript support.

## Development Commands

### Project Setup
```bash
npm install                    # Install dependencies
```

### Development
```bash
npm start                      # Start Expo development server
expo start                     # Alternative way to start dev server
npm run android               # Start on Android emulator
npm run ios                   # Start on iOS simulator
npm run web                   # Start web version
```

### Code Quality
```bash
npm run lint                  # Run ESLint with Expo config
```

### Project Reset
```bash
npm run reset-project         # Move starter code to app-example/ and create blank app/
```

## Architecture

### File-Based Routing
The project uses Expo Router with file-based routing in the `app/` directory:
- `app/_layout.tsx` - Root layout component using Stack navigation
- `app/index.tsx` - Home screen component
- Routes are automatically generated based on file structure in `app/`

### Configuration
- **Expo Config**: `app.json` contains app metadata, build settings, and plugin configuration
- **TypeScript**: Extends Expo's base tsconfig with path aliases (`@/*` maps to `./`)
- **ESLint**: Uses Expo's flat config with standard rules
- **Commitizen**: Configured for conventional commits

### Key Dependencies
- **Expo SDK ~53.0**: Core framework and utilities
- **React 19.0**: UI framework
- **React Native 0.79**: Native platform bridge
- **Expo Router ~5.1**: File-based navigation
- **React Navigation**: Bottom tabs and navigation elements

### Platform Support
- iOS (with tablet support)
- Android (with adaptive icons and edge-to-edge display)
- Web (using Metro bundler with static output)

### Development Features
- New Architecture enabled
- Typed routes experiment enabled
- Automatic UI style (light/dark mode support)