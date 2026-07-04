
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { posix } from "node:path";
import ora from "ora";
import { sha256hashSync } from "./utils";
import { FileInfo, VERSION } from "./const";

async function main() {
  const startTime = performance.now()

  console.log(`
    KONIN Data Manager / METADATA
    `)

  const targetDir = "exams"

  const examsRoot = await readdir(posix.join(targetDir), { recursive: true })

  const files: FileInfo[] = []

  const spinner_entryFile = ora('エントリーファイルの計算...').start();

  await Promise.all(
    examsRoot.filter((e) => e.includes(".pdf")).map(async (e) => {
      const path = posix.join(targetDir, e).replaceAll("\\", "/");

      const buffer = readFileSync(path)
      const stat = statSync(path)

      const size = stat.size
      const sha256 = sha256hashSync(buffer)

      const file = {
        path,
        sha256,
        size
      }

      files.push(file)
    })
  )

  spinner_entryFile.succeed();

  const spinner_writeMetaFile = ora('メタファイルの作成...').start();

  writeFileSync("metadata.json", JSON.stringify({
    version: VERSION,
    files,
  }, null, 2))

  spinner_writeMetaFile.succeed();

  const endTime = performance.now();

  const time = endTime - startTime

  console.log(`
終了：${Math.floor(time * 10) / 10}ms
`)

  // 使い終わったらメモリ解放のためにクリア
  performance.clearMarks();
  performance.clearMeasures();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
