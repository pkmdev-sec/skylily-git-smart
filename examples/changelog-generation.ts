#!/usr/bin/env npx ts-node
/**
 * Changelog Generation Example
 * git-smart - Skylily 🌸
 *
 * This example shows how to generate changelogs
 * in various formats from commit history.
 */

import {
  generateChangelog,
  formatChangelogMarkdown,
  formatChangelogText,
  formatChangelogJson,
  Changelog,
} from 'skylily-git-smart';

// Generate changelog from commits since last tag
// If no version is specified, it defaults to "Unreleased"
const changelog: Changelog = generateChangelog();

console.log('📋 Changelog Generated!\n');
console.log(`Version: ${changelog.version}`);
console.log(`Date: ${changelog.date}`);
console.log(`Sections: ${changelog.sections.length}`);
console.log(`Breaking changes: ${changelog.breaking.length}`);

// Display section summary
console.log('\n📊 Section Summary:');
for (const section of changelog.sections) {
  console.log(`  ${section.emoji} ${section.title}: ${section.entries.length} entries`);
}

// Output as plain text
console.log('\n--- Plain Text ---\n');
console.log(formatChangelogText(changelog));

// Output as Markdown
console.log('\n--- Markdown ---\n');
console.log(formatChangelogMarkdown(changelog));

// You can also get JSON for programmatic use
const jsonData = JSON.parse(formatChangelogJson(changelog));
console.log(`\n📦 JSON has ${jsonData.sections.length} sections`);
