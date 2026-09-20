# Examples

This directory contains example scripts demonstrating how to use `skylily-git-smart`.

## Running Examples

Make sure you have the package installed:

```bash
npm install skylily-git-smart
```

Then run any example with ts-node or tsx:

```bash
npx ts-node examples/basic-usage.ts
# or
npx tsx examples/basic-usage.ts
```

## Examples

### 1. `basic-usage.ts`

Demonstrates the core commit message generation API:
- Analyzing staged changes
- Getting commit suggestions
- Formatting commit messages

### 2. `changelog-generation.ts`

Shows how to generate changelogs:
- Creating a changelog from commit history
- Formatting as Markdown, plain text, or JSON
- Handling breaking changes

### 3. `git-utilities.ts`

Explores the git utility functions:
- Checking repository status
- Getting branch information
- Listing commits and tags
- Parsing remote URLs

### 4. `custom-workflow.ts`

A complete interactive workflow example:
- Combining all features into a custom CLI
- User prompts and confirmations
- End-to-end commit experience

## Tips

- Run examples from within a git repository to see real data
- Stage some files with `git add` before running commit-related examples
- Examples use ES modules - make sure your environment supports them
