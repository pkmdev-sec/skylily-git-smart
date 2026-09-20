#!/usr/bin/env npx ts-node
/**
 * Git Utilities Example
 * git-smart - Skylily 🌸
 *
 * This example demonstrates the git utility functions
 * for reading repository state.
 */

import {
  isGitRepo,
  getCurrentBranch,
  getStatus,
  getRecentCommits,
  getLatestTag,
  getTags,
  getRemoteUrl,
  parseRemoteUrl,
  getStagedDiff,
  getStagedStats,
} from 'skylily-git-smart';

// Check if we're in a git repository
if (!isGitRepo()) {
  console.error('❌ Not a git repository!');
  process.exit(1);
}

console.log('✅ Git repository detected\n');

// Current branch
const branch = getCurrentBranch();
console.log(`🌿 Current branch: ${branch}`);

// Repository status
const status = getStatus();
console.log('\n📊 Repository Status:');
console.log(`  Branch: ${status.branch}`);
console.log(`  Staged files: ${status.staged.length}`);
console.log(`  Modified files: ${status.modified.length}`);
console.log(`  Untracked files: ${status.untracked.length}`);
console.log(`  Ahead: ${status.ahead} | Behind: ${status.behind}`);

// List staged files if any
if (status.staged.length > 0) {
  console.log('\n📁 Staged files:');
  status.staged.forEach((file) => console.log(`  • ${file}`));

  // Show staged diff stats
  console.log('\n📈 Staged changes:');
  console.log(getStagedStats());
}

// Tags
const tags = getTags();
const latestTag = getLatestTag();
console.log(`\n🏷️  Tags: ${tags.length} total`);
if (latestTag) {
  console.log(`   Latest: ${latestTag}`);
}

// Recent commits
const recentCommits = getRecentCommits(5);
console.log(`\n📝 Recent commits (${recentCommits.length}):`);
recentCommits.forEach((commit) => {
  console.log(`  ${commit.shortHash} ${commit.subject}`);
  console.log(`        by ${commit.author} on ${commit.date.split('T')[0]}`);
});

// Remote URL
const remoteUrl = getRemoteUrl();
if (remoteUrl) {
  console.log(`\n🌐 Remote URL: ${remoteUrl}`);

  const parsed = parseRemoteUrl(remoteUrl);
  if (parsed) {
    console.log(`   Host: ${parsed.host}`);
    console.log(`   Owner: ${parsed.owner}`);
    console.log(`   Repo: ${parsed.repo}`);
  }
}
