---
name: web-screenshots
description: Use when you need to see a web page as a user would, e.g. reviewing a preview deploy, checking a layout on desktop and mobile, or comparing before and after.
allowed-tools: Bash, Read
---

# Web screenshots

Take screenshots with Playwright's CLI, then open the PNG files with the Read tool to look at them.

## Capture

```bash
mkdir -p /tmp/aidlc-shots
# Desktop
npx -y playwright@1.63.0 screenshot --viewport-size=1280,800 --wait-for-timeout=2000 "<url>" /tmp/aidlc-shots/desktop.png
# Phone (Chromium at phone size)
npx -y playwright@1.63.0 screenshot --viewport-size=390,844 --wait-for-timeout=2000 "<url>" /tmp/aidlc-shots/mobile.png
# Whole page, not just the first screen
npx -y playwright@1.63.0 screenshot --full-page --viewport-size=1280,800 --wait-for-timeout=2000 "<url>" /tmp/aidlc-shots/full.png
```

- Use `--wait-for-timeout` of 2000 ms or more so feature flags and data have loaded.
- Use only Chromium flags (`--viewport-size`). Device profiles such as "iPhone 13" need WebKit, which is not installed.
- Give each screenshot a descriptive file name, and Read every file you capture before drawing conclusions.

## Review

For each screenshot, check:

1. The feature described in the task is visible and recognisable.
2. Layout holds up: no overlapping, clipped or misaligned elements on both desktop and phone sizes.
3. The page matches the existing visual language: colours, type, spacing, button styles.
4. Text is readable and labels say what they do.
5. Nothing looks broken: empty states, errors, missing images, layout shift.

## Report findings

Report each finding as: what you saw, where (screenshot and area), why it matters, and a concrete fix.
If the change is behind a feature flag and you can't see it, say so explicitly. Don't pass a review of a feature you couldn't see.
