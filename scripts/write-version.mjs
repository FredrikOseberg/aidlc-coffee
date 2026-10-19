// The board confirms what is live by reading /version.json after a deploy.
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// PRs build a merge commit; VERSION_SHA carries the branch head instead.
let sha = process.env.VERSION_SHA || process.env.GITHUB_SHA || '';
if (!sha) {
  try {
    sha = execSync('git rev-parse HEAD').toString().trim();
  } catch {
    sha = 'unknown';
  }
}
writeFileSync('dist/version.json', JSON.stringify({ sha, builtAt: new Date().toISOString() }) + '\n');
console.log(`version.json → ${sha.slice(0, 7)}`);
