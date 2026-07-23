import assert from "node:assert/strict";
import test from "node:test";

import {
  allPuzzleLetters,
  countLetter,
  createPuzzleDeck,
  GAME_PUZZLE_COUNT,
  isConsonant,
  isPuzzleCharacterRevealed,
  isVowel,
  maskPhrase,
  maskWord,
  nextActivePlayer,
  normalizePhrase,
  PRIZE_VALUE,
  PUZZLES,
  shufflePuzzles,
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
  assert.equal(countLetter("FINAL ANSWER", "A"), 2);
  assert.equal(countLetter("THE BIGGEST SALE OF THE YEAR", "Z"), 0);
});

test("the puzzle board reveals called letters and keeps the rest hidden", () => {
  assert.equal(maskWord("DEAL", ["D", "A"]), "D _ A _");
  assert.equal(maskWord("A", ["A"]), "A");
  assert.equal(maskPhrase("FINAL ANSWER", []), "_ _ _ _ _  _ _ _ _ _ _");
  assert.equal(maskPhrase("FINAL ANSWER", ["A"]), "_ _ _ A _  A _ _ _ _ _");
  assert.equal(maskPhrase("FINAL ANSWER", ["A", "F"]), "F _ _ A _  A _ _ _ _ _");
  assert.equal(isPuzzleCharacterRevealed("A", ["a"]), true);
  assert.equal(isPuzzleCharacterRevealed("F", ["A"]), false);
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

test("the game ships a large, unique, board-safe puzzle bank", () => {
  assert.equal(PUZZLES.length, 100);
  assert.equal(new Set(PUZZLES.map((puzzle) => puzzle.solution)).size, PUZZLES.length);
  for (const puzzle of PUZZLES) {
    assert.ok(puzzle.words.length >= 3 && puzzle.words.length <= 7, puzzle.solution);
    assert.equal(puzzle.words.join(" "), puzzle.solution);
    assert.match(puzzle.solution, /^[A-Z0-9 ]+$/);
    assert.ok(Math.max(...puzzle.words.map((word) => word.length)) <= 12, puzzle.solution);
    assert.ok(puzzle.category.length > 0);
    assert.ok(puzzle.clue.length > 0);
  }
});

test("each new game receives a shuffled set without mutating the puzzle bank", () => {
  const source = PUZZLES.slice(0, 30);
  const originalOrder = source.map((puzzle) => puzzle.solution);
  const shuffled = shufflePuzzles(source, () => 0);
  assert.deepEqual(source.map((puzzle) => puzzle.solution), originalOrder);
  assert.notDeepEqual(shuffled.map((puzzle) => puzzle.solution), originalOrder);

  const firstDeck = createPuzzleDeck(PUZZLES, () => 0);
  const nextDeck = createPuzzleDeck(PUZZLES, () => 0, firstDeck[0].solution);
  assert.equal(firstDeck.length, GAME_PUZZLE_COUNT);
  assert.equal(new Set(firstDeck.map((puzzle) => puzzle.solution)).size, GAME_PUZZLE_COUNT);
  assert.notEqual(nextDeck[0].solution, firstDeck[0].solution);
});
