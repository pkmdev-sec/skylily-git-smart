#!/usr/bin/env node
/**
 * git-smart CLI
 * Skylily 🌸
 * 
 * Usage:
 *   git-smart commit            # Generate commit message
 *   git-smart changelog         # Generate changelog
 *   git-smart changelog --md    # Output as markdown
 */

import { analyzeChanges, formatCommitMessage } from './commit.js';
import { generateChangelog, formatChangelogMarkdown, formatChangelogText, formatChangelogJson } from './changelog.js';
import { isGitRepo, getStatus, createCommit } from './git.js';
import { readFileSync } from "fs";
import * as readline from 'node:readline';

// ANSI colors
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function printUsage(): void {
  console.log(`
${c.bright}${c.magenta}🧠 git-smart${c.reset}
${c.dim}AI-powered git helpers${c.reset}

${c.cyan}Commands:${c.reset}
  ${c.green}commit${c.reset}     Generate commit message from staged changes
  ${c.green}changelog${c.reset}  Generate changelog from commits

${c.cyan}Options:${c.reset}
  --help, -h     Show this help
  --yes, -y      Auto-accept first suggestion (commit)
  --md           Output as markdown (changelog)
  --json         Output as JSON (changelog)
  --version, -v  Version to use in changelog

${c.cyan}Examples:${c.reset}
  git-smart commit
  git-smart commit -y
  git-smart changelog
  git-smart changelog --md > CHANGELOG.md
  git-smart changelog --version 1.2.0
`);
}

async function prompt(question: string): Promise<string> {
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

async function commitCommand(args: string[]): Promise<void> {
  if (!isGitRepo()) {
    console.error(`${c.red}Error: Not a git repository${c.reset}`);
    process.exit(1);
  }
  
  const status = getStatus();
  
  if (status.staged.length === 0) {
    console.error(`${c.yellow}No staged changes.${c.reset} Stage files with ${c.cyan}git add${c.reset} first.`);
    process.exit(1);
  }
  
  console.log(`${c.bright}${c.magenta}🧠 git-smart commit${c.reset}\n`);
  console.log(`${c.dim}Analyzing ${status.staged.length} staged file(s)...${c.reset}\n`);
  
  const suggestions = analyzeChanges();
  
  if (suggestions.length === 0) {
    console.error(`${c.red}Could not generate suggestions.${c.reset}`);
    process.exit(1);
  }
  
  // Show suggestions
  console.log(`${c.cyan}Suggestions:${c.reset}\n`);
  
  suggestions.forEach((s, i) => {
    const confidence = Math.round(s.confidence * 100);
    const bar = '█'.repeat(Math.round(confidence / 10)) + '░'.repeat(10 - Math.round(confidence / 10));
    console.log(`  ${c.yellow}${i + 1}.${c.reset} ${c.green}${s.full}${c.reset}`);
    console.log(`     ${c.dim}${bar} ${confidence}% confidence${c.reset}`);
    console.log('');
  });
  
  const autoAccept = args.includes('-y') || args.includes('--yes');
  
  if (autoAccept) {
    console.log(`${c.dim}Auto-accepting first suggestion...${c.reset}\n`);
    const message = formatCommitMessage(suggestions[0]);
    
    if (createCommit(message)) {
      console.log(`${c.green}✓${c.reset} Committed: ${c.bright}${suggestions[0].full}${c.reset}`);
    } else {
      console.error(`${c.red}Failed to create commit${c.reset}`);
      process.exit(1);
    }
    return;
  }
  
  // Interactive selection
  const answer = await prompt(`${c.cyan}Select (1-${suggestions.length}), enter custom, or 'q' to quit:${c.reset} `);
  
  if (answer.toLowerCase() === 'q' || answer === '') {
    console.log(`${c.dim}Cancelled.${c.reset}`);
    return;
  }
  
  const num = parseInt(answer, 10);
  let message: string;
  
  if (!isNaN(num) && num >= 1 && num <= suggestions.length) {
    message = formatCommitMessage(suggestions[num - 1]);
  } else {
    // Custom message
    message = answer;
  }
  
  console.log('');
  
  if (createCommit(message)) {
    console.log(`${c.green}✓${c.reset} Committed: ${c.bright}${message.split('\n')[0]}${c.reset}`);
  } else {
    console.error(`${c.red}Failed to create commit${c.reset}`);
    process.exit(1);
  }
}

function changelogCommand(args: string[]): void {
  if (!isGitRepo()) {
    console.error(`${c.red}Error: Not a git repository${c.reset}`);
    process.exit(1);
  }
  
  const versionIdx = args.indexOf('--version');
  const version = versionIdx >= 0 ? args[versionIdx + 1] : undefined;
  
  const vIdx = args.indexOf('-v');
  const versionAlt = vIdx >= 0 && !args[vIdx + 1]?.startsWith('-') ? args[vIdx + 1] : undefined;
  
  const changelog = generateChangelog(version || versionAlt);
  
  if (args.includes('--json')) {
    console.log(formatChangelogJson(changelog));
  } else if (args.includes('--md') || args.includes('--markdown')) {
    console.log(formatChangelogMarkdown(changelog));
  } else {
    // Pretty print to terminal
    console.log(`${c.bright}${c.magenta}🧠 git-smart changelog${c.reset}\n`);
    console.log(formatChangelogText(changelog));
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  // Handle --version flag
  if (command === "--version" || command === "-V") {
    try {
      const pkgPath = new URL("../package.json", import.meta.url);
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      console.log(`git-smart v${pkg.version}`);
    } catch { console.log("git-smart v1.0.0"); }
    return;
  }
  
  if (!command || command === '--help' || command === '-h') {
    printUsage();
    return;
  }
  
  switch (command) {
    case 'commit':
    case 'c':
      await commitCommand(args.slice(1));
      break;
    
    case 'changelog':
    case 'log':
      changelogCommand(args.slice(1));
      break;
    
    default:
      console.error(`${c.red}Unknown command: ${command}${c.reset}`);
      printUsage();
      process.exit(1);
  }
}

main().catch(console.error);
