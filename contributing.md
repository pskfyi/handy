# Contributing to Handy

Thank you for considering contributing to Handy! We welcome contributions from the community. Here are some guidelines to help you get started.

- [Overview](#overview)
  - [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Commands](#commands)
- [Style Guide](#style-guide)
  - [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Issues](#issues)

## Overview

Handy is a grab-bag of utilities written in TypeScript with Deno. Think of it as an an extension of and elaboration upon the Deno standard library.

### Directory Structure

- Directory and file names that start with an underscore (ex: `_test`) or a period (ex: `.vscode`) are considered private and should not be imported by end users. In JSR, they are not listed as exports.

- The `_scripts` directory contains scripts for internal use.

- The `_test` directory contains test fixtures, constants, and utilities.

- The `.coverage` directory is generated when running `deno task test-coverage.

- The `.github` directory contains the CI workflow.

- The `.vscode` directory contains recommended file extensions and formatting settings for contributors.

- All other directories are _modules_, representing a grouping of related utilities.

## Getting Started

1. Install [Deno](https://docs.deno.com/runtime/#install-deno). Handy requires Deno 2.4 or later.

2. Clone the repository.

## Commands

```bash
deno fmt                  # Format the code
deno lint                 # Lint the code
deno test -A              # Run unit tests
deno task test-coverage   # Run unit tests with coverage
deno task test-readme     # Test code blocks in README.md
deno task release-notes   # Generate release notes since last tag and copy to clipboard
deno task update-exports  # Regenerate exports field in deno.json
deno task update-readme   # Regenerate certain text in README.md
```

## Style Guide

We strive to follow the [Deno style guide](https://docs.deno.com/runtime/contributing/style_guide/) for all code contributions. Please ensure your code adheres to these guidelines before submitting a pull request.

### Commit Messages

We use [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) messages.

- Our permitted types match [the Angular standard](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md#type).

- Scopes are required - use the scope `repo` for root or cross-cutting changes.

- Bodies are encouraged. GitHub renders them as Markdown, and we surface them in release notes, which are previewed in each PR.

## Pull Requests

Please submit pull requests against the `main` branch. Ensure your pull request includes:

- A clear description of the changes.
- Any relevant issue numbers (e.g., `Fixes #123`).
- Tests for new features or bug fixes.
- Documentation updates if necessary.
- If a new module is added, include it in the `readme.md` and use the Markdown All in One extension to format the table of contents.

## Issues

If you find a bug or have a feature request, please open an issue in the repository. Provide as much detail as possible, including steps to reproduce the issue and any relevant code snippets.
