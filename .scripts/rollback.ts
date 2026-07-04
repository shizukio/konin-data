import { execSync } from "node:child_process";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { VERSION } from "./const";

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
KONIN Data Rollback

Version : ${VERSION}
Tag     : ${tag}
`);

  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  const answer = await rl.question(
    `Delete release and tag "${tag}"? (y/N): `
  );

  rl.close();

  if (answer.trim().toLowerCase() !== "y") {
    console.log("Cancelled.");
    return;
  }

  //
  // Delete GitHub Release
  //
  try {
    run(`gh release delete ${tag} --yes`);
  } catch {
    console.log("Release not found. Skip.");
  }

  //
  // Delete local tag
  //
  try {
    run(`git tag -d ${tag}`);
  } catch {
    console.log("Local tag not found. Skip.");
  }

  //
  // Delete remote tag
  //
  try {
    run(`git push origin :refs/tags/${tag}`);
  } catch {
    console.log("Remote tag not found. Skip.");
  }

  console.log();
  console.log("✅ Rollback completed.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});