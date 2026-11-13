---
name: team-notifications
description: Use when you tell the team that something happened to a card, e.g. it moved to another lane or its rollout reached 100%, through a messaging tool such as Telegram or Slack.
---

# Team notifications

People read these on their phones between other things. Make each one worth the interruption.

## Format

- One or two lines, plain text. No markdown headings, tables or code blocks.
- Start with a symbol and what happened:
  - `⚑` a card moved lane: "⚑ Reorder my usual moved Build → Release (handed off by Iris)"
  - `🚀` a rollout reached 100%: "🚀 Reorder my usual is live for everyone: coffee-reorder-usual at 100% in production"
  - `⚠` something needs a person: a failure, a rollback, a hold
- Then the single most useful link, on its own: the card on the board for lane changes, the production URL for a 100% rollout, the pull request for a merge.
- Name the feature flag when there is one.

## Rules

- Send exactly once, with the messaging tool you were given. Don't send drafts or follow-ups.
- Use only facts from your task: card, lanes, flag, rollout, links. Never guess, and never include tokens, keys or internal file paths.
- If the send tool fails, say so in your report; don't retry in a loop.
