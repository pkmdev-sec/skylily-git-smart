/**
 * Git Utilities
 * git-smart - Skylily 🌸
 *
 * Low-level git command wrappers for reading repository state.
 *
 * @module git
 */
/**
 * Represents the current status of a git repository.
 */
export interface GitStatus {
    /** Files staged for commit */
    staged: string[];
    /** Modified but not staged files */
    modified: string[];
    /** Untracked files */
    untracked: string[];
    /** Current branch name */
    branch: string;
    /** Number of commits ahead of upstream */
    ahead: number;
    /** Number of commits behind upstream */
    behind: number;
}
/**
 * Represents a single git commit with metadata.
 */
export interface GitCommit {
    /** Full commit hash (40 characters) */
    hash: string;
    /** Short commit hash (7 characters) */
    shortHash: string;
    /** Author name */
    author: string;
    /** Author email */
    email: string;
    /** ISO 8601 date string */
    date: string;
    /** Commit subject (first line) */
    subject: string;
    /** Commit body (remaining lines) */
    body: string;
    /** Files changed in this commit */
    files: string[];
}
/**
 * Checks if the current directory is inside a git repository.
 *
 * @returns `true` if in a git repository, `false` otherwise
 *
 * @example
 * ```typescript
 * if (!isGitRepo()) {
 *   console.error('Not a git repository');
 *   process.exit(1);
 * }
 * ```
 */
export declare function isGitRepo(): boolean;
/**
 * Gets the name of the current git branch.
 *
 * @returns The current branch name, or `'unknown'` if detection fails
 *
 * @example
 * ```typescript
 * const branch = getCurrentBranch();
 * console.log(`On branch: ${branch}`);
 * ```
 */
export declare function getCurrentBranch(): string;
/**
 * Gets the complete status of the git repository.
 *
 * Includes staged files, modified files, untracked files,
 * current branch, and ahead/behind counts relative to upstream.
 *
 * @returns A {@link GitStatus} object with repository state
 *
 * @example
 * ```typescript
 * const status = getStatus();
 * console.log(`${status.staged.length} files staged`);
 * console.log(`${status.ahead} commits ahead of origin`);
 * ```
 */
export declare function getStatus(): GitStatus;
/**
 * Gets the full diff of staged changes.
 *
 * Returns the unified diff format output for all staged files.
 * Useful for analyzing what changes will be committed.
 *
 * @returns The diff string, or empty string if no staged changes or error
 *
 * @example
 * ```typescript
 * const diff = getStagedDiff();
 * const additions = (diff.match(/^\+[^+]/gm) || []).length;
 * console.log(`${additions} lines added`);
 * ```
 */
export declare function getStagedDiff(): string;
/**
 * Gets statistics about staged changes.
 *
 * Returns a summary showing files changed, insertions, and deletions.
 *
 * @returns The diff stats string, or empty string on error
 *
 * @example
 * ```typescript
 * const stats = getStagedStats();
 * // " 3 files changed, 42 insertions(+), 10 deletions(-)"
 * ```
 */
export declare function getStagedStats(): string;
/**
 * Gets recent commits from the repository.
 *
 * @param count - Number of commits to retrieve (default: 10)
 * @returns Array of {@link GitCommit} objects, newest first
 *
 * @example
 * ```typescript
 * const commits = getRecentCommits(5);
 * commits.forEach(c => {
 *   console.log(`${c.shortHash} ${c.subject}`);
 * });
 * ```
 */
export declare function getRecentCommits(count?: number): GitCommit[];
/**
 * Gets commits since a specific reference (tag, commit, branch).
 *
 * @param ref - Git reference to start from (exclusive)
 * @returns Array of {@link GitCommit} objects since the reference
 *
 * @example
 * ```typescript
 * const newCommits = getCommitsSince('v1.0.0');
 * console.log(`${newCommits.length} commits since v1.0.0`);
 * ```
 */
export declare function getCommitsSince(ref: string): GitCommit[];
/**
 * Gets the most recent tag in the repository.
 *
 * @returns The latest tag name, or `null` if no tags exist
 *
 * @example
 * ```typescript
 * const tag = getLatestTag();
 * if (tag) {
 *   console.log(`Latest release: ${tag}`);
 * }
 * ```
 */
export declare function getLatestTag(): string | null;
/**
 * Gets all tags in the repository, sorted by creation date.
 *
 * @returns Array of tag names, newest first
 *
 * @example
 * ```typescript
 * const tags = getTags();
 * console.log(`${tags.length} releases`);
 * ```
 */
export declare function getTags(): string[];
/**
 * Gets the URL of the 'origin' remote.
 *
 * @returns The remote URL, or `null` if not configured
 *
 * @example
 * ```typescript
 * const url = getRemoteUrl();
 * // "git@github.com:user/repo.git"
 * ```
 */
export declare function getRemoteUrl(): string | null;
/**
 * Parsed components of a git remote URL.
 */
export interface ParsedRemoteUrl {
    /** The host (e.g., 'github.com', 'gitlab.com') */
    host: string;
    /** The repository owner or organization */
    owner: string;
    /** The repository name */
    repo: string;
}
/**
 * Parses a git remote URL into its components.
 *
 * Supports both SSH and HTTPS URL formats:
 * - SSH: `git@github.com:owner/repo.git`
 * - HTTPS: `https://github.com/owner/repo.git`
 *
 * @param url - The git remote URL to parse
 * @returns Parsed components, or `null` if URL format is not recognized
 *
 * @example
 * ```typescript
 * const parsed = parseRemoteUrl('git@github.com:user/project.git');
 * // { host: 'github.com', owner: 'user', repo: 'project' }
 * ```
 */
export declare function parseRemoteUrl(url: string): ParsedRemoteUrl | null;
/**
 * Creates a git commit with the given message.
 *
 * @param message - The commit message
 * @returns `true` if commit succeeded, `false` otherwise
 *
 * @example
 * ```typescript
 * if (createCommit('feat: add new feature')) {
 *   console.log('Committed successfully!');
 * }
 * ```
 */
export declare function createCommit(message: string): boolean;
/**
 * Gets the list of files changed in a specific commit.
 *
 * @param hash - The commit hash (full or short)
 * @returns Array of file paths changed in the commit
 *
 * @example
 * ```typescript
 * const files = getCommitFiles('abc1234');
 * console.log(`${files.length} files changed`);
 * ```
 */
export declare function getCommitFiles(hash: string): string[];
//# sourceMappingURL=git.d.ts.map