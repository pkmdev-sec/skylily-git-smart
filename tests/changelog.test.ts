/**
 * Changelog generator tests
 * git-smart - Skylily 🌸
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateChangelog,
  formatChangelogMarkdown,
  formatChangelogText,
  formatChangelogJson,
  Changelog,
  ChangelogSection,
} from '../src/changelog.js';
import * as git from '../src/git.js';

// Mock git module
vi.mock('../src/git.js', () => ({
  getLatestTag: vi.fn(),
  getCommitsSince: vi.fn(),
  getRecentCommits: vi.fn(),
}));

const mockGetLatestTag = vi.mocked(git.getLatestTag);
const mockGetCommitsSince = vi.mocked(git.getCommitsSince);
const mockGetRecentCommits = vi.mocked(git.getRecentCommits);

describe('changelog generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateChangelog', () => {
    it('should generate changelog from commits since tag', () => {
      mockGetLatestTag.mockReturnValue('v1.0.0');
      mockGetCommitsSince.mockReturnValue([
        {
          hash: 'abc123',
          shortHash: 'abc',
          author: 'John',
          email: 'john@test.com',
          date: '2024-01-15',
          subject: 'feat(api): add user endpoint',
          body: '',
          files: [],
        },
        {
          hash: 'def456',
          shortHash: 'def',
          author: 'Jane',
          email: 'jane@test.com',
          date: '2024-01-14',
          subject: 'fix: handle null values',
          body: '',
          files: [],
        },
      ]);

      const changelog = generateChangelog();

      expect(changelog.version).toBe('Unreleased');
      expect(changelog.sections.length).toBeGreaterThan(0);

      const featSection = changelog.sections.find(s => s.title === 'Features');
      const fixSection = changelog.sections.find(s => s.title === 'Bug Fixes');

      expect(featSection).toBeDefined();
      expect(featSection?.entries[0].subject).toBe('add user endpoint');
      expect(fixSection).toBeDefined();
      expect(fixSection?.entries[0].subject).toBe('handle null values');
    });

    it('should use custom version when provided', () => {
      mockGetLatestTag.mockReturnValue('v1.0.0');
      mockGetCommitsSince.mockReturnValue([]);

      const changelog = generateChangelog('2.0.0');
      expect(changelog.version).toBe('2.0.0');
    });

    it('should use recent commits when no tag exists', () => {
      mockGetLatestTag.mockReturnValue(null);
      mockGetRecentCommits.mockReturnValue([
        {
          hash: 'abc123',
          shortHash: 'abc',
          author: 'John',
          email: 'john@test.com',
          date: '2024-01-15',
          subject: 'feat: initial commit',
          body: '',
          files: [],
        },
      ]);

      const changelog = generateChangelog();
      expect(mockGetRecentCommits).toHaveBeenCalledWith(50);
    });

    it('should parse conventional commit messages', () => {
      mockGetLatestTag.mockReturnValue('v1.0.0');
      mockGetCommitsSince.mockReturnValue([
        {
          hash: 'abc',
          shortHash: 'ab',
          author: 'Dev',
          email: 'dev@test.com',
          date: '2024-01-15',
          subject: 'refactor(core): improve code structure',
          body: '',
          files: [],
        },
      ]);

      const changelog = generateChangelog();
      const refactorSection = changelog.sections.find(s => s.title === 'Refactoring');
      expect(refactorSection).toBeDefined();
      expect(refactorSection?.entries[0].scope).toBe('core');
    });

    it('should detect breaking changes', () => {
      mockGetLatestTag.mockReturnValue('v1.0.0');
      mockGetCommitsSince.mockReturnValue([
        {
          hash: 'abc',
          shortHash: 'ab',
          author: 'Dev',
          email: 'dev@test.com',
          date: '2024-01-15',
          subject: 'feat(api)!: change response format',
          body: '',
          files: [],
        },
      ]);

      const changelog = generateChangelog();
      expect(changelog.breaking).toHaveLength(1);
      expect(changelog.breaking[0].subject).toBe('change response format');
    });

    it('should handle non-conventional commits as chore', () => {
      mockGetLatestTag.mockReturnValue('v1.0.0');
      mockGetCommitsSince.mockReturnValue([
        {
          hash: 'abc',
          shortHash: 'ab',
          author: 'Dev',
          email: 'dev@test.com',
          date: '2024-01-15',
          subject: 'Updated readme file',
          body: '',
          files: [],
        },
      ]);

      const changelog = generateChangelog();
      const choreSection = changelog.sections.find(s => s.title === 'Chores');
      expect(choreSection).toBeDefined();
    });

    it('should sort sections by type order', () => {
      mockGetLatestTag.mockReturnValue('v1.0.0');
      mockGetCommitsSince.mockReturnValue([
        { hash: 'a', shortHash: 'a', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'chore: cleanup', body: '', files: [] },
        { hash: 'b', shortHash: 'b', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'feat: add feature', body: '', files: [] },
        { hash: 'c', shortHash: 'c', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'fix: bug fix', body: '', files: [] },
        { hash: 'd', shortHash: 'd', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'docs: update docs', body: '', files: [] },
      ]);

      const changelog = generateChangelog();
      const titles = changelog.sections.map(s => s.title);

      // Features should come before Bug Fixes, which should come before Documentation
      const featIndex = titles.indexOf('Features');
      const fixIndex = titles.indexOf('Bug Fixes');
      const docsIndex = titles.indexOf('Documentation');
      const choreIndex = titles.indexOf('Chores');

      expect(featIndex).toBeLessThan(fixIndex);
      expect(fixIndex).toBeLessThan(docsIndex);
      expect(docsIndex).toBeLessThan(choreIndex);
    });

    it('should handle all commit types', () => {
      mockGetLatestTag.mockReturnValue('v1.0.0');
      mockGetCommitsSince.mockReturnValue([
        { hash: 'a', shortHash: 'a', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'perf: optimize query', body: '', files: [] },
        { hash: 'b', shortHash: 'b', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'test: add tests', body: '', files: [] },
        { hash: 'c', shortHash: 'c', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'build: update deps', body: '', files: [] },
        { hash: 'd', shortHash: 'd', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'ci: fix pipeline', body: '', files: [] },
        { hash: 'e', shortHash: 'e', author: 'D', email: 'd@t.com', date: '2024-01-15', subject: 'style: format code', body: '', files: [] },
      ]);

      const changelog = generateChangelog();
      const titles = changelog.sections.map(s => s.title);

      expect(titles).toContain('Performance');
      expect(titles).toContain('Tests');
      expect(titles).toContain('Build');
      expect(titles).toContain('CI/CD');
      expect(titles).toContain('Style');
    });
  });

  describe('formatChangelogMarkdown', () => {
    const sampleChangelog: Changelog = {
      version: '1.2.0',
      date: '2024-01-15',
      sections: [
        {
          title: 'Features',
          emoji: '✨',
          entries: [
            { type: 'feat', scope: 'api', subject: 'add user endpoint', hash: 'abc', author: 'John', date: '2024-01-15' },
            { type: 'feat', scope: null, subject: 'add search', hash: 'def', author: 'Jane', date: '2024-01-14' },
          ],
        },
        {
          title: 'Bug Fixes',
          emoji: '🐛',
          entries: [
            { type: 'fix', scope: 'auth', subject: 'fix token expiry', hash: 'ghi', author: 'Bob', date: '2024-01-13' },
          ],
        },
      ],
      breaking: [],
    };

    it('should format as markdown with version header', () => {
      const md = formatChangelogMarkdown(sampleChangelog);
      expect(md).toContain('## 1.2.0 (2024-01-15)');
    });

    it('should include section headers with emoji', () => {
      const md = formatChangelogMarkdown(sampleChangelog);
      expect(md).toContain('### ✨ Features');
      expect(md).toContain('### 🐛 Bug Fixes');
    });

    it('should format entries with scope', () => {
      const md = formatChangelogMarkdown(sampleChangelog);
      expect(md).toContain('**api:** add user endpoint (abc)');
      expect(md).toContain('**auth:** fix token expiry (ghi)');
    });

    it('should format entries without scope', () => {
      const md = formatChangelogMarkdown(sampleChangelog);
      expect(md).toContain('- add search (def)');
    });

    it('should include breaking changes section', () => {
      const changelogWithBreaking: Changelog = {
        ...sampleChangelog,
        breaking: [
          { type: 'feat', scope: 'api', subject: 'change response format', hash: 'xyz', author: 'Dev', date: '2024-01-15' },
        ],
      };
      const md = formatChangelogMarkdown(changelogWithBreaking);
      expect(md).toContain('### ⚠️ Breaking Changes');
      expect(md).toContain('change response format');
    });
  });

  describe('formatChangelogText', () => {
    const sampleChangelog: Changelog = {
      version: '1.2.0',
      date: '2024-01-15',
      sections: [
        {
          title: 'Features',
          emoji: '✨',
          entries: [
            { type: 'feat', scope: 'api', subject: 'add user endpoint', hash: 'abc', author: 'John', date: '2024-01-15' },
          ],
        },
      ],
      breaking: [],
    };

    it('should format as plain text with header', () => {
      const text = formatChangelogText(sampleChangelog);
      expect(text).toContain('1.2.0 (2024-01-15)');
      expect(text).toContain('='.repeat(40));
    });

    it('should use bullet points', () => {
      const text = formatChangelogText(sampleChangelog);
      expect(text).toContain('• [api] add user endpoint');
    });

    it('should include section titles', () => {
      const text = formatChangelogText(sampleChangelog);
      expect(text).toContain('Features:');
    });

    it('should include breaking changes', () => {
      const changelogWithBreaking: Changelog = {
        ...sampleChangelog,
        breaking: [
          { type: 'feat', scope: null, subject: 'major change', hash: 'xyz', author: 'Dev', date: '2024-01-15' },
        ],
      };
      const text = formatChangelogText(changelogWithBreaking);
      expect(text).toContain('BREAKING CHANGES:');
      expect(text).toContain('major change');
    });
  });

  describe('formatChangelogJson', () => {
    it('should return valid JSON', () => {
      const changelog: Changelog = {
        version: '1.0.0',
        date: '2024-01-15',
        sections: [],
        breaking: [],
      };
      const json = formatChangelogJson(changelog);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include all changelog data', () => {
      const changelog: Changelog = {
        version: '1.0.0',
        date: '2024-01-15',
        sections: [
          {
            title: 'Features',
            emoji: '✨',
            entries: [
              { type: 'feat', scope: 'api', subject: 'test', hash: 'abc', author: 'Dev', date: '2024-01-15' },
            ],
          },
        ],
        breaking: [],
      };
      const json = formatChangelogJson(changelog);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe('1.0.0');
      expect(parsed.date).toBe('2024-01-15');
      expect(parsed.sections).toHaveLength(1);
      expect(parsed.sections[0].title).toBe('Features');
    });

    it('should be pretty-printed', () => {
      const changelog: Changelog = {
        version: '1.0.0',
        date: '2024-01-15',
        sections: [],
        breaking: [],
      };
      const json = formatChangelogJson(changelog);
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });
  });
});
