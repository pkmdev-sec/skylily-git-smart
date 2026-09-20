/**
 * Custom Error Classes
 * git-smart - Skylily 🌸
 *
 * Provides structured error types for better error handling.
 */

/**
 * Base error class for git-smart errors
 */
export class GitSmartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitSmartError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Error thrown when not in a git repository
 */
export class NotAGitRepoError extends GitSmartError {
  constructor(path?: string) {
    super(path ? `Not a git repository: ${path}` : 'Not a git repository');
    this.name = 'NotAGitRepoError';
  }
}

/**
 * Error thrown when there are no staged changes
 */
export class NoStagedChangesError extends GitSmartError {
  constructor() {
    super('No staged changes. Stage files with `git add` first.');
    this.name = 'NoStagedChangesError';
  }
}

/**
 * Error thrown when a git command fails
 */
export class GitCommandError extends GitSmartError {
  public readonly command: string;
  public readonly exitCode: number | null;

  constructor(command: string, message: string, exitCode: number | null = null) {
    super(`Git command failed: ${message}`);
    this.name = 'GitCommandError';
    this.command = command;
    this.exitCode = exitCode;
  }
}

/**
 * Error thrown when commit creation fails
 */
export class CommitError extends GitSmartError {
  constructor(message: string) {
    super(`Failed to create commit: ${message}`);
    this.name = 'CommitError';
  }
}

/**
 * Error thrown when changelog generation fails
 */
export class ChangelogError extends GitSmartError {
  constructor(message: string) {
    super(`Changelog generation failed: ${message}`);
    this.name = 'ChangelogError';
  }
}
