const $ = (id) => document.getElementById(id);
const textA = $("textA"), textB = $("textB");

function countWords(text) {
  const matches = text.trim().match(/[a-z0-9]+(?:'[a-z0-9]+)?/gi);
  return matches ? matches.length : 0;
}
function updateCounts() {
  $("countA").textContent = `${countWords(textA.value)} words`;
  $("countB").textContent = `${countWords(textB.value)} words`;
}
textA.addEventListener("input", updateCounts);
textB.addEventListener("input", updateCounts);

$("sampleBtn").addEventListener("click", () => {
  textA.value = "An intelligent city uses data and technology to improve public services. Smart transportation systems can reduce traffic congestion by analyzing vehicle movement and road conditions. Efficient urban planning improves quality of life for residents.";
  textB.value = "Smart transportation systems can reduce traffic congestion by analyzing vehicle movement and road conditions. An intelligent city uses data and technology to improve public services. Public transport and efficient urban planning can improve quality of life for residents.";
  updateCounts();
});

$("runBtn").addEventListener("click", async () => {
  $("error").textContent = "";
  const button = $("runBtn");
  button.disabled = true;
  button.querySelector("span").textContent = "Analysing...";
  try {
    const response = await fetch("/api/compare", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        text_a: textA.value,
        text_b: textB.value,
        algorithm: $("algorithm").value,
        ngram_size: $("ngram").value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not compare documents.");
    renderResults(data);
  } catch (error) {
    $("error").textContent = error.message;
  } finally {
    button.disabled = false;
    button.querySelector("span").textContent = "Run analysis";
  }
});

function renderResults(data) {
  const s = data.summary;
  $("results").classList.remove("hidden");
  $("similarity").textContent = `${s.similarity}%`;
  $("meterFill").style.width = `${s.similarity}%`;
  $("matched").textContent = s.matched_phrases;
  $("phraseSub").textContent = `of ${s.unique_phrases_a} unique phrases in Document A`;
  $("coverageA").textContent = `${s.document_a_coverage}%`;
  $("coverageB").textContent = `${s.document_b_coverage}%`;

  const grid = $("algorithmGrid");
  grid.innerHTML = "";
  Object.values(data.algorithms).forEach((algo) => {
    const card = document.createElement("article");
    card.className = "algo-card";
    const heading = document.createElement("h3");
    heading.textContent = algo.name;
    const time = document.createElement("div");
    time.className = "algo-time";
    time.textContent = `${algo.time_ms.toFixed(4)} ms`;
    const count = document.createElement("p");
    count.textContent = `${algo.matched_shingles} matching phrases found`;
    const complexity = document.createElement("p");
    complexity.className = "complexity";
    complexity.textContent = `Time: ${algo.complexity}`;
    card.append(heading, time, count, complexity);
    grid.append(card);
  });

  const chosen = Object.values(data.algorithms)[0];
  const matches = chosen ? chosen.matches : [];
  $("matchCount").textContent = `${matches.length} SHOWN`;
  const list = $("matchesList");
  list.innerHTML = "";
  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "empty-match";
    empty.textContent = "No exact phrases found at this phrase length. Try a shorter phrase length.";
    list.append(empty);
  } else {
    matches.forEach((match, index) => {
      const row = document.createElement("div");
      row.className = "match-row";
      const number = document.createElement("span");
      number.className = "match-index";
      number.textContent = String(index + 1).padStart(2, "0");
      const content = document.createElement("div");
      const phrase = document.createElement("div");
      phrase.className = "match-phrase";
      phrase.textContent = `“${match.phrase}”`;
      const meta = document.createElement("div");
      meta.className = "match-meta";
      meta.textContent = `${match.occurrences} occurrence(s) in Document B · token position(s): ${match.positions.join(", ")}`;
      content.append(phrase, meta);
      row.append(number, content);
      list.append(row);
    });
  }
  $("notice").textContent = data.notice;
  $("results").scrollIntoView({behavior: "smooth", block: "start"});
}
