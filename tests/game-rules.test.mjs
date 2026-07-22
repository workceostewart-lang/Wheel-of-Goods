import assert from "node:assert/strict";
import test from "node:test";

import {
  allPuzzleLetters,
  countLetter,
  isConsonant,
  isVowel,
  maskWord,
  nextActivePlayer,
  normalizePhrase,
  PRIZE_VALUE,
  PUZZLES,
  VOWEL_COST,
  WINNING_TOTAL,
} from "../app/game-rules.ts";

test("uses the official board-game economy", () => {
  assert.equal(VOWEL_COST, 250);
  assert.equal(WINNING_TOTAL, 10_000);
  assert.equal(PRIZE_VALUE, 2_000);
});

test("normalizes puzzle solutions for exact, punctuation-safe solving", () => {
  assert.equal(normalizePhrase("  Let's   find-the deal!  "), "LETS FINDTHE DEAL");
});

test("a correct consonant is paid once for every occurrence", () => {
  assert.equal(countLetter("THE BIGGEST SALE OF THE YEAR", "T"), 3);
  assert.equal(countLetter("THE BIGGEST SALE OF THE YEAR", "Z"), 0);
});

test("the puzzle board reveals called letters and keeps the rest hidden", () => {
  assert.equal(maskWord("DEAL", ["D", "A"]), "D•A•");
  assert.equal(maskWord("A", ["A"]), "A");
  assert.deepEqual(allPuzzleLetters("A BAD BAG"), ["A", "B", "D", "G"]);
});

test("only A E I O U may be bought as vowels", () => {
  assert.equal(isVowel("a"), true);
  assert.equal(isVowel("Y"), false);
  assert.equal(isVowel("T"), false);
  assert.equal(isConsonant("Y"), true);
  assert.equal(isConsonant("T"), true);
  assert.equal(isConsonant("1"), false);
});

test("turn order skips players eliminated by an incorrect solution", () => {
  assert.equal(nextActivePlayer(0, 4, [1, 2]), 3);
  assert.equal(nextActivePlayer(3, 4, [0, 1]), 2);
  assert.equal(nextActivePlayer(0, 2, [0, 1]), null);
});

test("every puzzle fits the existing six-row board", () => {
  assert.ok(PUZZLES.length >= 10);
  for (const puzzle of PUZZLES) {
    assert.equal(puzzle.words.length, 6, puzzle.solution);
    assert.equal(puzzle.words.join(" "), puzzle.solution);
    assert.ok(puzzle.category.length > 0);
    assert.ok(puzzle.clue.length > 0);
  }
});
