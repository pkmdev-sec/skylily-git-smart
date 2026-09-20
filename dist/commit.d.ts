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
/**
 * A suggested commit message with metadata.
 */
export interface CommitSuggestion {
    /** Commit type (feat, fix, docs, etc.) */
    type: string;
    /** Optional scope extracted from file paths */
    scope: string | null;
    /** The commit subject line */
    subject: string;
    /** Optional commit body for longer descriptions */
    body: string | null;
    /** The complete formatted commit message */
    full: string;
    /** Confidence score from 0-1 indicating suggestion quality */
    confidence: number;
}
/**
 * Conventional commit types with descriptions.
 * Used for documentation and validation.
 */
export declare const COMMIT_TYPES: Record<string, string>;
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
export declare function analyzeChanges(): CommitSuggestion[];
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
export declare function formatCommitMessage(suggestion: CommitSuggestion): string;
//# sourceMappingURL=commit.d.ts.map