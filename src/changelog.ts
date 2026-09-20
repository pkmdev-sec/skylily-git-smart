/**
 * Changelog Generator
 * git-smart - Skylily 🌸
 *
 * Generates structured changelogs from git commit history,
 * following the Keep a Changelog format.
 *
 * @module changelog
 * @see https://keepachangelog.com/
 */

import { getCommitsSince, getLatestTag, getRecentCommits, GitCommit } from './git.js';

/**
 * A single entry in the changelog.
 */
export interface ChangelogEntry {
  /** Commit type (feat, fix, docs, etc.) */
  type: string;
  /** Optional scope from the commit */
  scope: string | null;
  /** The commit message subject */
  subject: string;
  /** Short commit hash for reference */
  hash: string;
  /** Commit author name */
  author: string;
  /** ISO 8601 date string */
  date: string;
}

/**
 * A section of the changelog grouped by type.
 */
export interface ChangelogSection {
  /** Section title (e.g., "Features", "Bug Fixes") */
  title: string;
  /** Emoji for visual decoration */
  emoji: string;
  /** Entries in this section */
  entries: ChangelogEntry[];
}

/**
 * The complete changelog structure.
 */
export interface Changelog {
  /** Version string (e.g., "1.2.0" or "Unreleased") */
  version: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Changelog sections grouped by type */
  sections: ChangelogSection[];
  /** Breaking change entries */
  breaking: ChangelogEntry[];
}

/**
 * Configuration for each commit type's changelog section.
 */
interface TypeSectionConfig {
  /** Display title for the section */
  title: string;
  /** Emoji prefix for visual flair */
  emoji: string;
  /** Sort order (lower = higher in changelog) */
  order: number;
}

// Map commit types to changelog sections
const TYPE_SECTIONS: Record<string, TypeSectionConfig> = {
  feat: { title: 'Features', emoji: '✨', order: 1 },
  fix: { title: 'Bug Fixes', emoji: '🐛', order: 2 },
  perf: { title: 'Performance', emoji: '⚡', order: 3 },
  refactor: { title: 'Refactoring', emoji: '♻️', order: 4 },
  docs: { title: 'Documentation', emoji: '📚', order: 5 },
  test: { title: 'Tests', emoji: '🧪', order: 6 },
  build: { title: 'Build', emoji: '📦', order: 7 },
  ci: { title: 'CI/CD', emoji: '🔧', order: 8 },
  chore: { title: 'Chores', emoji: '🧹', order: 9 },
  style: { title: 'Style', emoji: '💄', order: 10 },
};

/**
 * Parses a conventional commit message into its components.
 *
 * Supports formats:
 * - `type(scope)!: message` (breaking change with scope)
 * - `type!: message` (breaking change)
 * - `type(scope): message` (with scope)
 * - `type: message` (simple)
 *
 * @param subject - The commit subject line to parse
 * @returns Parsed components with type, scope, message, and breaking flag
 */
function parseCommitMessage(subject: string): {
  type: string;
  scope: string | null;
  message: string;
  breaking: boolean;
} {
  // Match: type(scope)!: message or type!: message or type(scope): message or type: message
  const match = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?\s*:\s*(.+)$/);

  if (match) {
    return {
      type: match[1].toLowerCase(),
      scope: match[2] || null,
      message: match[4],
      breaking: match[3] === '!',
    };
  }

  // Not conventional, treat as chore
  return {
    type: 'chore',
    scope: null,
    message: subject,
    breaking: false,
  };
}

/**
 * Converts git commits to changelog entries.
 *
 * @param commits - Array of git commits
 * @returns Object containing entries and breaking changes
 */
function commitsToEntries(commits: GitCommit[]): {
  entries: ChangelogEntry[];
  breaking: ChangelogEntry[];
} {
  const entries: ChangelogEntry[] = [];
  const breaking: ChangelogEntry[] = [];

  for (const commit of commits) {
    const parsed = parseCommitMessage(commit.subject);

    const entry: ChangelogEntry = {
      type: parsed.type,
      scope: parsed.scope,
      subject: parsed.message,
      hash: commit.shortHash,
      author: commit.author,
      date: commit.date,
    };

    if (parsed.breaking) {
      breaking.push(entry);
    }

    entries.push(entry);
  }

  return { entries, breaking };
}

/**
 * Groups changelog entries by commit type into sections.
 *
 * @param entries - Array of changelog entries
 * @returns Array of sections sorted by type order
 */
