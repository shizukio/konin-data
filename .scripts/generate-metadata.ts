import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import ora from "ora";

function sha256hashSync(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

type file = {
  path: string,
  size: number,
  sha256: string
}

async function main() {
  const startTime = performance.now()

  console.log(`
    KONIN Data Manager
    `)

  const date = new Date()

  const targetDir = "exams"

  const examsRoot = await readdir(join(targetDir), { recursive: true })

  const files: file[] = []

  const spinner_entryFile = ora('エントリーファイルの計算...').start();

  await Promise.all(
    examsRoot.filter((e) => e.includes(".pdf")).map(async (e) => {
      const path = join(targetDir, e)

      const buffer = readFileSync(path)
      const stat = statSync(path)

      const size = stat.size
      const sha256 = sha256hashSync(buffer)

      const file = {
        path,
        size,
        sha256
      }

      files.push(file)
    })
  )

  spinner_entryFile.succeed();

  const spinner_writeMetaFile = ora('メタファイルの作成...').start();

  writeFileSync("metadata.json", JSON.stringify({
    version: 1,
    updatedAt: date,
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
