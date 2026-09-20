#!/usr/bin/env npx ts-node
/**
 * Custom Workflow Example
 * git-smart - Skylily 🌸
 *
 * This example shows how to build a custom commit workflow
 * that integrates git-smart with your development process.
 */

import {
  isGitRepo,
  getStatus,
  analyzeChanges,
  formatCommitMessage,
  createCommit,
  generateChangelog,
  formatChangelogMarkdown,
} from 'skylily-git-smart';
import * as readline from 'node:readline';

// Helper to prompt user
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🚀 Custom Commit Workflow\n');

  // Verify we're in a git repo
  if (!isGitRepo()) {
    console.error('❌ Not a git repository');
    process.exit(1);
  }

  // Check for staged changes
  const status = getStatus();
  if (status.staged.length === 0) {
    console.log('📝 No staged changes. Here are modified files:\n');
    if (status.modified.length > 0) {
      status.modified.forEach((f) => console.log(`   ${f}`));
      console.log('\nRun `git add <files>` to stage changes.');
    } else {
      console.log('   No changes detected.');
    }
    process.exit(0);
  }

  console.log(`📦 ${status.staged.length} file(s) staged:\n`);
  status.staged.forEach((f) => console.log(`   ${f}`));

  // Generate suggestions
  console.log('\n🤔 Analyzing changes...\n');
  const suggestions = analyzeChanges();

  if (suggestions.length === 0) {
    console.log('Could not generate suggestions. Enter your message manually.');
    const customMsg = await prompt('\n💬 Enter commit message: ');
    if (customMsg && createCommit(customMsg)) {
      console.log('✅ Committed!');
    }
    return;
  }

  // Show suggestions with details
  console.log('💡 Suggestions:\n');
  suggestions.forEach((s, i) => {
    const conf = Math.round(s.confidence * 100);
    const bar = '█'.repeat(Math.round(conf / 10)) + '░'.repeat(10 - Math.round(conf / 10));
    console.log(`  [${i + 1}] ${s.full}`);
    console.log(`      ${bar} ${conf}% confidence\n`);
  });

  // Let user choose
  const choice = await prompt(`Select 1-${suggestions.length}, or enter custom message: `);

  let finalMessage: string;
  const num = parseInt(choice, 10);

  if (num >= 1 && num <= suggestions.length) {
    finalMessage = formatCommitMessage(suggestions[num - 1]);
  } else if (choice) {
    finalMessage = choice;
  } else {
    console.log('Cancelled.');
    return;
  }

  // Confirm
  console.log(`\n📝 Will commit with message:\n   "${finalMessage}"\n`);
  const confirm = await prompt('Proceed? (y/n): ');

  if (confirm.toLowerCase() === 'y') {
    if (createCommit(finalMessage)) {
      console.log('\n✅ Committed successfully!\n');

      // Offer to show changelog
      const showLog = await prompt('Generate changelog preview? (y/n): ');
      if (showLog.toLowerCase() === 'y') {
        const changelog = generateChangelog();
        console.log('\n📋 Changelog Preview:\n');
        console.log(formatChangelogMarkdown(changelog));
      }
    } else {
      console.error('❌ Commit failed');
      process.exit(1);
    }
  } else {
    console.log('Cancelled.');
  }
}

main().catch(console.error);
