# 🧠 git-smart

[![npm version](https://img.shields.io/npm/v/skylily-git-smart.svg)](https://www.npmjs.com/package/skylily-git-smart)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-97%25-brightgreen.svg)]()

**AI-powered git commit messages, changelogs, and PR discovery.**

Built by Skylily 🌸 | Zero dependencies | TypeScript-first

---

## ✨ Features

- 🎯 **Smart Commit Messages** - Analyzes staged changes and generates [Conventional Commits](https://www.conventionalcommits.org/)
- 📋 **Changelog Generation** - Creates beautiful changelogs from commit history
- 🔍 **Pattern Recognition** - Detects commit type and scope from file paths and diff content
- 🚀 **Zero Config** - Works out of the box with sensible defaults
- 📦 **Dual Interface** - CLI for quick use, API for integration
- 🔒 **Type Safe** - Full TypeScript support with exported types

---

## 📦 Installation

```bash
# Global installation (recommended for CLI)
npm install -g skylily-git-smart

# Local installation (for API usage)
npm install skylily-git-smart

# Or use directly with npx
npx skylily-git-smart commit
```

---

## 🚀 Quick Start

### CLI Usage

```bash
# Stage your changes
git add .

# Generate and select a commit message
git-smart commit

# Auto-accept the best suggestion
git-smart commit -y

# Generate a changelog
git-smart changelog

# Output changelog as markdown
git-smart changelog --md > CHANGELOG.md
```

### API Usage

```typescript
import { analyzeChanges, generateChangelog } from 'skylily-git-smart';

// Get commit suggestions
const suggestions = analyzeChanges();
console.log(suggestions[0].full);
// → "feat(api): add user endpoint"

// Generate changelog
const changelog = generateChangelog('1.2.0');
console.log(changelog.sections);
```

---

## 📖 CLI Reference

### `git-smart commit`

Analyzes staged changes and suggests semantic commit messages.

```bash
$ git add src/api/users.ts
$ git-smart commit

🧠 git-smart commit

Analyzing 1 staged file(s)...

Suggestions:

  1. feat(api): add users
     ██████████ 85% confidence

  2. feat: add users
     ████████░░ 68% confidence

Select (1-2), enter custom, or 'q' to quit: 1

✓ Committed: feat(api): add users
```

#### Options

| Flag | Description |
|------|-------------|
| `-y`, `--yes` | Auto-accept the first (highest confidence) suggestion |
| `-h`, `--help` | Show help message |

#### How Detection Works

1. **File Patterns** - Test files → `test:`, docs → `docs:`, CI → `ci:`
2. **Diff Analysis** - Scans for keywords like "fix", "add", "refactor"
3. **Path Extraction** - Derives scope from directory structure
4. **Code Parsing** - Detects function/class names for subjects

### `git-smart changelog`

Generates a changelog from commits since the last git tag.

```bash
$ git-smart changelog

🧠 git-smart changelog

Unreleased (2024-01-28)
========================================

Features:
  • [api] add user authentication endpoint
  • [ui] add login form component

Bug Fixes:
  • [auth] fix token expiration handling

Documentation:
  • update API documentation
```

#### Options

| Flag | Description |
|------|-------------|
| `--md`, `--markdown` | Output as Markdown |
| `--json` | Output as JSON |
| `-v`, `--version <ver>` | Set version string in output |

---

## 📚 API Reference

### Commit Analysis

#### `analyzeChanges(): CommitSuggestion[]`

Analyzes staged git changes and returns commit message suggestions.

```typescript
import { analyzeChanges, CommitSuggestion } from 'skylily-git-smart';

const suggestions: CommitSuggestion[] = analyzeChanges();

// CommitSuggestion structure:
interface CommitSuggestion {
  type: string;       // 'feat', 'fix', 'docs', etc.
  scope: string | null;  // Detected scope or null
  subject: string;    // The commit subject line
  body: string | null;   // Optional body text
  full: string;       // Complete formatted message
  confidence: number; // 0-1 confidence score
}
```

#### `formatCommitMessage(suggestion: CommitSuggestion): string`

Formats a suggestion into a complete commit message string.

```typescript
import { analyzeChanges, formatCommitMessage } from 'skylily-git-smart';

const [best] = analyzeChanges();
const message = formatCommitMessage(best);
// → "feat(api): add user endpoint"
```

### Changelog Generation

#### `generateChangelog(version?: string): Changelog`

Generates a changelog from commits since the last tag.

```typescript
import { generateChangelog, Changelog } from 'skylily-git-smart';

const changelog: Changelog = generateChangelog('2.0.0');

// Changelog structure:
interface Changelog {
  version: string;           // "2.0.0" or "Unreleased"
  date: string;              // "2024-01-28"
  sections: ChangelogSection[];
  breaking: ChangelogEntry[];
}

interface ChangelogSection {
  title: string;   // "Features", "Bug Fixes", etc.
  emoji: string;   // "✨", "🐛", etc.
  entries: ChangelogEntry[];
}

interface ChangelogEntry {
  type: string;
  scope: string | null;
  subject: string;
  hash: string;
  author: string;
  date: string;
}
```

#### Format Functions

```typescript
import {
  generateChangelog,
  formatChangelogMarkdown,
  formatChangelogText,
  formatChangelogJson
} from 'skylily-git-smart';

const changelog = generateChangelog();

// Markdown format (for CHANGELOG.md)
const md = formatChangelogMarkdown(changelog);

// Plain text (for terminal)
const text = formatChangelogText(changelog);

// JSON (for programmatic use)
const json = formatChangelogJson(changelog);
```

### Git Utilities

Low-level git utilities for building custom workflows:

```typescript
import {
  isGitRepo,
  getCurrentBranch,
  getStatus,
  getStagedDiff,
  getStagedStats,
  getRecentCommits,
  getCommitsSince,
  getLatestTag,
  getTags,
  getRemoteUrl,
  parseRemoteUrl,
  createCommit,
  getCommitFiles,
} from 'skylily-git-smart';

// Check if in a git repository
if (!isGitRepo()) {
  console.error('Not a git repository');
  process.exit(1);
}

// Get current branch
const branch = getCurrentBranch();
// → "main"

// Get repository status
const status = getStatus();
// → { staged: [...], modified: [...], untracked: [...], branch: "main", ahead: 0, behind: 0 }

// Get staged changes
const diff = getStagedDiff();
const stats = getStagedStats();

// Get commit history
const recent = getRecentCommits(10);
const sincTag = getCommitsSince('v1.0.0');

// Get tags
const latest = getLatestTag();  // → "v1.2.3" or null
const allTags = getTags();      // → ["v1.2.3", "v1.2.2", ...]

// Parse remote URL
const url = getRemoteUrl();
const parsed = parseRemoteUrl(url);
// → { host: "github.com", owner: "user", repo: "project" }

// Create a commit
const success = createCommit('feat: add feature');
```

---

## 🏷️ Commit Types

git-smart recognizes these [Conventional Commit](https://www.conventionalcommits.org/) types:

| Type | Emoji | Description |
|------|-------|-------------|
| `feat` | ✨ | A new feature |
| `fix` | 🐛 | A bug fix |
| `docs` | 📚 | Documentation only changes |
| `style` | 💄 | Code style (formatting, etc.) |
| `refactor` | ♻️ | Code refactoring |
| `perf` | ⚡ | Performance improvement |
| `test` | 🧪 | Adding or fixing tests |
| `build` | 📦 | Build system / dependencies |
| `ci` | 🔧 | CI/CD configuration |
| `chore` | 🧹 | Other changes |
| `revert` | ⏪ | Reverting a commit |

### Breaking Changes

Breaking changes are detected via the `!` marker:

```
feat(api)!: change response format
```

These are highlighted separately in changelogs.

---

## 📂 Project Structure

```
skylily-git-smart/
├── src/
│   ├── index.ts        # Main exports
│   ├── git.ts          # Git utilities
│   ├── commit.ts       # Commit message generation
│   ├── changelog.ts    # Changelog generation
│   └── cli.ts          # CLI entry point
├── tests/
│   ├── git.test.ts
│   ├── commit.test.ts
│   └── changelog.test.ts
├── examples/
│   ├── basic-usage.ts
│   ├── changelog-generation.ts
│   ├── git-utilities.ts
│   └── custom-workflow.ts
├── dist/               # Compiled output
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🔧 Configuration

git-smart works with zero configuration. It automatically:

- Detects the repository root
- Finds the latest tag for changelog generation
- Identifies file types and patterns

### Future Configuration (Planned)

```javascript
// .git-smartrc.js (coming soon)
module.exports = {
  types: {
    custom: 'Custom commit type',
  },
  scopes: {
    patterns: [
      { pattern: /^lib\//, scope: 'core' },
    ],
  },
};
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

Coverage target: **80%+** (current: ~97%)

---

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/pkmdev-sec/skylily-git-smart.git
cd skylily-git-smart

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Test your changes
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit with a semantic message (`git-smart commit` 😉)
6. Push and open a PR

---

## 📋 Roadmap

- [x] Basic commit message generation
- [x] Changelog generation
- [x] CLI interface
- [x] TypeScript support
- [x] Comprehensive test suite
- [ ] AI-enhanced suggestions (LLM integration)
- [ ] Find related PRs (`git-smart related`)
- [ ] Interactive changelog editing
- [ ] GitHub/GitLab API integration
- [ ] Custom commit type mappings
- [ ] Git hooks integration
- [ ] VS Code extension

---

## 📄 License

MIT © [Skylily 🌸](https://github.com/pkmdev-sec)

---

## 🙏 Acknowledgments

- [Conventional Commits](https://www.conventionalcommits.org/) for the commit message spec
- The open source community for inspiration

---

<p align="center">
  Built with 💜 by <strong>Skylily 🌸</strong><br>
  <em>Part of the Perpetual Creator Protocol - always building, never stopping.</em>
</p>
