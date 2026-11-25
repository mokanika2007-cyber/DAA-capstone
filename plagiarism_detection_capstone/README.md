# TraceText — Plagiarism Detection Using String Matching Algorithms

A Python + Flask web application for a Design and Analysis of Algorithms (DAA) capstone. It compares two text documents by finding shared consecutive word sequences (word-shingles), using three string-matching algorithms:

1. **Naïve Pattern Matching**
2. **Rabin–Karp**
3. **Knuth–Morris–Pratt (KMP)**

The interface reports phrase overlap, directional document coverage, overall similarity, and measured execution time.

## Features

- Clean browser-based interface built with HTML, CSS and JavaScript
- Paste two documents and compare them
- Choose one algorithm or run all three
- Configurable phrase length (2–12 words)
- Shows matching phrases and their positions in Document B
- Displays measured runtime and theoretical time complexity
- Sample documents and automated unit tests
- No database or external API required

## Requirements

- Python 3.9 or newer
- pip

## Run locally

```bash
# 1. Create and activate a virtual environment
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the application
python app.py
```

Open **http://127.0.0.1:5000** in your browser.

## Run tests

```bash
python -m unittest discover -s tests -v
```

## How it works

1. Both documents are normalized to lowercase word tokens. Punctuation is ignored for matching.
2. The application creates unique consecutive word sequences of the selected length from Document A.
3. Each sequence is searched in Document B using the selected algorithm(s).
4. The application counts how many unique sequences were found and calculates coverage.

### Similarity calculation

Let:
- `A` = number of unique n-grams in Document A
- `B` = number of unique n-grams in Document B
- `M_A` = unique n-grams from A found in B
- `M_B` = unique n-grams from B found in A

Then:

- Document A coverage = `(M_A / A) × 100`
- Document B coverage = `(M_B / B) × 100`
- Overall similarity = `(Document A coverage + Document B coverage) / 2`

If a document has fewer words than the selected phrase length, its n-gram coverage is reported as 0%.

## Algorithms and complexity

Let `n` be the number of tokens in the searched text and `m` be the pattern length.

| Algorithm | Typical / average time | Worst-case time | Extra space |
|---|---:|---:|---:|
| Naïve | O(n × m) | O(n × m) | O(1), excluding output |
| Rabin–Karp | O(n + m) average per pattern | O(n × m) | O(n), due to token hashes |
| KMP | O(n + m) per pattern | O(n + m) | O(m), for LPS table |

The application measures elapsed wall-clock time with Python's `time.perf_counter()`. Very small inputs can produce noisy measurements, so repeat tests with larger documents for a fair comparison.

## API

`POST /api/compare`

Example JSON body:

```json
{
  "text_a": "A sufficiently long reference document...",
  "text_b": "A sufficiently long document to compare...",
  "algorithm": "all",
  "ngram_size": 5
}
```

`algorithm` can be `all`, `naive`, `rabin_karp`, or `kmp`. `ngram_size` must be from 2 to 12.

## Suggested experiment for your report

1. Prepare pairs of documents with low, medium and high overlap.
2. Test phrase lengths 3, 5, 7 and 10.
3. Increase document size while keeping the phrase length fixed.
4. Record each algorithm's execution time in a results table.
5. Explain that KMP has a linear search bound, Rabin–Karp has linear average behavior but can degrade with collisions, and naïve matching can perform repeated comparisons.

## Limitations and academic integrity

This is an educational exact-phrase similarity demonstrator, not a production plagiarism detector. It does not understand paraphrases, semantic similarity, quotations, source attribution or intent. A high overlap score is a signal for human review, not proof of plagiarism. The reported percentage is based on exact normalized word n-grams and depends on the selected phrase length.

## Repository structure

```text
plagiarism_detection_capstone/
├── app.py
├── algorithms.py
├── requirements.txt
├── README.md
├── .gitignore
├── templates/
│   └── index.html
├── static/
│   ├── app.js
│   └── style.css
├── sample_documents/
│   ├── document_a.txt
│   └── document_b.txt
└── tests/
    └── test_algorithms.py
```

## GitHub upload

Create a new empty repository on GitHub, then run these commands from this project folder:

```bash
git init
git add .
git commit -m "Initial commit: TraceText DAA capstone"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your own repository URL.

## Zosima.ai submission checklist

- Upload the project ZIP or connect/import the GitHub repository, depending on the submission options provided by your course.
- Include this README and the source folders.
- Do not upload your `venv` folder.
- Add screenshots of the running application and algorithm comparison if the submission page allows supporting evidence.
- Verify the required submission format with your instructor/platform instructions.

## Author

DAA Capstone Project — Plagiarism Detection Using String Matching Algorithms.
