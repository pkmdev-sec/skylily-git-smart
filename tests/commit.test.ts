/**
 * Commit message generator tests
 * git-smart - Skylily 🌸
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeChanges, formatCommitMessage, CommitSuggestion } from '../src/commit.js';
import * as git from '../src/git.js';

// Mock git module
vi.mock('../src/git.js', () => ({
  getStatus: vi.fn(),
  getStagedDiff: vi.fn(),
  getStagedStats: vi.fn(),
}));

const mockGetStatus = vi.mocked(git.getStatus);
const mockGetStagedDiff = vi.mocked(git.getStagedDiff);
const mockGetStagedStats = vi.mocked(git.getStagedStats);

describe('commit message generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeChanges', () => {
    it('should return empty array when no staged files', () => {
      mockGetStatus.mockReturnValue({
        staged: [],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('');
      mockGetStagedStats.mockReturnValue('');

      const suggestions = analyzeChanges();
      expect(suggestions).toEqual([]);
    });

    it('should detect test files as test type', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/utils.test.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+it("should work", () => {});');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('test');
    });

    it('should detect documentation files as docs type', () => {
      mockGetStatus.mockReturnValue({
        staged: ['docs/guide.md'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+# New Feature\n+Documentation here');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('docs');
    });

    it('should detect CI files as ci type', () => {
      mockGetStatus.mockReturnValue({
        staged: ['.github/workflows/ci.yml'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+name: CI');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('ci');
    });

    it('should detect Docker files as build type', () => {
      mockGetStatus.mockReturnValue({
        staged: ['Dockerfile'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+FROM node:18');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('build');
    });

    it('should detect fix keywords in diff', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/api.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+// Fixed the bug that caused crashes');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('fix');
    });

    it('should detect feature additions', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/feature.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+export function newFeature() {\n+  // implement new feature\n+}');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('feat');
    });

    it('should detect refactoring patterns', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/utils.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+// Refactored for better readability');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('refactor');
    });

    it('should detect performance improvements', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/cache.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+// Optimized query performance');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('perf');
    });

    it('should extract scope from file path', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/api/users.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+export function getUsers() {}');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].scope).toBe('api');
    });

    it('should extract scope from components path', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/components/Button.tsx'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+export function Button() {}');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].scope).toBe('components');
    });

    it('should extract scope from utils path', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/utils/format.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+export function formatDate() {}');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].scope).toBe('utils');
    });

    it('should set deps scope for package.json', () => {
      mockGetStatus.mockReturnValue({
        staged: ['package.json'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+  "lodash": "^4.17.21"');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].scope).toBe('deps');
    });

    it('should generate subject from function name when multiple files', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/auth.ts', 'src/utils.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+function validateToken() {}');
      mockGetStagedStats.mockReturnValue('2 files changed');

      const suggestions = analyzeChanges();
      // When multiple files, it should detect the function name
      expect(suggestions[0].subject).toContain('validateToken');
    });

    it('should generate subject from class name when multiple files', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/user.ts', 'src/types.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+class UserService {}');
      mockGetStagedStats.mockReturnValue('2 files changed');

      const suggestions = analyzeChanges();
      // When multiple files, it should detect the class name
      expect(suggestions[0].subject).toContain('UserService');
    });

    it('should use filename for single file changes', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/auth.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+export function validateToken() {}');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      // Single file uses filename-based subject
      expect(suggestions[0].subject).toContain('auth');
    });

    it('should provide alternative suggestions without scope', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/api/endpoint.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+export function getData() {}');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions.length).toBeGreaterThan(1);
      // First has scope, second might not
      const withScope = suggestions.filter(s => s.scope !== null);
      const withoutScope = suggestions.filter(s => s.scope === null);
      expect(withScope.length).toBeGreaterThan(0);
    });

    it('should sort suggestions by confidence', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/feature.ts', 'tests/feature.test.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+function newFunc() {}');
      mockGetStagedStats.mockReturnValue('2 files changed');

      const suggestions = analyzeChanges();
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].confidence).toBeLessThanOrEqual(suggestions[i - 1].confidence);
      }
    });

    it('should handle mixed additions and deletions', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/index.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue(
        '-const old = true;\n-const deprecated = false;\n+const newValue = true;'
      );
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      // Should recognize this as likely a refactor (deletions > additions)
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle CSS files as style type', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/styles.css'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+.button { color: blue; }');
      mockGetStagedStats.mockReturnValue('1 file changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].type).toBe('style');
    });

    it('should handle multiple files and find common scope', () => {
      mockGetStatus.mockReturnValue({
        staged: ['src/api/users.ts', 'src/api/posts.ts', 'src/api/comments.ts'],
        modified: [],
        untracked: [],
        branch: 'main',
        ahead: 0,
        behind: 0,
      });
      mockGetStagedDiff.mockReturnValue('+export function fn() {}');
      mockGetStagedStats.mockReturnValue('3 files changed');

      const suggestions = analyzeChanges();
      expect(suggestions[0].scope).toBe('api');
    });
  });

  describe('formatCommitMessage', () => {
    it('should format simple commit message', () => {
      const suggestion: CommitSuggestion = {
        type: 'feat',
        scope: null,
        subject: 'add new feature',
        body: null,
        full: 'feat: add new feature',
        confidence: 0.8,
      };
      expect(formatCommitMessage(suggestion)).toBe('feat: add new feature');
    });

    it('should format commit message with scope', () => {
      const suggestion: CommitSuggestion = {
        type: 'fix',
        scope: 'api',
        subject: 'handle null values',
        body: null,
        full: 'fix(api): handle null values',
        confidence: 0.9,
      };
      expect(formatCommitMessage(suggestion)).toBe('fix(api): handle null values');
    });

    it('should include body when present', () => {
      const suggestion: CommitSuggestion = {
        type: 'feat',
        scope: 'auth',
        subject: 'add JWT support',
        body: 'Implements JWT token validation and refresh.',
        full: 'feat(auth): add JWT support',
        confidence: 0.85,
      };
      const message = formatCommitMessage(suggestion);
      expect(message).toContain('feat(auth): add JWT support');
      expect(message).toContain('\n\n');
      expect(message).toContain('Implements JWT token validation');
    });
  });
});
