# TraceText — Simple HTML, CSS & JavaScript version

A browser-only educational text similarity checker. No Python, Flask, Node.js, database, or installation is required.

## Run it
1. Extract the ZIP file.
2. Open the `TraceText_Simple` folder.
3. Double-click `index.html` (or right-click and choose Open with Chrome).
4. Paste text into both document boxes or upload `.txt` files.
5. Choose Naive, Rabin–Karp, or KMP, set phrase length, and click Compare documents.

## Files
- `index.html` — page structure
- `style.css` — styling and responsive layout
- `script.js` — text handling, algorithms, and similarity calculation

## How the score works
The app creates unique word phrases (n-grams) of the selected length in both documents, finds exact shared phrases, and calculates a symmetric Dice similarity percentage:

`2 × shared unique phrases / (unique phrases in A + unique phrases in B) × 100`

This is an educational similarity score, not a definitive plagiarism verdict. It detects exact phrase matches and does not understand paraphrasing or meaning.
