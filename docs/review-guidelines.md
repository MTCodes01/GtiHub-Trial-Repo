# Review Guidelines

This document outlines the standard for reviewing Pull Requests in this repository during Commit Overflow.

## Pre-Review Checks
Before a human review begins, ensure:
1. Automated CI/CD checks (GitHub Actions) are passing.
2. There are no merge conflicts.
3. The PR is not in "Draft" state.
4. The PR links to a valid open issue.

## Code Quality Standards
- **Readability**: Code should be easily understandable. Variables should be descriptively named.
- **Maintainability**: Avoid "clever" one-liners that are hard to decipher.
- **Testing**: New logic must be covered by tests. Existing tests should not break.
- **Documentation**: If a feature was added or changed, the relevant documentation must be updated in the same PR.

## Review Stages

1. **Mentor Review**: A designated mentor will review the PR for logical correctness, style, and event rules. Once approved, the mentor will apply the `mentor-review` (approved) or `ready-to-merge` label.
2. **Maintainer Review**: A core maintainer does a final sanity check and performs the actual merge.

## Giving Feedback
- Be respectful and constructive.
- Use suggestions via GitHub UI for minor syntax/style fixes.
- If the PR needs significant work, leave clear, actionable steps for the contributor.
