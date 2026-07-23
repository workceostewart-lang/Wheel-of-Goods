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
export const GAME_PUZZLE_COUNT = 24;

const createPuzzle = (category: string, clue: string, solution: string): Puzzle => {
  const normalizedSolution = solution.toUpperCase().replace(/\s+/g, " ").trim();
  return { category, clue, solution: normalizedSolution, words: normalizedSolution.split(" ") };
};

export const PUZZLES: Puzzle[] = [
  // Original game-night puzzles
  createPuzzle("PHRASE", "Something said before a big shopping trip", "LETS FIND THE BEST DEAL TODAY"),
  createPuzzle("THING", "A useful shopping companion", "A LIST OF THINGS TO BUY"),
  createPuzzle("PLACE", "Where bargain hunters like to look", "THE CLEARANCE AISLE AT THE STORE"),
  createPuzzle("PERSON", "Someone who knows how to find value", "A VERY SMART BARGAIN HUNTING SHOPPER"),
  createPuzzle("EVENT", "A shopping day worth waiting for", "THE BIGGEST SALE OF THE YEAR"),
  createPuzzle("FOOD AND DRINK", "What a successful market trip produces", "A CART FULL OF FRESH GROCERIES"),
  createPuzzle("PHRASE", "A reminder for a careful shopper", "SHOPPING LIST AND CHECK IT TWICE"),
  createPuzzle("WHAT ARE YOU DOING", "A mission before someone celebrates", "LOOKING FOR THE PERFECT BIRTHDAY GIFT"),
  createPuzzle("THING", "Something exciting to bring home", "A BRAND NEW PAIR OF SHOES"),
  createPuzzle("PHRASE", "What happens after finding a favorite", "PUT IT IN THE SHOPPING CART"),
  createPuzzle("PLACE", "Somewhere nobody wants to wait", "THE BUSIEST CHECKOUT LINE IN TOWN"),
  createPuzzle("FUN AND GAMES", "A perfect reason to gather together", "FAMILY GAME NIGHT AT OUR HOUSE"),

  // Phrases
  createPuzzle("PHRASE", "A common reaction to a great price", "THAT IS AN AMAZING DEAL"),
  createPuzzle("PHRASE", "Words after checking every aisle", "I FOUND EVERYTHING ON MY LIST"),
  createPuzzle("PHRASE", "What a patient shopper might say", "GOOD THINGS ARE WORTH THE WAIT"),
  createPuzzle("PHRASE", "Words before opening a package", "I CANNOT WAIT TO SEE IT"),
  createPuzzle("PHRASE", "A reminder before leaving home", "DO NOT FORGET THE SHOPPING LIST"),
  createPuzzle("PHRASE", "What someone says after saving money", "THAT WAS WORTH EVERY PENNY"),
  createPuzzle("PHRASE", "Advice when choosing between options", "TAKE YOUR TIME AND COMPARE"),
  createPuzzle("PHRASE", "A cheerful checkout comment", "HAVE A GREAT REST OF YOUR DAY"),

  // Things
  createPuzzle("THING", "Something useful on every grocery run", "A REUSABLE SHOPPING BAG"),
  createPuzzle("THING", "A small sign that catches attention", "A BRIGHT YELLOW PRICE TAG"),
  createPuzzle("THING", "A helpful tool for home cooks", "A SHINY NEW KITCHEN MIXER"),
  createPuzzle("THING", "Something made for a long stroll", "A COMFORTABLE PAIR OF WALKING SHOES"),
  createPuzzle("THING", "A healthy and colorful purchase", "A COLORFUL BASKET OF FRESH FRUIT"),
  createPuzzle("THING", "Something waiting to be opened", "A NEATLY WRAPPED BIRTHDAY PRESENT"),
  createPuzzle("THING", "A collection ready for game night", "A STACK OF FAVORITE BOARD GAMES"),
  createPuzzle("THING", "Something warm for cold weather", "A BRAND NEW WINTER COAT"),
  createPuzzle("THING", "A centerpiece for family meals", "A STURDY WOODEN DINING TABLE"),
  createPuzzle("THING", "A sweet find from a farm stand", "A SMALL JAR OF LOCAL HONEY"),
  createPuzzle("THING", "Something that makes music sound better", "A PAIR OF NOISE CANCELING HEADPHONES"),
  createPuzzle("THING", "Something useful for lunch outdoors", "A SOFT BLUE PICNIC BLANKET"),

  // Places
  createPuzzle("PLACE", "Where local growers gather", "A BUSY WEEKEND FARMERS MARKET"),
  createPuzzle("PLACE", "A peaceful stop for readers", "A QUIET CORNER BOOK STORE"),
  createPuzzle("PLACE", "Where the smell is hard to resist", "A NEIGHBORHOOD FAMILY OWNED BAKERY"),
  createPuzzle("PLACE", "A dream destination for children", "A COLORFUL DOWNTOWN TOY SHOP"),
  createPuzzle("PLACE", "Where big house projects begin", "AN ENORMOUS HOME IMPROVEMENT CENTER"),
  createPuzzle("PLACE", "Where someone can find the right tool", "A FRIENDLY LOCAL HARDWARE STORE"),
  createPuzzle("PLACE", "Where handmade treasures fill the booths", "AN OUTDOOR SUMMER CRAFT FAIR"),
  createPuzzle("PLACE", "Somewhere packed during the holidays", "A CROWDED HOLIDAY SHOPPING MALL"),
  createPuzzle("PLACE", "Where old treasures find new homes", "A SMALL TOWN ANTIQUE MARKET"),
  createPuzzle("PLACE", "Where vacation memories become souvenirs", "A POPULAR SEASIDE GIFT SHOP"),

  // People
  createPuzzle("PERSON", "Someone keeping the shelves running smoothly", "A FRIENDLY NEIGHBORHOOD STORE MANAGER"),
  createPuzzle("PERSON", "Someone ready to solve a purchase problem", "A HELPFUL CUSTOMER SERVICE EXPERT"),
  createPuzzle("PERSON", "Someone creating sparkling gifts", "A TALENTED LOCAL JEWELRY MAKER"),
  createPuzzle("PERSON", "Someone preparing for a new semester", "A PATIENT PARENT SHOPPING FOR SCHOOL"),
  createPuzzle("PERSON", "Someone making checkout more pleasant", "A CHEERFUL CASHIER WITH GREAT ADVICE"),
  createPuzzle("PERSON", "Someone making treats behind the counter", "A CREATIVE BAKER BEHIND THE COUNTER"),
  createPuzzle("PERSON", "Someone ready to save at checkout", "A CLEVER KID WITH A COUPON COLLECTION"),
  createPuzzle("PERSON", "Someone who knows every sale sign", "AN EXPERIENCED WEEKEND BARGAIN HUNTER"),
  createPuzzle("PERSON", "Someone searching for a meaningful surprise", "A THOUGHTFUL FRIEND CHOOSING A PRESENT"),
  createPuzzle("PERSON", "Someone offering one of a kind creations", "A SKILLED ARTIST SELLING HANDMADE CRAFTS"),

  // Events
  createPuzzle("EVENT", "A weekend full of secondhand treasures", "THE ANNUAL NEIGHBORHOOD YARD SALE"),
  createPuzzle("EVENT", "A celebration for a brand new business", "A GRAND OPENING CELEBRATION DOWNTOWN"),
  createPuzzle("EVENT", "A cold weather tradition with warm drinks", "A FESTIVE WINTER MARKET WEEKEND"),
  createPuzzle("EVENT", "A busy time for families and backpacks", "THE HUGE BACK TO SCHOOL SALE"),
  createPuzzle("EVENT", "A shared weekend errand", "A FAMILY SHOPPING TRIP ON SATURDAY"),
  createPuzzle("EVENT", "A late night gathering for eager readers", "A MIDNIGHT RELEASE AT THE BOOKSHOP"),
  createPuzzle("EVENT", "A chance to see new seasonal styles", "A SPRING FASHION SHOW AND SALE"),
  createPuzzle("EVENT", "A day filled with local handmade work", "A COMMUNITY CRAFT FESTIVAL IN THE PARK"),
  createPuzzle("EVENT", "A festive tradition among close friends", "A HOLIDAY GIFT EXCHANGE WITH FRIENDS"),
  createPuzzle("EVENT", "A secret celebration coming soon", "A SURPRISE BIRTHDAY PARTY NEXT WEEKEND"),

  // Food and drink
  createPuzzle("FOOD AND DRINK", "Something wonderful from the bakery", "WARM BREAD FRESH FROM THE OVEN"),
  createPuzzle("FOOD AND DRINK", "A classic treat made at home", "HOMEMADE CHOCOLATE CHIP COOKIES"),
  createPuzzle("FOOD AND DRINK", "A colorful snack from the produce aisle", "A BOWL OF SWEET SUMMER BERRIES"),
  createPuzzle("FOOD AND DRINK", "A crisp snack with a creamy side", "CRISPY APPLES AND PEANUT BUTTER"),
  createPuzzle("FOOD AND DRINK", "A towering breakfast favorite", "A GIANT STACK OF FLUFFY PANCAKES"),
  createPuzzle("FOOD AND DRINK", "A comforting dinner from the kitchen", "FRESH PASTA WITH TOMATO SAUCE"),
  createPuzzle("FOOD AND DRINK", "A sweet way to begin the morning", "WARM CINNAMON ROLLS FOR BREAKFAST"),
  createPuzzle("FOOD AND DRINK", "A healthy meal with market ingredients", "A COLORFUL SALAD FROM THE FARMERS MARKET"),
  createPuzzle("FOOD AND DRINK", "A perfect lunch on a chilly day", "GRILLED CHEESE AND TOMATO SOUP"),
  createPuzzle("FOOD AND DRINK", "A refreshing drink for hot weather", "COLD LEMONADE ON A SUNNY AFTERNOON"),
  createPuzzle("FOOD AND DRINK", "A juicy summer fruit collection", "A BASKET OF RIPE PEACHES AND PLUMS"),
  createPuzzle("FOOD AND DRINK", "A meal with plenty of flavor", "SPICY TACOS WITH FRESH SALSA"),

  // What are you doing
  createPuzzle("WHAT ARE YOU DOING", "A smart step before checkout", "COMPARING PRICES BEFORE I BUY"),
  createPuzzle("WHAT ARE YOU DOING", "The last part of a grocery trip", "CARRYING GROCERIES INTO THE KITCHEN"),
  createPuzzle("WHAT ARE YOU DOING", "Getting a surprise ready", "WRAPPING A GIFT FOR MY FRIEND"),
  createPuzzle("WHAT ARE YOU DOING", "Trying to uncover hidden savings", "SEARCHING EVERY SHELF FOR BARGAINS"),
  createPuzzle("WHAT ARE YOU DOING", "Making sure every charge is correct", "CHECKING THE RECEIPT BEFORE LEAVING"),
  createPuzzle("WHAT ARE YOU DOING", "Planning what to cook tonight", "MAKING A LIST FOR DINNER"),
  createPuzzle("WHAT ARE YOU DOING", "Checking the fit before buying", "TRYING ON A NEW JACKET"),
  createPuzzle("WHAT ARE YOU DOING", "Preparing discounts for the next trip", "SAVING COUPONS FOR THE WEEKEND"),
  createPuzzle("WHAT ARE YOU DOING", "Choosing something bright and fragrant", "PICKING FLOWERS AT THE MARKET"),
  createPuzzle("WHAT ARE YOU DOING", "Getting a meal from a mobile kitchen", "ORDERING LUNCH FROM A FOOD TRUCK"),
  createPuzzle("WHAT ARE YOU DOING", "Making furniture with your own hands", "BUILDING A BOOKSHELF FROM SCRATCH"),
  createPuzzle("WHAT ARE YOU DOING", "Preparing for a colorful room makeover", "CHOOSING PAINT FOR THE BEDROOM"),

  // Fun and games
  createPuzzle("FUN AND GAMES", "A classic activity after dinner", "PLAYING CARDS AROUND THE KITCHEN TABLE"),
  createPuzzle("FUN AND GAMES", "Completing a picture one piece at a time", "FINISHING A GIANT JIGSAW PUZZLE"),
  createPuzzle("FUN AND GAMES", "Taking a chance during game night", "ROLLING DICE ON FAMILY GAME NIGHT"),
  createPuzzle("FUN AND GAMES", "Supporting the players on the field", "CHEERING FOR THE WINNING TEAM"),
  createPuzzle("FUN AND GAMES", "Preparing clues around the yard", "PLANNING A BACKYARD TREASURE HUNT"),
  createPuzzle("FUN AND GAMES", "Enjoying a windy afternoon outside", "FLYING KITES AT THE PARK"),
  createPuzzle("FUN AND GAMES", "Trying to knock down every pin", "BOWLING WITH THE WHOLE FAMILY"),
  createPuzzle("FUN AND GAMES", "Competing with tiny vehicles", "RACING REMOTE CONTROL CARS OUTSIDE"),
  createPuzzle("FUN AND GAMES", "Stacking pieces as high as possible", "BUILDING THE TALLEST BLOCK TOWER"),
  createPuzzle("FUN AND GAMES", "Acting without saying a word", "PLAYING CHARADES AFTER DINNER"),
  createPuzzle("FUN AND GAMES", "Thinking through tricky clues together", "SOLVING RIDDLES WITH BEST FRIENDS"),
  createPuzzle("FUN AND GAMES", "Preparing a snack before the feature", "MAKING POPCORN FOR MOVIE NIGHT"),
  createPuzzle("FUN AND GAMES", "Turning a drive into a concert", "SINGING FAVORITE SONGS IN THE CAR"),
  createPuzzle("FUN AND GAMES", "Sharing laughs beside a fire", "TELLING FUNNY STORIES AROUND THE CAMPFIRE"),
];

export const shufflePuzzles = (
  puzzles: Puzzle[],
  random: () => number = Math.random,
) => {
  const deck = [...puzzles];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.min(index, Math.floor(random() * (index + 1)));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
};

export const createPuzzleDeck = (
  puzzles: Puzzle[] = PUZZLES,
  random: () => number = Math.random,
  previousFirstSolution?: string,
) => {
  const deck = shufflePuzzles(puzzles, random);
  if (deck.length > 1 && deck[0].solution === previousFirstSolution) {
    [deck[0], deck[1]] = [deck[1], deck[0]];
  }
  return deck.slice(0, GAME_PUZZLE_COUNT);
};

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
