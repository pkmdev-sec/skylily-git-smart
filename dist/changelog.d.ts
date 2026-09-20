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
export declare function generateChangelog(version?: string): Changelog;
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
export declare function formatChangelogMarkdown(changelog: Changelog): string;
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
export declare function formatChangelogText(changelog: Changelog): string;
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
export declare function formatChangelogJson(changelog: Changelog): string;
//# sourceMappingURL=changelog.d.ts.map