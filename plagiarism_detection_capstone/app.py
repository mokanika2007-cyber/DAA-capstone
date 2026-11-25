from flask import Flask, render_template, request, jsonify
from algorithms import compare_documents

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # 2 MB per request


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/compare", methods=["POST"])
def compare():
    data = request.get_json(silent=True) or {}
    text_a = (data.get("text_a") or "").strip()
    text_b = (data.get("text_b") or "").strip()
    algorithm = data.get("algorithm", "all")
    ngram_size = data.get("ngram_size", 5)

    if len(text_a) < 20 or len(text_b) < 20:
        return jsonify({"error": "Please provide at least 20 characters in both documents."}), 400
    if algorithm not in {"all", "naive", "rabin_karp", "kmp"}:
        return jsonify({"error": "Invalid algorithm selection."}), 400
    try:
        ngram_size = int(ngram_size)
        if not 2 <= ngram_size <= 12:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "Phrase length must be between 2 and 12 words."}), 400

    try:
        return jsonify(compare_documents(text_a, text_b, algorithm, ngram_size))
    except Exception as exc:
        app.logger.exception("Comparison failed")
        return jsonify({"error": f"Comparison failed: {str(exc)}"}), 500


@app.errorhandler(413)
def too_large(_error):
    return jsonify({"error": "Request too large. Keep each document under 2 MB."}), 413


if __name__ == "__main__":
    app.run(debug=True, port=5000)
