import unittest
from algorithms import naive_search, rabin_karp_search, kmp_search, compare_documents


class SearchAlgorithmTests(unittest.TestCase):
    def test_all_algorithms_find_same_positions(self):
        text = ["a", "b", "a", "b", "a", "c"]
        pattern = ["a", "b", "a"]
        expected = [0, 2]
        self.assertEqual(naive_search(text, pattern), expected)
        self.assertEqual(rabin_karp_search(text, pattern), expected)
        self.assertEqual(kmp_search(text, pattern), expected)

    def test_no_match(self):
        text, pattern = ["one", "two", "three"], ["four"]
        self.assertEqual(naive_search(text, pattern), [])
        self.assertEqual(rabin_karp_search(text, pattern), [])
        self.assertEqual(kmp_search(text, pattern), [])

    def test_overlapping_matches(self):
        text, pattern = ["a", "a", "a", "a"], ["a", "a"]
        self.assertEqual(kmp_search(text, pattern), [0, 1, 2])

    def test_comparison_detects_shared_phrases(self):
        a = "the quick brown fox jumps over the lazy dog"
        b = "the quick brown fox jumps over a dog"
        result = compare_documents(a, b, "all", 3)
        self.assertGreater(result["summary"]["matched_phrases"], 0)
        self.assertEqual(set(result["algorithms"]), {"naive", "rabin_karp", "kmp"})


if __name__ == "__main__":
    unittest.main()
