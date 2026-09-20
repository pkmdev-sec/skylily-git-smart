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
import { getCommitsSince, getLatestTag, getRecentCommits } from './git.js';
// Map commit types to changelog sections
const TYPE_SECTIONS = {
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
function parseCommitMessage(subject) {
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
function commitsToEntries(commits) {
    const entries = [];
    const breaking = [];
    for (const commit of commits) {
        const parsed = parseCommitMessage(commit.subject);
        const entry = {
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
function groupBySections(entries) {
    const groups = {};
    for (const entry of entries) {
        const type = entry.type;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(entry);
    }
    const sections = [];
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
export function generateChangelog(version) {
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
export function formatChangelogMarkdown(changelog) {
    const lines = [];
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
        if (section.entries.length === 0)
            continue;
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
export function formatChangelogText(changelog) {
    const lines = [];
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
        if (section.entries.length === 0)
            continue;
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
export function formatChangelogJson(changelog) {
    return JSON.stringify(changelog, null, 2);
}
//# sourceMappingURL=changelog.js.map