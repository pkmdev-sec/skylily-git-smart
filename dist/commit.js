/**
 * Commit Message Generator
 * git-smart - Skylily 🌸
 *
 * Analyzes staged changes and generates semantic commit messages
 * following the Conventional Commits specification.
 *
 * @module commit
 * @see https://www.conventionalcommits.org/
 */
import { getStagedDiff, getStagedStats, getStatus } from './git.js';
/**
 * Conventional commit types with descriptions.
 * Used for documentation and validation.
 */
export const COMMIT_TYPES = {
    feat: 'A new feature',
    fix: 'A bug fix',
    docs: 'Documentation only changes',
    style: 'Changes that do not affect the meaning of the code',
    refactor: 'A code change that neither fixes a bug nor adds a feature',
    perf: 'A code change that improves performance',
    test: 'Adding missing tests or correcting existing tests',
    build: 'Changes that affect the build system or external dependencies',
    ci: 'Changes to CI configuration files and scripts',
    chore: 'Other changes that do not modify src or test files',
    revert: 'Reverts a previous commit',
};
// File patterns to detect scope
const SCOPE_PATTERNS = [
    { pattern: /^src\/components\//, scope: 'components' },
    { pattern: /^src\/api\//, scope: 'api' },
    { pattern: /^src\/utils?\//, scope: 'utils' },
    { pattern: /^src\/hooks?\//, scope: 'hooks' },
    { pattern: /^src\/lib\//, scope: 'lib' },
    { pattern: /^src\/services?\//, scope: 'services' },
    { pattern: /^src\/stores?\//, scope: 'store' },
    { pattern: /^tests?\//, scope: 'tests' },
    { pattern: /^docs?\//, scope: 'docs' },
    { pattern: /^\.github\//, scope: 'ci' },
    { pattern: /^config\//, scope: 'config' },
    { pattern: /package\.json$/, scope: 'deps' },
    { pattern: /Dockerfile/, scope: 'docker' },
    { pattern: /\.md$/, scope: 'docs' },
];
// File patterns to detect commit type
const TYPE_PATTERNS = [
    // Docs
    { pattern: /README|CHANGELOG|\.md$/i, type: 'docs', weight: 3 },
    { pattern: /(?:^|\/)docs?\//i, type: 'docs', weight: 5 },
    // Tests
    { pattern: /\.test\.|\.spec\.|__tests__/i, type: 'test', weight: 5 },
    { pattern: /(?:^|\/)tests?\//i, type: 'test', weight: 4 },
    // CI/Build
    { pattern: /\.github\/workflows|\.gitlab-ci|Jenkinsfile/i, type: 'ci', weight: 5 },
    { pattern: /Dockerfile|docker-compose|\.dockerignore/i, type: 'build', weight: 4 },
    { pattern: /package\.json|yarn\.lock|package-lock/i, type: 'build', weight: 2 },
    { pattern: /webpack|rollup|vite\.config|tsconfig/i, type: 'build', weight: 3 },
    // Style
    { pattern: /\.css$|\.scss$|\.less$|\.styled\./i, type: 'style', weight: 3 },
    { pattern: /\.eslint|\.prettier|\.editorconfig/i, type: 'style', weight: 2 },
    // Chore
    { pattern: /\.gitignore|\.env\.example|LICENSE/i, type: 'chore', weight: 2 },
];
// Diff content patterns to detect type
const DIFF_PATTERNS = [
    // Fix indicators
    { pattern: /fix(es|ed)?[\s:]/i, type: 'fix', weight: 3 },
    { pattern: /bug|issue|error|crash|broken/i, type: 'fix', weight: 2 },
    // Feature indicators
    { pattern: /add(s|ed|ing)?[\s:]/i, type: 'feat', weight: 2 },
    { pattern: /implement(s|ed|ing)?[\s:]/i, type: 'feat', weight: 3 },
    { pattern: /new feature|feature:/i, type: 'feat', weight: 4 },
    // Refactor indicators
    { pattern: /refactor(s|ed|ing)?[\s:]/i, type: 'refactor', weight: 4 },
    { pattern: /rename(s|d)?[\s:]/i, type: 'refactor', weight: 2 },
    { pattern: /move(s|d)?[\s:]/i, type: 'refactor', weight: 2 },
    { pattern: /extract(s|ed)?[\s:]/i, type: 'refactor', weight: 3 },
    // Performance indicators
    { pattern: /perf(ormance)?|optimiz(e|ation)|speed|faster/i, type: 'perf', weight: 4 },
    { pattern: /cache|memo(ize)?|lazy/i, type: 'perf', weight: 2 },
];
/**
 * Detects the commit type from files and diff content.
 *
 * @param files - List of staged file paths
 * @param diff - The staged diff content
 * @returns Object with detected type and confidence score
 */
function detectType(files, diff) {
    const scores = {};
    // Score from file patterns
    for (const file of files) {
        for (const { pattern, type, weight } of TYPE_PATTERNS) {
            if (pattern.test(file)) {
                scores[type] = (scores[type] || 0) + weight;
            }
        }
    }
    // Score from diff content
    for (const { pattern, type, weight } of DIFF_PATTERNS) {
        if (pattern.test(diff)) {
            scores[type] = (scores[type] || 0) + weight;
        }
    }
    // Default to feat if no clear signal
    if (Object.keys(scores).length === 0) {
        // Check if mostly additions vs deletions
        const additions = (diff.match(/^\+[^+]/gm) || []).length;
        const deletions = (diff.match(/^-[^-]/gm) || []).length;
        if (additions > deletions * 2) {
            return { type: 'feat', confidence: 0.5 };
        }
        else if (deletions > additions * 2) {
            return { type: 'refactor', confidence: 0.5 };
        }
        return { type: 'chore', confidence: 0.3 };
    }
    // Find highest score
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [type, score] = entries[0];
    const totalScore = entries.reduce((sum, [, s]) => sum + s, 0);
    const confidence = Math.min(0.9, score / totalScore + 0.2);
    return { type, confidence };
}
/**
 * Detects the scope from file paths.
 *
 * Looks for common directory patterns and extracts meaningful scope.
 *
 * @param files - List of staged file paths
 * @returns Detected scope, or null if none found
 */
function detectScope(files) {
    const scopes = {};
    for (const file of files) {
        for (const { pattern, scope } of SCOPE_PATTERNS) {
            if (pattern.test(file)) {
                scopes[scope] = (scopes[scope] || 0) + 1;
            }
        }
    }
    if (Object.keys(scopes).length === 0) {
        // Try to extract from common path
        const dirs = files.map((f) => f.split('/').slice(0, -1).join('/'));
        const commonDir = findCommonPrefix(dirs);
        if (commonDir && commonDir.length > 0) {
            const parts = commonDir.split('/').filter(Boolean);
            if (parts.length > 0) {
                return parts[parts.length - 1];
            }
        }
        return null;
    }
    // Return most common scope
    const entries = Object.entries(scopes).sort((a, b) => b[1] - a[1]);
    return entries[0][0];
}
/**
 * Finds the common prefix of an array of strings.
 */
function findCommonPrefix(strings) {
    if (strings.length === 0)
        return '';
    if (strings.length === 1)
        return strings[0];
    const sorted = strings.slice().sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    let i = 0;
    while (i < first.length && first[i] === last[i]) {
        i++;
    }
    return first.slice(0, i);
}
/**
 * Generates a subject line from the diff and files.
 *
 * @param files - List of staged file paths
 * @param diff - The staged diff content
 * @param type - The detected commit type
 * @returns Generated subject line
 */
function generateSubject(files, diff, type) {
    // If single file, use filename
    if (files.length === 1) {
        const filename = files[0].split('/').pop()?.replace(/\.[^.]+$/, '') || 'file';
        const action = type === 'feat' ? 'add' : type === 'fix' ? 'fix' : type === 'refactor' ? 'refactor' : 'update';
        return `${action} ${filename}`;
    }
    // Check for common patterns in diff
    const functionMatch = diff.match(/^\+.*function\s+(\w+)/m);
    if (functionMatch && type === 'feat') {
        return `add ${functionMatch[1]} function`;
    }
    const classMatch = diff.match(/^\+.*class\s+(\w+)/m);
    if (classMatch && type === 'feat') {
        return `add ${classMatch[1]} class`;
    }
    const exportMatch = diff.match(/^\+export\s+(?:const|function|class)\s+(\w+)/m);
    if (exportMatch) {
        return `${type === 'feat' ? 'add' : 'update'} ${exportMatch[1]}`;
    }
    // Generic based on file count and type
    const fileTypes = new Set(files.map((f) => f.split('.').pop()));
    if (fileTypes.size === 1) {
        const ext = [...fileTypes][0];
        return `${type === 'feat' ? 'add' : 'update'} ${files.length} ${ext} file${files.length > 1 ? 's' : ''}`;
    }
    return `${type === 'feat' ? 'add' : 'update'} ${files.length} files`;
}
/**
 * Analyzes staged git changes and generates commit message suggestions.
 *
 * This function examines the staged files and their diffs to:
 * 1. Detect the appropriate commit type (feat, fix, docs, etc.)
 * 2. Extract scope from file paths
 * 3. Generate a meaningful subject line
 * 4. Calculate confidence scores
 *
 * @returns Array of {@link CommitSuggestion} sorted by confidence (highest first)
 *
 * @example
 * ```typescript
 * const suggestions = analyzeChanges();
 *
 * if (suggestions.length === 0) {
 *   console.log('No staged changes');
 *   return;
 * }
 *
 * console.log(`Best suggestion: ${suggestions[0].full}`);
 * console.log(`Confidence: ${Math.round(suggestions[0].confidence * 100)}%`);
 * ```
 */
export function analyzeChanges() {
    const status = getStatus();
    const diff = getStagedDiff();
    const stats = getStagedStats();
    if (status.staged.length === 0) {
        return [];
    }
    const files = status.staged;
    const { type, confidence } = detectType(files, diff);
    const scope = detectScope(files);
    const subject = generateSubject(files, diff, type);
    // Build full message
    const scopePart = scope ? `(${scope})` : '';
    const full = `${type}${scopePart}: ${subject}`;
    const suggestions = [
        {
            type,
            scope,
            subject,
            body: null,
            full,
            confidence,
        },
    ];
    // Add alternative without scope
    if (scope) {
        suggestions.push({
            type,
            scope: null,
            subject,
            body: null,
            full: `${type}: ${subject}`,
            confidence: confidence * 0.8,
        });
    }
    // Add alternative type if confidence is low
    if (confidence < 0.7) {
        const altType = type === 'feat' ? 'chore' : 'feat';
        suggestions.push({
            type: altType,
            scope,
            subject,
            body: null,
            full: `${altType}${scopePart}: ${subject}`,
            confidence: confidence * 0.5,
        });
    }
    return suggestions.sort((a, b) => b.confidence - a.confidence);
}
/**
 * Formats a commit suggestion into a complete commit message string.
 *
 * Combines the subject line and optional body into the final message format.
 *
 * @param suggestion - The commit suggestion to format
 * @returns The formatted commit message string
 *
 * @example
 * ```typescript
 * const suggestion: CommitSuggestion = {
 *   type: 'feat',
 *   scope: 'api',
 *   subject: 'add user endpoint',
 *   body: 'Implements the /users endpoint with CRUD operations.',
 *   full: 'feat(api): add user endpoint',
 *   confidence: 0.85,
 * };
 *
 * const message = formatCommitMessage(suggestion);
 * // "feat(api): add user endpoint\n\nImplements the /users endpoint..."
 * ```
 */
export function formatCommitMessage(suggestion) {
    let message = suggestion.full;
    if (suggestion.body) {
        message += '\n\n' + suggestion.body;
    }
    return message;
}
//# sourceMappingURL=commit.js.map