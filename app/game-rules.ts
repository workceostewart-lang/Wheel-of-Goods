export type Puzzle = {
  category: string;
  clue: string;
  solution: string;
  words: string[];
};

export const WINNING_TOTAL = 10_000;
export const VOWEL_COST = 250;
export const PRIZE_VALUE = 2_000;
export const VOWELS = ["A", "E", "I", "O", "U"];

export const PUZZLES: Puzzle[] = [
  {
    category: "PHRASE",
    clue: "Something said before a big shopping trip",
    solution: "LETS FIND THE BEST DEAL TODAY",
    words: ["LETS", "FIND", "THE", "BEST", "DEAL", "TODAY"],
  },
  {
    category: "THING",
    clue: "A useful shopping companion",
    solution: "A LIST OF THINGS TO BUY",
    words: ["A", "LIST", "OF", "THINGS", "TO", "BUY"],
  },
  {
    category: "PLACE",
    clue: "Where bargain hunters like to look",
    solution: "THE CLEARANCE AISLE AT THE STORE",
    words: ["THE", "CLEARANCE", "AISLE", "AT", "THE", "STORE"],
  },
  {
    category: "PERSON",
    clue: "Someone who knows how to find value",
    solution: "A VERY SMART BARGAIN HUNTING SHOPPER",
    words: ["A", "VERY", "SMART", "BARGAIN", "HUNTING", "SHOPPER"],
  },
  {
    category: "EVENT",
    clue: "A shopping day worth waiting for",
    solution: "THE BIGGEST SALE OF THE YEAR",
    words: ["THE", "BIGGEST", "SALE", "OF", "THE", "YEAR"],
  },
  {
    category: "FOOD AND DRINK",
    clue: "What a successful market trip produces",
    solution: "A CART FULL OF FRESH GROCERIES",
    words: ["A", "CART", "FULL", "OF", "FRESH", "GROCERIES"],
  },
  {
    category: "PHRASE",
    clue: "A reminder for a careful shopper",
    solution: "SHOPPING LIST AND CHECK IT TWICE",
    words: ["SHOPPING", "LIST", "AND", "CHECK", "IT", "TWICE"],
  },
  {
    category: "WHAT ARE YOU DOING",
    clue: "A mission before someone celebrates",
    solution: "LOOKING FOR THE PERFECT BIRTHDAY GIFT",
    words: ["LOOKING", "FOR", "THE", "PERFECT", "BIRTHDAY", "GIFT"],
  },
  {
    category: "THING",
    clue: "Something exciting to bring home",
    solution: "A BRAND NEW PAIR OF SHOES",
    words: ["A", "BRAND", "NEW", "PAIR", "OF", "SHOES"],
  },
  {
    category: "PHRASE",
    clue: "What happens after finding a favorite",
    solution: "PUT IT IN THE SHOPPING CART",
    words: ["PUT", "IT", "IN", "THE", "SHOPPING", "CART"],
  },
  {
    category: "PLACE",
    clue: "Somewhere nobody wants to wait",
    solution: "THE BUSIEST CHECKOUT LINE IN TOWN",
    words: ["THE", "BUSIEST", "CHECKOUT", "LINE", "IN", "TOWN"],
  },
  {
    category: "FUN AND GAMES",
    clue: "A perfect reason to gather together",
    solution: "FAMILY GAME NIGHT AT OUR HOUSE",
    words: ["FAMILY", "GAME", "NIGHT", "AT", "OUR", "HOUSE"],
  },
];

export const normalizePhrase = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const isVowel = (letter: string) => VOWELS.includes(letter.toUpperCase());

export const isConsonant = (letter: string) => /^[A-Z]$/.test(letter.toUpperCase()) && !isVowel(letter);

export const countLetter = (solution: string, letter: string) => {
  const target = letter.toUpperCase();
  return [...normalizePhrase(solution)].filter((character) => character === target).length;
};

export const isPuzzleCharacterRevealed = (character: string, guessedLetters: string[]) => {
  const normalizedCharacter = character.toUpperCase();
  return !/[A-Z0-9]/.test(normalizedCharacter) ||
    guessedLetters.some((letter) => letter.toUpperCase() === normalizedCharacter);
};

export const maskWord = (word: string, guessedLetters: string[]) => {
  return [...word.toUpperCase()]
    .map((character) => (isPuzzleCharacterRevealed(character, guessedLetters) ? character : "_"))
    .join(" ");
};

export const maskPhrase = (solution: string, guessedLetters: string[]) =>
  solution
    .trim()
    .split(/\s+/)
    .map((word) => maskWord(word, guessedLetters))
    .join("  ");

export const isWordRevealed = (word: string, guessedLetters: string[]) =>
  !maskWord(word, guessedLetters).includes("_");

export const allPuzzleLetters = (solution: string) =>
  [...new Set([...normalizePhrase(solution)].filter((character) => /[A-Z]/.test(character)))];

export const nextActivePlayer = (
  currentPlayer: number,
  playerCount: number,
  eliminatedPlayers: number[],
) => {
  for (let offset = 1; offset <= playerCount; offset += 1) {
    const candidate = (currentPlayer + offset) % playerCount;
    if (!eliminatedPlayers.includes(candidate)) return candidate;
  }
  return null;
};
