import { execSync } from "node:child_process";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { VERSION } from "./const";

if (!/^\d{4}\.\d+$/.test(VERSION)) {
  console.error("❌ Invalid VERSION. Example: 2026.1");
  process.exit(1);
}

const tag = `v${VERSION}`;

function exec(command: string): string {
  return execSync(command, {
    encoding: "utf8",
  }).trim();
}

function run(command: string) {
  console.log(`> ${command}`);
  execSync(command, {
    stdio: "inherit",
  });
}

async function main() {
  console.log(`
KONIN Data Release

Version : ${VERSION}
Tag     : ${tag}
`);

  //
  // Branch
  //
  const branch = exec("git branch --show-current");

  if (branch !== "main") {
    console.error(`❌ Current branch is "${branch}". Release must be created from "main".`);
    process.exit(1);
  }

  //
  // Working Tree
  //
  const status = exec("git status --porcelain");

  if (status.length > 0) {
    console.error("❌ Working tree is not clean.");
    console.log(status);
    process.exit(1);
  }

  //
  // Pull latest
  //
  run("git pull --ff-only");

  //
  // Local tag
  //
  const localTag = exec(`git tag --list "${tag}"`);

  if (localTag) {
    console.error(`❌ Local tag "${tag}" already exists.`);
    process.exit(1);
  }

  //
  // Remote tag
  //
  const remoteTag = exec(`git ls-remote --tags origin refs/tags/${tag}`);

  if (remoteTag) {
    console.error(`❌ Remote tag "${tag}" already exists.`);
    process.exit(1);
  }

  //
  // Confirmation
  //
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  const answer = await rl.question(`Release ${VERSION}? (y/N): `);

  rl.close();

  if (answer.trim().toLowerCase() !== "y") {
    console.log("Cancelled.");
    process.exit(0);
  }

  //
  // Generate
  //
  run("pnpm generate");

  //
  // Commit
  //
  run("git add .");
  run(`git commit -m "release: ${VERSION}"`);

  //
  // Tag
  //
  run(`git tag ${tag}`);

  //
  // Push
  //
  run("git push");
  run(`git push origin ${tag}`);

  console.log();
  console.log("🎉 Release completed!");
  console.log(`Version : ${VERSION}`);
  console.log(`Tag     : ${tag}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});