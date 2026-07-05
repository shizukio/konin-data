export const VERSION: string = "2026.3"

export const SUBJECT_CATEGORIES = [
  "common",
  "science",
  "history",
  "civics",
] as const;

export type SubjectCategory =
  (typeof SUBJECT_CATEGORIES)[number];

export type Subject = { name: string, value: string, category: SubjectCategory }

export const subjects: Subject[] = [
  { name: "国語", value: "kokugo", category: "common" },
  { name: "地理", value: "chiri", category: "history" },
  { name: "歴史", value: "rekishi", category: "history" },
  { name: "公共", value: "koukyou", category: "civics" },
  { name: "数学", value: "suugaku", category: "common" },
  { name: "科学と人間生活", value: "kajin", category: "science" },
  { name: "物理基礎", value: "butsurikiso", category: "science" },
  { name: "化学基礎", value: "kagakukiso", category: "science" },
  { name: "生物基礎", value: "seibutsukiso", category: "science" },
  { name: "地学基礎", value: "chigakukiso", category: "science" },
  { name: "英語", value: "eigo", category: "common" },
] as const

type SubjectId = typeof subjects[number]["value"];

// generate-subjects.ts
export type SubjectsFile = Record<
  SubjectId,
  {
    name: string;
    category: SubjectCategory;
  }
>;

export type FileInfo = {
  path: string,
  sha256: string,
  size: number
}

export type ManifestFile = Record<
  string,
  FileInfo
>;
