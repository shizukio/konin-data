import ora from "ora"
import { subjects, SubjectsFile } from "./const"
import { writeFileSync } from "node:fs"

async function main() {
  const startTime = performance.now()

  console.log(`
    KONIN Data Manager / SUBJECTS
    `)

  const subjects_out: SubjectsFile = {};

  const spinner_subjects = ora('エントリー科目の処理...').start();

  for (const subject of subjects) {
    subjects_out[subject.value] = {
      name: subject.name,
      category: subject.category,
    };
  }

  spinner_subjects.succeed();

  const spinner_writeMetaFile = ora('ファイル出力...').start();

  writeFileSync("subjects.json", JSON.stringify(subjects_out, null, 2))

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
