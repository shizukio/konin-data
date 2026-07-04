import { input, select } from "@inquirer/prompts";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, posix } from "node:path";
import ora from "ora";
import { subjects } from "./const";

async function main() {
  performance.mark("start-process");

  console.log(`
    KONIN Data Manager
    `)

  performance.mark("start-input")

  const year = await input({
    message: "Year",
    validate: value =>
      /^\d{4}$/.test(value) ? true : "4桁で入力してください",
  });

  const round = await select({
    message: "Round",
    choices: [
      { name: "第1回", value: "1" },
      { name: "第2回", value: "2" },
    ],
  });

  const subject = await select({
    message: "Subject",
    choices: subjects
  });

  const type = await select({
    message: "Type",
    choices: [
      { name: "問題", value: "question" },
      { name: "解答", value: "answer" },
    ],
  });

  const url = await input({
    message: "PDF URL",
    validate: value =>
      value.startsWith("http") ? true : "URLを入力してください",
  });

  performance.mark("end-input")

  performance.mark("start-download")

  const spinner_download = ora('Downloading...').start();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  spinner_download.succeed()

  performance.mark("end-download");

  performance.mark("start-write");

  const spinner_write = ora('ファイル出力中...').start();

  const bytes = Buffer.from(await response.arrayBuffer());

  const path = posix.join(
    "exams",
    year,
    round,
    subject,
    `${type}.pdf`,
  );

  await mkdir(dirname(path), {
    recursive: true,
  });

  await writeFile(path, bytes);

  spinner_write.succeed()

  performance.mark("end-write");

  performance.mark("end-process");

  // マーク間の時間を計測
  performance.measure('全体の処理', 'start-process', 'end-process');
  performance.measure('ダウンロード', 'start-download', 'end-download');
  performance.measure('ファイル出力', 'start-write', 'end-write');

  // 計測結果を取得して表示
  const measures = performance.getEntriesByType('measure');

  console.log()
  measures.forEach(entry => {
    console.log(`${entry.name}: ${Math.floor(entry.duration * 10) / 10}ms`);
  });

  console.log(`
ファイルを作成しました：${path}
`);

  // 使い終わったらメモリ解放のためにクリア
  performance.clearMarks();
  performance.clearMeasures();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
