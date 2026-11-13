---
name: github-issues
description: Use when you need what users have reported in the project's GitHub issues, e.g. feature requests and bugs that point at an opportunity.
allowed-tools: Bash
---

# GitHub issues

Read the project's issues with the `gh` CLI. The repository is on the **Repository** line of your task
(`https://github.com/<owner>/<repo>`). Read only: never comment on, label, close or create issues.

```bash
REPO="<owner>/<repo>"
# Open issues with labels and reactions
gh issue list -R "$REPO" --state open --limit 100 --json number,title,labels,createdAt,url,reactionGroups \
  | jq -r '.[] | "#\(.number)\t\(.createdAt[:10])\t\([.labels[].name] | join(","))\t👍\([.reactionGroups[]? | select(.content=="THUMBS_UP") | .users.totalCount] | add // 0)\t\(.title)"'
# One issue with its discussion
gh issue view 12 -R "$REPO" --comments
# Search
gh issue list -R "$REPO" --state all --search "pickup in:title,body" --json number,title,url
```

## Reading issues

- Labels such as `customer-feedback` mark issues raised by customers; others may be the team's own work items.
- Closed issues still count as evidence of demand if they were closed without being built.
- Report each relevant issue with its number, title and URL, and the reactions or comments that show how many people care.
