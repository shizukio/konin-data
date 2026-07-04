
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { posix } from "node:path";
import ora from "ora";
import { sha256hashSync } from "./utils";
import { ManifestFile, VERSION } from "./const";

const listFiles = [
  {
    name: "metadata",
    file: "metadata.json",
  },
  {
    name: "catalog",
    file: "catalog.json",
  },
  {
    name: "subjects",
    file: "subjects.json",
  }
]

async function main() {
  const startTime = performance.now()

  console.log(`
    KONIN Data Manager / MANIFEST
    `)

  const files: ManifestFile = {}

  const spinner_entryFile = ora('エントリーファイルの計算...').start();

  for (const e of listFiles) {
    const path = posix.join(e.file).replaceAll("\\", "/");
    const buffer = readFileSync(path)
    const stat = statSync(path)

    const size = stat.size
    const sha256 = sha256hashSync(buffer)

    const file = {
      path,
      sha256,
      size
    }
    files[e.name] = file
  }

  spinner_entryFile.succeed();

  const spinner_writeFile = ora('ファイル出力...').start();

  writeFileSync("manifest.json", JSON.stringify({
    version: VERSION,
    files,
  }, null, 2))

  spinner_writeFile.succeed();

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
