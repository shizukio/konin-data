import { writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, extname, posix } from "node:path";
import ora from "ora";

interface Catalog {
  years: Year[]
}

interface Year {
  year: number
  rounds: Round[]
}

interface Round {
  round: number
  subjects: Subject[]
}

interface Subject {
  id: string
  question?: string
  answer?: string
}

const OUTPUT_PATH = "catalog.json"
async function main() {
  performance.mark("start-process");

  console.log(`
    KONIN Data Manager / CATEGORY
    `)

  const targetDir = "exams"

  const years = (await readdir(targetDir)).sort();

  const catalog: Catalog = {
    years: [],
  };

  performance.mark("start-gen")

  const spinner_gen = ora('カタログ生成中...').start();

  for (const year of years) {
    const yearPath = posix.join(targetDir, year);
    const rounds = (await readdir(yearPath)).sort();

    const rounds_out: Round[] = []

    for (const round of rounds) {
      const roundPath = posix.join(yearPath, round);

      const subjects = (await readdir(roundPath)).sort();

      const subjects_out = await Promise.all(
        subjects.map(async (subject): Promise<Subject> => {
          const subjectPath = posix.join(roundPath, subject);

          const files = await readdir(subjectPath);

          let question: string | undefined;
          let answer: string | undefined;

          for (const file of files) {
            switch (basename(file, extname(file))) {
              case "question":
                question = posix.join(subjectPath, file);
                break;

              case "answer":
                answer = posix.join(subjectPath, file);
                break;
            }
          }

          return {
            id: subject,
            question,
            answer,
          };
        })
      );

      rounds_out.push({
        round: Number(round),
        subjects: subjects_out
      })
    }

    catalog.years.push({
      year: Number(year),
      rounds: rounds_out,
    });
  }

  spinner_gen.succeed()

  performance.mark("end-gen")

  performance.mark("start-writeFile")

  const spinner_writeFile = ora('ファイル出力中...').start();

  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(catalog, null, 2),
  );

  spinner_writeFile.succeed()

  performance.mark("end-writeFile")

  performance.mark("end-process");

  // マーク間の時間を計測
  performance.measure('全体の処理', 'start-process', 'end-process');
  performance.measure('生成', 'start-gen', 'end-gen');
  performance.measure('ファイル出力', 'start-writeFile', 'end-writeFile');

  // 計測結果を取得して表示
  const measures = performance.getEntriesByType('measure');

  console.log()
  measures.forEach(entry => {
    console.log(`${entry.name}: ${Math.floor(entry.duration * 10) / 10}ms`);
  });
  console.log(`
OUTPUT
  Years: ${catalog.years.length}
  / ${OUTPUT_PATH}
`)

  // 使い終わったらメモリ解放のためにクリア
  performance.clearMarks();
  performance.clearMeasures();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
