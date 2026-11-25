"""String matching algorithms and document comparison utilities.

The algorithms search for exact token sequences. Text is normalized to lowercase
words before matching; punctuation is ignored for matching purposes.
"""
import re
import time
from collections import Counter


def tokenize(text):
    """Return normalized word tokens, retaining internal apostrophes."""
    return re.findall(r"[a-z0-9]+(?:'[a-z0-9]+)?", text.lower())


def naive_search(text, pattern):
    """Return every start index of pattern in text. O(n*m) worst case."""
    n, m = len(text), len(pattern)
    if m == 0 or m > n:
        return []
    found = []
    for i in range(n - m + 1):
        j = 0
        while j < m and text[i + j] == pattern[j]:
            j += 1
        if j == m:
            found.append(i)
    return found


def rabin_karp_search(text, pattern, base=256, modulus=1_000_000_007):
    """Rabin-Karp with rolling hash and verification to avoid hash collisions."""
    n, m = len(text), len(pattern)
    if m == 0 or m > n:
        return []
    def token_hash(token):
        value = 0
        for ch in token:
            value = (value * base + ord(ch)) % modulus
        return value
    # Hash each token, then hash the token-hash sequence.
    values = [token_hash(token) for token in text]
    pattern_values = [token_hash(token) for token in pattern]
    power = pow(base, m - 1, modulus)
    target_hash = 0
    window_hash = 0
    for value in pattern_values:
        target_hash = (target_hash * base + value) % modulus
    for value in values[:m]:
        window_hash = (window_hash * base + value) % modulus
    found = []
    for i in range(n - m + 1):
        if window_hash == target_hash and text[i:i + m] == pattern:
            found.append(i)
        if i < n - m:
            window_hash = ((window_hash - values[i] * power) * base + values[i + m]) % modulus
    return found


def build_lps(pattern):
    """Build the KMP longest-prefix-suffix table in O(m) time."""
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1
    return lps


def kmp_search(text, pattern):
    """Return every start index using Knuth-Morris-Pratt. O(n+m)."""
    n, m = len(text), len(pattern)
    if m == 0 or m > n:
        return []
    lps = build_lps(pattern)
    found = []
    i = j = 0
    while i < n:
        if text[i] == pattern[j]:
            i += 1
            j += 1
            if j == m:
                found.append(i - j)
                j = lps[j - 1]
        elif j:
            j = lps[j - 1]
        else:
            i += 1
    return found


SEARCHERS = {
    "naive": naive_search,
    "rabin_karp": rabin_karp_search,
    "kmp": kmp_search,
}
LABELS = {
    "naive": "Naïve Pattern Matching",
    "rabin_karp": "Rabin–Karp",
    "kmp": "Knuth–Morris–Pratt (KMP)",
}


def make_shingles(tokens, size):
    """Create unique consecutive word sequences of the requested size."""
    if len(tokens) < size:
        return []
    return list(dict.fromkeys(tuple(tokens[i:i + size])
                              for i in range(len(tokens) - size + 1)))


def compare_documents(text_a, text_b, algorithm="all", ngram_size=5):
    """Compare unique word-shingles from A against B and report timings."""
    tokens_a, tokens_b = tokenize(text_a), tokenize(text_b)
    shingles = make_shingles(tokens_a, ngram_size)
    selected = list(SEARCHERS) if algorithm == "all" else [algorithm]
    results = {}
    canonical_matches = None

    for key in selected:
        search = SEARCHERS[key]
        start = time.perf_counter()
        matched = []
        for phrase in shingles:
            positions = search(tokens_b, phrase)
            if positions:
                matched.append({
                    "phrase": " ".join(phrase),
                    "positions": positions[:8],
                    "occurrences": len(positions)
                })
        elapsed = (time.perf_counter() - start) * 1000
        matched.sort(key=lambda item: (item["positions"][0], item["phrase"]))
        results[key] = {
            "name": LABELS[key],
            "time_ms": round(elapsed, 4),
            "matched_shingles": len(matched),
            "matches": matched[:100],
            "complexity": {
                "naive": "O(n × m) per pattern",
                "rabin_karp": "O(n + m) average per pattern; O(n × m) worst case",
                "kmp": "O(n + m) per pattern"
            }[key]
        }
        if canonical_matches is None:
            canonical_matches = matched

    matched_count = len(canonical_matches or [])
    total = len(shingles)
    similarity_a = (matched_count / total * 100) if total else 0.0
    # B-side coverage uses unique B shingles to make the score symmetric.
    shingles_b = make_shingles(tokens_b, ngram_size)
    matched_b = sum(1 for phrase in shingles_b if any(
        phrase == candidate for candidate in shingles
    ))
    similarity_b = (matched_b / len(shingles_b) * 100) if shingles_b else 0.0
    overall = (similarity_a + similarity_b) / 2

    return {
        "summary": {
            "similarity": round(overall, 2),
            "document_a_coverage": round(similarity_a, 2),
            "document_b_coverage": round(similarity_b, 2),
            "matched_phrases": matched_count,
            "unique_phrases_a": total,
            "words_a": len(tokens_a),
            "words_b": len(tokens_b),
            "ngram_size": ngram_size
        },
        "algorithms": results,
        "notice": "This is an educational exact-phrase checker, not a definitive plagiarism verdict. Shared phrases can occur legitimately; review context and citations."
    }
