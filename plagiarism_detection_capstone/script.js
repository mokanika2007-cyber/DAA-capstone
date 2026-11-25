const $ = (id) => document.getElementById(id);

const textA = $("textA");
const textB = $("textB");
const phraseLength = $("phraseLength");

function words(text) {
  return text.toLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
}

function updateCounts() {
  $("countA").textContent = `${words(textA.value).length} words`;
  $("countB").textContent = `${words(textB.value).length} words`;
}
textA.addEventListener("input", updateCounts);
textB.addEventListener("input", updateCounts);

phraseLength.addEventListener("input", () => {
  $("phraseValue").textContent = `${phraseLength.value} words`;
});

$("clearA").addEventListener("click", () => { textA.value = ""; updateCounts(); });
$("clearB").addEventListener("click", () => { textB.value = ""; updateCounts(); });

async function readTextFile(input, target) {
  const file = input.files[0];
  if (!file) return;
  target.value = await file.text();
  updateCounts();
}
$("fileA").addEventListener("change", (e) => readTextFile(e.target, textA));
$("fileB").addEventListener("change", (e) => readTextFile(e.target, textB));

// Each matcher returns the first index of a phrase in the target text, or -1.
function naiveSearch(text, pattern) {
  if (!pattern.length) return 0;
  for (let i = 0; i <= text.length - pattern.length; i++) {
    let j = 0;
    while (j < pattern.length && text[i + j] === pattern[j]) j++;
    if (j === pattern.length) return i;
  }
  return -1;
}

function rabinKarpSearch(text, pattern) {
  const n = text.length, m = pattern.length;
  if (!m) return 0;
  if (m > n) return -1;
  const base = 256, mod = 101;
  let patternHash = 0, windowHash = 0, high = 1;
  for (let i = 0; i < m - 1; i++) high = (high * base) % mod;
  for (let i = 0; i < m; i++) {
    patternHash = (base * patternHash + pattern.charCodeAt(i)) % mod;
    windowHash = (base * windowHash + text.charCodeAt(i)) % mod;
  }
  for (let i = 0; i <= n - m; i++) {
    if (patternHash === windowHash) {
      let same = true;
      for (let j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) { same = false; break; }
      }
      if (same) return i;
    }
    if (i < n - m) {
      windowHash = (base * (windowHash - text.charCodeAt(i) * high) + text.charCodeAt(i + m)) % mod;
      if (windowHash < 0) windowHash += mod;
    }
  }
  return -1;
}

function kmpSearch(text, pattern) {
  const n = text.length, m = pattern.length;
  if (!m) return 0;
  const lps = new Array(m).fill(0);
  for (let i = 1, len = 0; i < m;) {
    if (pattern[i] === pattern[len]) lps[i++] = ++len;
    else if (len) len = lps[len - 1];
    else lps[i++] = 0;
  }
  for (let i = 0, j = 0; i < n;) {
    if (text[i] === pattern[j]) { i++; j++; }
    if (j === m) return i - j;
    if (i < n && text[i] !== pattern[j]) {
      if (j) j = lps[j - 1];
      else i++;
    }
  }
  return -1;
}

const matchers = { naive: naiveSearch, rabin: rabinKarpSearch, kmp: kmpSearch };
const algorithmNames = {
  naive: "Naive String Matching",
  rabin: "Rabin–Karp",
  kmp: "Knuth–Morris–Pratt (KMP)"
};

function makeNgrams(tokens, size) {
  const result = new Set();
  for (let i = 0; i <= tokens.length - size; i++) {
    result.add(tokens.slice(i, i + size).join(" "));
  }
  return result;
}

function compare() {
  const a = words(textA.value);
  const b = words(textB.value);
  const size = Number(phraseLength.value);
  const algorithm = $("algorithm").value;

  if (a.length < size || b.length < size) {
    $("status").textContent = `Both documents need at least ${size} words.`;
    $("results").classList.add("hidden");
    return;
  }

  const phrasesA = makeNgrams(a, size);
  const phrasesB = makeNgrams(b, size);
  const search = matchers[algorithm];
  const shared = [];

  // Search each unique phrase from A inside B using the selected algorithm.
  for (const phrase of phrasesA) {
    if (search(b.join(" "), phrase) !== -1 && phrasesB.has(phrase)) {
      shared.push(phrase);
    }
  }

  // Dice coefficient gives a symmetric percentage based on unique phrases.
  const denominator = phrasesA.size + phrasesB.size;
  const score = denominator ? (2 * shared.length / denominator) * 100 : 0;
  const checked = phrasesA.size + phrasesB.size;

  $("similarity").textContent = `${score.toFixed(1)}%`;
  $("progressFill").style.width = `${score}%`;
  $("sharedCount").textContent = shared.length.toLocaleString();
  $("checkedCount").textContent = checked.toLocaleString();
  $("algorithmUsed").textContent = algorithmNames[algorithm];
  $("matchHint").textContent = `${size}-word exact matches`;

  const list = $("matchesList");
  list.replaceChildren();
  if (!shared.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "No exact matching phrases found. Try a shorter phrase length.";
    list.appendChild(item);
  } else {
    shared.sort((x, y) => x.localeCompare(y));
    shared.slice(0, 100).forEach((phrase) => {
      const item = document.createElement("li");
      item.textContent = phrase;
      list.appendChild(item);
    });
  }

  $("status").textContent = "Comparison complete.";
  $("results").classList.remove("hidden");
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("compareBtn").addEventListener("click", compare);
updateCounts();
