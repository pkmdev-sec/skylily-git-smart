/**
 * Git utilities tests
 * git-smart - Skylily 🌸
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
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
} from '../src/git.js';

// Mock child_process
vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
  exec: vi.fn(),
}));

const mockExecSync = vi.mocked(execSync);

describe('git utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isGitRepo', () => {
    it('should return true when in a git repo', () => {
      mockExecSync.mockReturnValue(Buffer.from('.git'));
      expect(isGitRepo()).toBe(true);
    });

    it('should return false when not in a git repo', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });
      expect(isGitRepo()).toBe(false);
    });
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', () => {
      mockExecSync.mockReturnValue('main\n');
      expect(getCurrentBranch()).toBe('main');
    });

    it('should return "unknown" on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Not a git repo');
      });
      expect(getCurrentBranch()).toBe('unknown');
    });

    it('should handle feature branches', () => {
      mockExecSync.mockReturnValue('feature/add-auth\n');
      expect(getCurrentBranch()).toBe('feature/add-auth');
    });
  });

  describe('getStatus', () => {
    it('should parse staged files correctly', () => {
      mockExecSync
        .mockReturnValueOnce('main\n') // getCurrentBranch
        .mockReturnValueOnce('M  src/index.ts\nA  src/new.ts\n') // git status
        .mockReturnValueOnce('1\t2\n'); // ahead/behind

      const status = getStatus();
      expect(status.staged).toContain('src/index.ts');
      expect(status.staged).toContain('src/new.ts');
      expect(status.branch).toBe('main');
    });

    it('should parse modified but unstaged files', () => {
      mockExecSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce(' M src/index.ts\n')
        .mockReturnValueOnce('0\t0\n');

      const status = getStatus();
      expect(status.modified).toContain('src/index.ts');
      expect(status.staged).toHaveLength(0);
    });

    it('should parse untracked files', () => {
      mockExecSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('?? newfile.ts\n')
        .mockReturnValueOnce('0\t0\n');

      const status = getStatus();
      expect(status.untracked).toContain('newfile.ts');
    });

    it('should handle empty repo', () => {
      mockExecSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('')
        .mockImplementation(() => {
          throw new Error('No upstream');
        });

      const status = getStatus();
      expect(status.staged).toHaveLength(0);
      expect(status.modified).toHaveLength(0);
      expect(status.untracked).toHaveLength(0);
    });

    it('should parse ahead/behind counts', () => {
      mockExecSync
        .mockReturnValueOnce('main\n')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('3\t5\n');

      const status = getStatus();
      expect(status.behind).toBe(3);
      expect(status.ahead).toBe(5);
    });
  });

  describe('getStagedDiff', () => {
    it('should return staged diff', () => {
      const diff = '+console.log("hello")\n-console.log("world")';
      mockExecSync.mockReturnValue(diff);
      expect(getStagedDiff()).toBe(diff);
    });

    it('should return empty string on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('No changes');
      });
      expect(getStagedDiff()).toBe('');
    });
  });

  describe('getStagedStats', () => {
    it('should return diff stats', () => {
      const stats = ' src/index.ts | 10 +++++-----\n 1 file changed, 5 insertions(+), 5 deletions(-)';
      mockExecSync.mockReturnValue(stats);
      expect(getStagedStats()).toBe(stats);
    });

    it('should return empty string on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error();
      });
      expect(getStagedStats()).toBe('');
    });
  });

  describe('getRecentCommits', () => {
    it('should parse recent commits', () => {
      mockExecSync
        .mockReturnValueOnce('abc123|abc|John|john@test.com|2024-01-15|feat: add feature|body<<<END>>>')
        .mockReturnValueOnce('src/index.ts\n');

      const commits = getRecentCommits(1);
      expect(commits).toHaveLength(1);
      expect(commits[0].hash).toBe('abc123');
      expect(commits[0].shortHash).toBe('abc');
      expect(commits[0].author).toBe('John');
      expect(commits[0].subject).toBe('feat: add feature');
    });

    it('should return empty array on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error();
      });
      expect(getRecentCommits()).toEqual([]);
    });
  });

  describe('getCommitsSince', () => {
    it('should get commits since a ref', () => {
      mockExecSync.mockReturnValue('abc|ab|John|j@t.com|2024-01-15|fix: bug\ndef|de|Jane|jn@t.com|2024-01-14|feat: new');

      const commits = getCommitsSince('v1.0.0');
      expect(commits).toHaveLength(2);
      expect(commits[0].subject).toBe('fix: bug');
      expect(commits[1].subject).toBe('feat: new');
    });

    it('should return empty array on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error();
      });
      expect(getCommitsSince('v1.0.0')).toEqual([]);
    });
  });

  describe('getLatestTag', () => {
    it('should return latest tag', () => {
      mockExecSync.mockReturnValue('v1.2.3\n');
      expect(getLatestTag()).toBe('v1.2.3');
    });

    it('should return null when no tags exist', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('No tags');
      });
      expect(getLatestTag()).toBeNull();
    });

    it('should return null for empty output', () => {
      mockExecSync.mockReturnValue('');
      expect(getLatestTag()).toBeNull();
    });
  });

  describe('getTags', () => {
    it('should return list of tags', () => {
      mockExecSync.mockReturnValue('v2.0.0\nv1.0.0\nv0.1.0\n');
      const tags = getTags();
      expect(tags).toEqual(['v2.0.0', 'v1.0.0', 'v0.1.0']);
    });

    it('should return empty array on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error();
      });
      expect(getTags()).toEqual([]);
    });
  });

  describe('getRemoteUrl', () => {
    it('should return remote URL', () => {
      mockExecSync.mockReturnValue('https://github.com/user/repo.git\n');
      expect(getRemoteUrl()).toBe('https://github.com/user/repo.git');
    });

    it('should return null on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error();
      });
      expect(getRemoteUrl()).toBeNull();
    });
  });

  describe('parseRemoteUrl', () => {
    it('should parse SSH URLs', () => {
      const result = parseRemoteUrl('git@github.com:owner/repo.git');
      expect(result).toEqual({
        host: 'github.com',
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should parse HTTPS URLs', () => {
      const result = parseRemoteUrl('https://github.com/owner/repo.git');
      expect(result).toEqual({
        host: 'github.com',
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should parse URLs without .git suffix', () => {
      const result = parseRemoteUrl('https://github.com/owner/repo');
      expect(result).toEqual({
        host: 'github.com',
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should parse GitLab URLs', () => {
      const result = parseRemoteUrl('git@gitlab.com:company/project.git');
      expect(result).toEqual({
        host: 'gitlab.com',
        owner: 'company',
        repo: 'project',
      });
    });

    it('should return null for invalid URLs', () => {
      expect(parseRemoteUrl('invalid')).toBeNull();
      expect(parseRemoteUrl('')).toBeNull();
    });
  });

  describe('createCommit', () => {
    it('should create commit successfully', () => {
      mockExecSync.mockReturnValue('');
      expect(createCommit('feat: test')).toBe(true);
    });

    it('should return false on failure', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Commit failed');
      });
      expect(createCommit('feat: test')).toBe(false);
    });

    it('should escape double quotes in message', () => {
      mockExecSync.mockReturnValue('');
      createCommit('feat: add "quoted" text');
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('\\"quoted\\"'),
        expect.anything()
      );
    });
  });

  describe('getCommitFiles', () => {
    it('should return files for a commit', () => {
      mockExecSync.mockReturnValue('src/index.ts\nsrc/utils.ts\n');
      const files = getCommitFiles('abc123');
      expect(files).toEqual(['src/index.ts', 'src/utils.ts']);
    });

    it('should return empty array on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error();
      });
      expect(getCommitFiles('abc123')).toEqual([]);
    });
  });
});
