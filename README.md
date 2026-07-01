# Catalog Generator

`generate:catalog` は、`exams/` ディレクトリを走査し、KONIN が利用する `catalog.json` を自動生成するスクリプトです。

## ディレクトリ構成

```text
exams/
├── 2025/
│   ├── 1/
│   │   ├── kokugo/
│   │   │   ├── question.pdf
│   │   │   └── answer.pdf
│   │   ├── eigo/
│   │   └── ...
│   └── 2/
└── 2026/
```

各ディレクトリは以下の意味を持ちます。

| ディレクトリ         | 内容    |
| -------------- | ----- |
| `2025`         | 試験年度  |
| `1`            | 第1回試験 |
| `kokugo`       | 科目ID  |
| `question.pdf` | 問題    |
| `answer.pdf`   | 解答    |

---

## 実行方法

```bash
pnpm generate:catalog
```

実行すると、リポジトリのルートに `catalog.json` が生成されます。

---

## 出力例

```json
{
  "years": [
    {
      "year": 2025,
      "rounds": [
        {
          "round": 1,
          "subjects": [
            {
              "id": "kokugo",
              "question": "exams/2025/1/kokugo/question.pdf",
              "answer": "exams/2025/1/kokugo/answer.pdf"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 命名規則

各科目ディレクトリでは、以下のファイル名を使用してください。

| ファイル名          | 用途    |
| -------------- | ----- |
| `question.pdf` | 問題冊子  |
| `answer.pdf`   | 解答・解説 |

この命名規則を前提として `catalog.json` を生成します。

---

## 注意事項

* 年度・回数・科目ディレクトリは数値・IDで管理します。
* `catalog.json` は手動で編集せず、必ずスクリプトで再生成してください。
* PDF の追加・削除・変更後は、必ず `pnpm generate:catalog` を実行してください。
