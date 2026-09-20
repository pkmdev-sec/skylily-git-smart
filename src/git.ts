/**
 * Git Utilities
 * git-smart - Skylily 🌸
 *
 * Low-level git command wrappers for reading repository state.
 *
 * @module git
 */

import { execSync } from 'node:child_process';

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
export function isGitRepo(): boolean {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

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
export function getCurrentBranch(): string {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

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
export function getStatus(): GitStatus {
  const status: GitStatus = {
    staged: [],
    modified: [],
    untracked: [],
    branch: getCurrentBranch(),
    ahead: 0,
    behind: 0,
  };

  try {
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    for (const line of output.split('\n').filter(Boolean)) {
      const index = line[0];
      const worktree = line[1];
      const file = line.slice(3);

      if (index !== ' ' && index !== '?') {
        status.staged.push(file);
      }
      if (worktree === 'M') {
        status.modified.push(file);
      }
      if (index === '?') {
        status.untracked.push(file);
      }
    }

    // Get ahead/behind counts
    try {
      const tracking = execSync('git rev-list --left-right --count @{upstream}...HEAD 2>/dev/null', { encoding: 'utf8' });
      const [behind, ahead] = tracking.trim().split('\t').map(Number);
      status.behind = behind || 0;
      status.ahead = ahead || 0;
    } catch {
      // No upstream configured - this is fine
    }
  } catch {
    // Not a git repo or other error
  }

  return status;
}

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
export function getStagedDiff(): string {
  try {
    return execSync('git diff --cached', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } catch {
    return '';
  }
}

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
export function getStagedStats(): string {
  try {
    return execSync('git diff --cached --stat', { encoding: 'utf8' });
  } catch {
    return '';
  }
}

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
export function getRecentCommits(count: number = 10): GitCommit[] {
  const commits: GitCommit[] = [];

  try {
    const format = '%H|%h|%an|%ae|%aI|%s|%b<<<END>>>';
    const output = execSync(`git log -${count} --format="${format}"`, { encoding: 'utf8' });

    for (const entry of output.split('<<<END>>>').filter(Boolean)) {
      const [hash, shortHash, author, email, date, subject, ...bodyParts] = entry.trim().split('|');
      const body = bodyParts.join('|').trim();

      // Get files for this commit
      let files: string[] = [];
      try {
        const filesOutput = execSync(`git show --name-only --format="" ${hash}`, { encoding: 'utf8' });
        files = filesOutput.trim().split('\n').filter(Boolean);
      } catch {
        // Ignore file listing errors
      }

      commits.push({
        hash,
        shortHash,
        author,
        email,
        date,
        subject,
        body,
        files,
      });
    }
  } catch {
    // Return empty array on error
  }

  return commits;
}

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
export function getCommitsSince(ref: string): GitCommit[] {
  const commits: GitCommit[] = [];

  try {
    const format = '%H|%h|%an|%ae|%aI|%s';
    const output = execSync(`git log ${ref}..HEAD --format="${format}"`, { encoding: 'utf8' });

    for (const line of output.trim().split('\n').filter(Boolean)) {
      const [hash, shortHash, author, email, date, subject] = line.split('|');
      commits.push({
        hash,
        shortHash,
        author,
        email,
        date,
        subject,
        body: '',
        files: [],
      });
    }
  } catch {
    // Return empty array on error
  }

  return commits;
}

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
export function getLatestTag(): string | null {
  try {
    return execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

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
export function getTags(): string[] {
  try {
    return execSync('git tag --sort=-creatordate', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

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
export function getRemoteUrl(): string | null {
  try {
    return execSync('git remote get-url origin 2>/dev/null', { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

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
export function parseRemoteUrl(url: string): ParsedRemoteUrl | null {
  // SSH: git@github.com:owner/repo.git
  const sshMatch = url.match(/git@([^:]+):([^/]+)\/(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return { host: sshMatch[1], owner: sshMatch[2], repo: sshMatch[3] };
  }

  // HTTPS: https://github.com/owner/repo.git
  const httpsMatch = url.match(/https?:\/\/([^/]+)\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    return { host: httpsMatch[1], owner: httpsMatch[2], repo: httpsMatch[3] };
  }

  return null;
}

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
export function createCommit(message: string): boolean {
  try {
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

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
export function getCommitFiles(hash: string): string[] {
  try {
    return execSync(`git show --name-only --format="" ${hash}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}
