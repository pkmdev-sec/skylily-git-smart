/**
 * Error classes tests
 * git-smart - Skylily 🌸
 */

import { describe, it, expect } from 'vitest';
import {
  GitSmartError,
  NotAGitRepoError,
  NoStagedChangesError,
  GitCommandError,
  CommitError,
  ChangelogError,
} from '../src/errors.js';

describe('error classes', () => {
  describe('GitSmartError', () => {
    it('should be an instance of Error', () => {
      const error = new GitSmartError('test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(GitSmartError);
    });

    it('should have correct name', () => {
      const error = new GitSmartError('test');
      expect(error.name).toBe('GitSmartError');
    });

    it('should have correct message', () => {
      const error = new GitSmartError('test message');
      expect(error.message).toBe('test message');
    });
  });

  describe('NotAGitRepoError', () => {
    it('should have default message', () => {
      const error = new NotAGitRepoError();
      expect(error.message).toBe('Not a git repository');
      expect(error.name).toBe('NotAGitRepoError');
    });

    it('should include path in message', () => {
      const error = new NotAGitRepoError('/some/path');
      expect(error.message).toBe('Not a git repository: /some/path');
    });

    it('should be instance of GitSmartError', () => {
      const error = new NotAGitRepoError();
      expect(error).toBeInstanceOf(GitSmartError);
    });
  });

  describe('NoStagedChangesError', () => {
    it('should have helpful message', () => {
      const error = new NoStagedChangesError();
      expect(error.message).toContain('No staged changes');
      expect(error.message).toContain('git add');
      expect(error.name).toBe('NoStagedChangesError');
    });
  });

  describe('GitCommandError', () => {
    it('should store command and exit code', () => {
      const error = new GitCommandError('git status', 'failed', 128);
      expect(error.command).toBe('git status');
      expect(error.exitCode).toBe(128);
      expect(error.message).toContain('failed');
      expect(error.name).toBe('GitCommandError');
    });

    it('should handle null exit code', () => {
      const error = new GitCommandError('git push', 'timeout', null);
      expect(error.exitCode).toBeNull();
    });
  });

  describe('CommitError', () => {
    it('should include commit context', () => {
      const error = new CommitError('hook failed');
      expect(error.message).toContain('commit');
      expect(error.message).toContain('hook failed');
      expect(error.name).toBe('CommitError');
    });
  });

  describe('ChangelogError', () => {
    it('should include changelog context', () => {
      const error = new ChangelogError('no commits');
      expect(error.message).toContain('Changelog');
      expect(error.message).toContain('no commits');
      expect(error.name).toBe('ChangelogError');
    });
  });
});