function groupBySections(entries: ChangelogEntry[]): ChangelogSection[] {
  const groups: Record<string, ChangelogEntry[]> = {};

  for (const entry of entries) {
    const type = entry.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(entry);
  }

  const sections: ChangelogSection[] = [];

  for (const [type, typeEntries] of Object.entries(groups)) {
    const config = TYPE_SECTIONS[type] || { title: type, emoji: '📝', order: 99 };
    sections.push({
      title: config.title,
      emoji: config.emoji,
      entries: typeEntries,
    });
  }

  // Sort by type order
  sections.sort((a, b) => {
    const aOrder = Object.values(TYPE_SECTIONS).find((s) => s.title === a.title)?.order || 99;
    const bOrder = Object.values(TYPE_SECTIONS).find((s) => s.title === b.title)?.order || 99;
    return aOrder - bOrder;
  });

  return sections;
}

/**
 * Generates a changelog from git commit history.
 *
 * If a tag exists, includes commits since the last tag.
 * Otherwise, includes the 50 most recent commits.
 *
 * @param version - Optional version string (defaults to "Unreleased")
 * @returns A {@link Changelog} object with sections and breaking changes
 *
 * @example
 * ```typescript
 * // Generate changelog for unreleased changes
 * const changelog = generateChangelog();
 *
 * // Generate changelog with a specific version
 * const release = generateChangelog('2.0.0');
 *
 * console.log(`${release.sections.length} sections`);
 * console.log(`${release.breaking.length} breaking changes`);
 * ```
 */
export function generateChangelog(version?: string): Changelog {
  const latestTag = getLatestTag();
  const commits = latestTag ? getCommitsSince(latestTag) : getRecentCommits(50);

  const { entries, breaking } = commitsToEntries(commits);
  const sections = groupBySections(entries);

  return {
    version: version || 'Unreleased',
    date: new Date().toISOString().split('T')[0],
    sections,
    breaking,
  };
}

/**
 * Formats a changelog as Markdown.
 *
 * Suitable for saving to CHANGELOG.md files.
 *
 * @param changelog - The changelog to format
 * @returns Markdown-formatted string
 *
 * @example
 * ```typescript
 * const changelog = generateChangelog('1.0.0');
 * const md = formatChangelogMarkdown(changelog);
 *
 * // Save to file
 * fs.writeFileSync('CHANGELOG.md', md);
 * ```
 */
export function formatChangelogMarkdown(changelog: Changelog): string {
  const lines: string[] = [];

  lines.push(`## ${changelog.version} (${changelog.date})`);
  lines.push('');

  // Breaking changes first
  if (changelog.breaking.length > 0) {
    lines.push('### ⚠️ Breaking Changes');
    lines.push('');
    for (const entry of changelog.breaking) {
      const scope = entry.scope ? `**${entry.scope}:** ` : '';
      lines.push(`- ${scope}${entry.subject} (${entry.hash})`);
    }
    lines.push('');
  }

  // Regular sections
  for (const section of changelog.sections) {
    if (section.entries.length === 0) continue;

    lines.push(`### ${section.emoji} ${section.title}`);
    lines.push('');

    for (const entry of section.entries) {
      const scope = entry.scope ? `**${entry.scope}:** ` : '';
      lines.push(`- ${scope}${entry.subject} (${entry.hash})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Formats a changelog as plain text.
 *
 * Suitable for terminal output.
 *
 * @param changelog - The changelog to format
 * @returns Plain text formatted string
 *
 * @example
 * ```typescript
 * const changelog = generateChangelog();
 * console.log(formatChangelogText(changelog));
 * ```
 */
export function formatChangelogText(changelog: Changelog): string {
  const lines: string[] = [];

  lines.push(`${changelog.version} (${changelog.date})`);
  lines.push('='.repeat(40));
  lines.push('');

  if (changelog.breaking.length > 0) {
    lines.push('BREAKING CHANGES:');
    for (const entry of changelog.breaking) {
      const scope = entry.scope ? `[${entry.scope}] ` : '';
      lines.push(`  • ${scope}${entry.subject}`);
    }
    lines.push('');
  }

  for (const section of changelog.sections) {
    if (section.entries.length === 0) continue;

    lines.push(`${section.title}:`);
    for (const entry of section.entries) {
      const scope = entry.scope ? `[${entry.scope}] ` : '';
      lines.push(`  • ${scope}${entry.subject}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Formats a changelog as JSON.
 *
 * Useful for programmatic consumption or storage.
 *
 * @param changelog - The changelog to format
 * @returns Pretty-printed JSON string
 *
 * @example
 * ```typescript
 * const changelog = generateChangelog();
 * const json = formatChangelogJson(changelog);
 *
 * // Parse and manipulate
 * const data = JSON.parse(json);
 * console.log(data.sections.length);
 * ```
 */
export function formatChangelogJson(changelog: Changelog): string {
  return JSON.stringify(changelog, null, 2);
}
