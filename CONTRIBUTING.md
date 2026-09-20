# Contributing to git-smart

First off, thank you for considering contributing to git-smart! 🎉

## Code of Conduct

Be kind, be respectful, be constructive. We're all here to build great software.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues. When creating a report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Environment** (Node.js version, OS, git version)
- **Code samples** if applicable

### Suggesting Features

Feature requests are welcome! Please:

- Check if the feature is already on the [roadmap](./README.md#-roadmap)
- Open an issue with the `feature` label
- Describe the problem you're trying to solve
- Propose your solution

### Pull Requests

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/skylily-git-smart.git`
3. **Create a branch**: `git checkout -b feature/your-feature`
4. **Install dependencies**: `npm install`
5. **Make your changes**
6. **Add tests** for new functionality
7. **Run tests**: `npm test`
8. **Commit** using conventional commits (use `git-smart commit`! 😉)
9. **Push**: `git push origin feature/your-feature`
10. **Open a PR** against `main`

## Development Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run dev
npm run test:watch
```

## Coding Standards

### TypeScript

- Use strict TypeScript
- Export types for public APIs
- Add JSDoc comments for exported functions
- Avoid `any` types

### Testing

- Write tests for all new functionality
- Maintain >80% coverage
- Use descriptive test names
- Mock external dependencies (git commands)

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

Examples:
```
feat(commit): add support for custom types
fix(changelog): handle repos without tags
docs: update API reference
test(git): add edge case tests
```

### Code Style

- 2-space indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline

## Project Structure

```
src/
├── index.ts        # Public exports
├── git.ts          # Git command wrappers
├── commit.ts       # Commit message logic
├── changelog.ts    # Changelog generation
└── cli.ts          # CLI implementation

tests/
├── git.test.ts
├── commit.test.ts
└── changelog.test.ts

examples/
└── *.ts            # Usage examples
```

## Adding New Features

### New Commit Type Detection

1. Add pattern to `TYPE_PATTERNS` in `src/commit.ts`
2. Add type mapping to `TYPE_SECTIONS` in `src/changelog.ts` (if needed)
3. Add tests in `tests/commit.test.ts`

### New Git Utility

1. Add function to `src/git.ts`
2. Export from `src/index.ts`
3. Add tests in `tests/git.test.ts`
4. Document in README

## Release Process

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push to npm

## Questions?

Open an issue with the `question` label or reach out on GitHub.

---

Thank you for contributing! 🌸
