# GitHub Copilot Instructions for PasswordMaker

## Project Overview

PasswordMaker is a mobile app (Android & iOS) and web application for generating secure, deterministic, unique-per-site passwords. Built with Ionic Framework and Angular, it uses Capacitor for native platform integration.

## Tech Stack

- **Framework**: Angular 21+ with Ionic 8+
- **Language**: TypeScript 5.9+
- **Mobile**: Capacitor 7 (iOS & Android)
- **Testing**: Karma + Jasmine (unit tests), WebdriverIO (e2e tests)
- **Build**: Angular CLI, Ionic CLI
- **Node**: >=22.10, npm >=10

## Development Commands

### Setup
```bash
npm install
npm install -g @ionic/cli  # If new to Ionic
```

### Running
```bash
ionic serve  # Run locally in browser
npm start    # Alternative: ng serve
```

### Testing
```bash
npm run test        # Unit tests with watch mode
npm run test:once   # Unit tests single run
npm run e2e         # End-to-end tests
npm run ci          # Full CI suite (lint + test + e2e)
```

### Linting
```bash
npm run lint        # Check code quality
npm run lint:fix    # Auto-fix linting issues
```

### Building
```bash
npm run build                              # Web build
ionic capacitor build android --prod       # Android build
ionic capacitor build ios --prod           # iOS build
```

## Code Style & Conventions

### TypeScript/JavaScript
- Use **single quotes** for strings (allow template literals and escape avoidance)
- **2-space indentation** (enforced by ESLint)
- Follow **@angular-eslint** recommended rules
- Use Angular's **inject()** function for dependency injection (modern pattern)
- Use **standalone: false** for components (legacy module-based architecture)
- Prefer **async/await** over promise chains

### Angular Patterns
- Components use `@Component` decorator with `standalone: false`
- Services use dependency injection via `inject()` function
- Platform-specific code should check: `this.platform.is('capacitor')`
- Initialize services in `initializeApp()` lifecycle method

### File Organization
- Components: `*.component.ts`, `*.component.html`, `*.component.spec.ts`
- Services: `*.service.ts`, `*.service.spec.ts`
- Pages (Ionic): `*.page.ts`, `*.page.html`, `*.page.spec.ts`
- Tests: Co-located with source files using `.spec.ts` suffix

## Testing Guidelines

- Write unit tests for all services and components
- Use Jasmine syntax: `describe`, `it`, `expect`
- Mock dependencies using Jasmine spies
- E2E tests use WebdriverIO with Chromium
- Run tests before committing: `npm run test:once`

## Security Considerations

- This is a **password management app** - security is paramount
- Never log or expose passwords in plaintext
- Follow secure coding practices for cryptographic operations
- Report security issues to passwordmaker@webful.uk (not GitHub issues)
- The app uses deterministic password generation (no server storage)

## Dependencies

- **Add dependencies carefully** - this is a security-sensitive app
- Use `npm install` for package management
- Check compatibility with Capacitor/Cordova plugins
- Consider mobile platform implications (iOS & Android)

## Build & Platform Notes

- **Capacitor** is the primary mobile runtime
- **Cordova** is used only for Cloud Settings plugin
- Clipboard features work on mobile but not in browser
- Target browsers: Chrome >=89, Firefox >=75, Safari >=14, iOS >=14
- Set version codes in platform-specific files before building:
  - Android: `android/app/build.gradle`
  - iOS: `ios/App/App.xcodeproj/project.pbxproj`

## Common Tasks

### Adding a new feature
1. Create/update components in `src/app/`
2. Add tests alongside implementation
3. Update routing if needed (`app-routing.module.ts`)
4. Test locally with `ionic serve`
5. Run full test suite: `npm run ci`

### Fixing bugs
1. Write a failing test first (if possible)
2. Make minimal changes to fix the issue
3. Ensure all tests pass: `npm run test:once`
4. Verify linting: `npm run lint`

### Updating dependencies
1. Check compatibility with Angular/Ionic versions
2. Test thoroughly on both mobile platforms
3. Update package.json and package-lock.json
4. Document any breaking changes

## Helpful Context

- The app has been around since before Angular standalone components
- Uses Ionic Storage for local data persistence
- Supports import/export of settings (LGPL-3.0 licensed code)
- Core password generation logic is in separate library: `@webful/passwordmaker-lib`
- Most code is GPL-3.0 licensed (except import/export: LGPL-3.0)

## Documentation

- Main README: [Readme.md](../Readme.md)
- Development guide: [doc/Development.md](../doc/Development.md)
- Security policy: [SECURITY.md](../SECURITY.md)
- License: [LICENSE](../LICENSE) (GPL-3.0-or-later)
