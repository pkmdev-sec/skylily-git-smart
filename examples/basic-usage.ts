#!/usr/bin/env npx ts-node
/**
 * Basic Usage Example
 * git-smart - Skylily 🌸
 *
 * This example demonstrates the core API for analyzing changes
 * and generating commit messages.
 */

import { analyzeChanges, formatCommitMessage, CommitSuggestion } from 'skylily-git-smart';

// Analyze staged changes in current repo
const suggestions: CommitSuggestion[] = analyzeChanges();

if (suggestions.length === 0) {
  console.log('No staged changes found. Run `git add` first.');
  process.exit(1);
}

console.log('📝 Commit Suggestions:\n');

suggestions.forEach((suggestion, index) => {
  const confidence = Math.round(suggestion.confidence * 100);
  console.log(`  ${index + 1}. ${suggestion.full}`);
  console.log(`     Type: ${suggestion.type}`);
  console.log(`     Scope: ${suggestion.scope || '(none)'}`);
  console.log(`     Confidence: ${confidence}%`);
  console.log();
});

// Get the formatted message for the best suggestion
const bestMessage = formatCommitMessage(suggestions[0]);
console.log(`\n✨ Best suggestion:\n${bestMessage}`);
