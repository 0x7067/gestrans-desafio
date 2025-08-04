# Gestrans Desafio

Task management app built with Expo Router, React Native, and TanStack Query. Includes offline caching, form validation, and a small mocked API layer with tests.

## Requirements
- Node 18+
- npm 9+
- Xcode (iOS) / Android Studio (Android)

## Install
```
npm install
```

## Run (Dev)
```
npx expo start
```
Open in iOS simulator, Android emulator, or Expo Go.

## Test
```
npm test
```

## Structure
- app/: routes (index, tasks, task-form)
- components/: UI primitives (Button, Input, TaskItem, etc.)
- hooks/: data + UI hooks (queries, forms, validation)
- services/: API client
- __tests__/: unit/integration tests

## Scripts
- npm run lint: lint with Biome
- npm test: run Jest

## Notes
- Uses TanStack Query with infinite lists and offline support
- Validation utilities in constants/validation.ts and hooks/useTaskValidation.ts
- Sorting and error helpers in utils/
