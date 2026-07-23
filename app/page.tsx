"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  allPuzzleLetters,
  countLetter,
  isConsonant,
  isPuzzleCharacterRevealed,
  isVowel,
  maskPhrase,
  nextActivePlayer,
  normalizePhrase,
  PRIZE_VALUE,
  PUZZLES,
  VOWEL_COST,
  WINNING_TOTAL,
} from "./game-rules";

type Screen = "menu" | "setup" | "game" | "rules";
type Phase = "qualifying" | "spin" | "spinning" | "answer" | "freeSpinChoice" | "turnOver" | "roundOver" | "gameOver";
type SoundName = "click" | "spin" | "correct" | "wrong" | "win";

type Player = {
  name: string;
  money: number;
  color: string;
};

type WheelResult = {
  label: string;
  type: "cash" | "prize" | "freeSpin" | "bankrupt" | "lose";
  value: number;
};

const PLAYER_COLORS = ["#4f7cff", "#31cf80", "#ff4d62", "#a855f7"];

const WHEEL_RESULTS: WheelResult[] = [
  { label: "$100", type: "cash", value: 100 },
  { label: "$250", type: "cash", value: 250 },
  { label: "PRIZE", type: "prize", value: PRIZE_VALUE },
  { label: "$500", type: "cash", value: 500 },
  { label: "LOSE", type: "lose", value: 0 },
  { label: "$750", type: "cash", value: 750 },
  { label: "$150", type: "cash", value: 150 },
  { label: "FREE", type: "freeSpin", value: 0 },
  { label: "$400", type: "cash", value: 400 },
  { label: "BANKRUPT", type: "bankrupt", value: 0 },
  { label: "$1K", type: "cash", value: 1000 },
  { label: "$600", type: "cash", value: 600 },
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [round, setRound] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [strikes, setStrikes] = useState(0);
  const [phase, setPhase] = useState<Phase>("qualifying");
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState<WheelResult | null>(null);
  const [roundBanks, setRoundBanks] = useState<number[]>([]);
  const [roundPrizes, setRoundPrizes] = useState<number[]>([]);
  const [freeSpins, setFreeSpins] = useState<number[]>([]);
  const [pendingTurnLoss, setPendingTurnLoss] = useState<{ reason: string; bankrupt: boolean } | null>(null);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<number[]>([]);
  const [qualifyingValues, setQualifyingValues] = useState<number[]>([]);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Spin the wheel to start!");
  const [soundOn, setSoundOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const spinTimerRef = useRef<number | null>(null);

  const puzzle = PUZZLES[round % PUZZLES.length];

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
      audioRef.current?.close();
    };
  }, []);

  const playSound = useCallback(
    (name: SoundName) => {
      if (!soundOn || typeof window === "undefined") return;
      try {
        const context = audioRef.current ?? new AudioContext();
        audioRef.current = context;
        const now = context.currentTime;
        const tones: Record<SoundName, number[]> = {
          click: [260],
          spin: [180, 240, 310],
          correct: [523, 659, 784],
          wrong: [170, 125],
          win: [523, 659, 784, 1047],
        };
        tones[name].forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = name === "wrong" ? "sawtooth" : "sine";
          oscillator.frequency.setValueAtTime(frequency, now + index * 0.1);
          gain.gain.setValueAtTime(0.0001, now + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.1 + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.16);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(now + index * 0.1);
          oscillator.stop(now + index * 0.1 + 0.18);
        });
      } catch {
        // The game remains fully playable if a browser blocks audio.
      }
    },
    [soundOn],
  );

  const goTo = (next: Screen) => {
    playSound("click");
    setSettingsOpen(false);
    setScreen(next);
  };

  const startGame = () => {
    const gamePlayers = Array.from({ length: playerCount }, (_, index) => ({
      name: names[index].trim() || `Player ${index + 1}`,
      money: 0,
      color: PLAYER_COLORS[index],
    }));
    setPlayers(gamePlayers);
    setCurrentPlayer(0);
    setRound(0);
    setGuessedLetters([]);
    setStrikes(0);
    setRoundBanks(Array(playerCount).fill(0));
    setRoundPrizes(Array(playerCount).fill(0));
    setFreeSpins(Array(playerCount).fill(0));
    setEliminatedPlayers([]);
    setQualifyingValues(Array(playerCount).fill(0));
    setRoundWinner(null);
    setPhase(playerCount === 1 ? "spin" : "qualifying");
    setWheelResult(null);
    setPendingTurnLoss(null);
    setGuess("");
    setMessage(
      playerCount === 1
        ? `${gamePlayers[0].name}, spin the wheel!`
        : `${gamePlayers[0].name}, spin for the starting position!`,
    );
    playSound("win");
    setScreen("game");
  };

  const advancePlayer = useCallback(() => {
    const nextIndex = nextActivePlayer(currentPlayer, players.length, eliminatedPlayers);
    setWheelResult(null);
    setGuess("");
    if (nextIndex === null || eliminatedPlayers.length >= players.length) {
      setRoundWinner(null);
      setPhase("roundOver");
      setRoundBanks(Array(players.length).fill(0));
      setRoundPrizes(Array(players.length).fill(0));
      setMessage("No one solved the puzzle. Everyone will spin to start the next round.");
      return;
    }
    setCurrentPlayer(nextIndex);
    setPhase("spin");
    setMessage(`${players[nextIndex]?.name ?? "Next player"}, spin, buy a vowel, or solve!`);
  }, [currentPlayer, eliminatedPlayers, players]);

  const nextRound = () => {
    const next = round + 1;
    const previousWinner = roundWinner;
    setRound(next);
    setGuessedLetters([]);
    setStrikes(0);
    setRoundBanks(Array(players.length).fill(0));
    setRoundPrizes(Array(players.length).fill(0));
    setEliminatedPlayers([]);
    setWheelResult(null);
    setGuess("");
    setRoundWinner(null);
    setPendingTurnLoss(null);
    if (previousWinner !== null || players.length === 1) {
      const starter = previousWinner ?? 0;
      setCurrentPlayer(starter);
      setQualifyingValues(Array(players.length).fill(0));
      setPhase("spin");
      setMessage(`${players[starter]?.name ?? "Player"} won the last round and starts this one!`);
    } else {
      setCurrentPlayer(0);
      setQualifyingValues(Array(players.length).fill(0));
      setPhase("qualifying");
      setMessage(`${players[0]?.name ?? "Player 1"}, spin for the starting position!`);
    }
    playSound("click");
  };

  const loseTurn = useCallback(
    (reason: string, bankrupt = false) => {
      if ((freeSpins[currentPlayer] ?? 0) > 0) {
        setPendingTurnLoss({ reason, bankrupt });
        setWheelResult(null);
        setPhase("freeSpinChoice");
        setMessage(`${reason} Use a Free Spin to keep the turn, or save it and pass.`);
        playSound("click");
        return;
      }

      if (bankrupt) {
        setRoundBanks((current) => current.map((bank, index) => (index === currentPlayer ? 0 : bank)));
        setRoundPrizes((current) => current.map((prize, index) => (index === currentPlayer ? 0 : prize)));
      }
      setWheelResult(null);
      setPhase("turnOver");
      setMessage(reason);
      playSound("wrong");
    },
    [currentPlayer, freeSpins, playSound],
  );

  const useFreeSpin = () => {
    if (!pendingTurnLoss || (freeSpins[currentPlayer] ?? 0) < 1) return;
    setFreeSpins((current) =>
      current.map((tokens, index) => (index === currentPlayer ? tokens - 1 : tokens)),
    );
    setPendingTurnLoss(null);
    setWheelResult(null);
    setPhase("spin");
    setMessage(`Free Spin used — ${players[currentPlayer]?.name} keeps the turn and round winnings!`);
    playSound("click");
  };

  const declineFreeSpin = () => {
    if (!pendingTurnLoss) return;
    if (pendingTurnLoss.bankrupt) {
      setRoundBanks((current) => current.map((bank, index) => (index === currentPlayer ? 0 : bank)));
      setRoundPrizes((current) => current.map((prize, index) => (index === currentPlayer ? 0 : prize)));
    }
    const reason = pendingTurnLoss.reason;
    setPendingTurnLoss(null);
    setWheelResult(null);
    setPhase("turnOver");
    setMessage(`${reason} Free Spin saved for later.`);
    playSound("wrong");
  };

  const spinWheel = () => {
    if (phase !== "spin" && phase !== "qualifying") return;
    playSound("spin");
    const cashIndexes = WHEEL_RESULTS
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.type === "cash");
    const availableQualifying = cashIndexes.filter(
      ({ result }) => !qualifyingValues.includes(result.value),
    );
    const eligibleIndexes =
      phase === "qualifying"
        ? availableQualifying
        : players.length === 1
          ? WHEEL_RESULTS
              .map((result, index) => ({ result, index }))
              .filter(({ result }) => result.type !== "lose" && result.type !== "freeSpin")
          : WHEEL_RESULTS.map((result, index) => ({ result, index }));
    const selection = eligibleIndexes[Math.floor(Math.random() * eligibleIndexes.length)];
    const resultIndex = selection.index;
    const result = WHEEL_RESULTS[resultIndex];
    const segmentAngle = 360 / WHEEL_RESULTS.length;
    const alignment = 360 - (resultIndex * segmentAngle + segmentAngle / 2);
    const turns = reducedMotion ? 1 : 5 + Math.floor(Math.random() * 3);
    const nextRotation = Math.ceil(wheelRotation / 360) * 360 + turns * 360 + alignment;
    setWheelRotation(nextRotation);
    setWheelResult(null);
    setPhase("spinning");
    setMessage("Round and round it goes…");

    spinTimerRef.current = window.setTimeout(
      () => {
        setWheelResult(result);
        if (phase === "qualifying") {
          const nextValues = qualifyingValues.map((value, index) =>
            index === currentPlayer ? result.value : value,
          );
          setQualifyingValues(nextValues);
          if (currentPlayer < players.length - 1) {
            const nextIndex = currentPlayer + 1;
            setCurrentPlayer(nextIndex);
            setPhase("qualifying");
            setMessage(
              `${players[currentPlayer]?.name} spun ${result.label}. ${players[nextIndex]?.name}, your opening spin!`,
            );
          } else {
            const starter = nextValues.reduce(
              (bestIndex, value, index, values) => (value > values[bestIndex] ? index : bestIndex),
              0,
            );
            setCurrentPlayer(starter);
            setPhase("spin");
            setWheelResult(null);
            setMessage(
              `${players[starter]?.name} won the opening spin with $${nextValues[starter].toLocaleString()} and starts Round ${round + 1}!`,
            );
            playSound("win");
          }
          return;
        }
        if (result.type === "bankrupt") {
          loseTurn("BANKRUPT! Round cash and prizes are returned, and the turn ends.", true);
        } else if (result.type === "lose") {
          loseTurn("Lose a Turn! Pass play to the next player.");
        } else {
          setMessage(`${result.label} is live — call one consonant!`);
          setPhase("answer");
          playSound("click");
        }
      },
      reducedMotion ? 450 : 3000,
    );
  };

  const submitGuess = (event: FormEvent) => {
    event.preventDefault();
    if ((phase !== "answer" && phase !== "spin") || !guess.trim()) return;

    const submitted = normalizePhrase(guess);
    setGuess("");

    if (phase === "spin") {
      if (submitted.length === 1 && isVowel(submitted)) {
        if (guessedLetters.includes(submitted)) {
          setMessage(`${submitted} was already called. Choose another vowel, solve, or spin.`);
          return;
        }
        if ((roundBanks[currentPlayer] ?? 0) < VOWEL_COST) {
          setMessage(`A vowel costs $${VOWEL_COST}. Earn more round cash or spin first.`);
          playSound("wrong");
          return;
        }
        const matches = countLetter(puzzle.solution, submitted);
        setRoundBanks((current) =>
          current.map((bank, index) => (index === currentPlayer ? bank - VOWEL_COST : bank)),
        );
        setGuessedLetters((current) => [...current, submitted]);
        setMessage(
          matches > 0
            ? `${submitted} appears ${matches} ${matches === 1 ? "time" : "times"}. $${VOWEL_COST} paid — keep your turn!`
            : `No ${submitted}, but the vowel still costs $${VOWEL_COST}. You keep your turn.`,
        );
        playSound(matches > 0 ? "correct" : "wrong");
        return;
      }

      if (submitted.length === 1) {
        setMessage("Spin the wheel before calling a consonant, or enter the full puzzle to solve.");
        return;
      }

      if (submitted === normalizePhrase(puzzle.solution)) {
        const roundPayout = (roundBanks[currentPlayer] ?? 0) + (roundPrizes[currentPlayer] ?? 0);
        const nextTotal = players[currentPlayer].money + roundPayout;
        setPlayers((current) =>
          current.map((player, index) =>
            index === currentPlayer ? { ...player, money: nextTotal } : player,
          ),
        );
        setGuessedLetters(allPuzzleLetters(puzzle.solution));
        setRoundBanks(Array(players.length).fill(0));
        setRoundPrizes(Array(players.length).fill(0));
        setRoundWinner(currentPlayer);
        playSound("win");
        if (nextTotal >= WINNING_TOTAL) {
          setPhase("gameOver");
          setMessage(`${players[currentPlayer].name} solved it and reached $${WINNING_TOTAL.toLocaleString()}!`);
        } else {
          setPhase("roundOver");
          setMessage(
            `${players[currentPlayer].name} solved it! $${roundPayout.toLocaleString()} is banked for a total of $${nextTotal.toLocaleString()}.`,
          );
        }
        return;
      }

      const nextEliminated = [...new Set([...eliminatedPlayers, currentPlayer])];
      setEliminatedPlayers(nextEliminated);
      setRoundBanks((current) => current.map((bank, index) => (index === currentPlayer ? 0 : bank)));
      setRoundPrizes((current) => current.map((prize, index) => (index === currentPlayer ? 0 : prize)));
      setStrikes((current) => current + 1);
      playSound("wrong");
      if (players.length === 1 || nextEliminated.length >= players.length) {
        setRoundWinner(null);
        setRoundBanks(Array(players.length).fill(0));
        setRoundPrizes(Array(players.length).fill(0));
        setPhase("roundOver");
        setMessage("That solution was incorrect. The round ends with no winner.");
      } else {
        setPhase("turnOver");
        setMessage("Incorrect solution. Round winnings are returned, and this player sits out until the next round.");
      }
      return;
    }

    if (!wheelResult) return;
    if (!isConsonant(submitted)) {
      setMessage("After a spin, call exactly one consonant.");
      return;
    }

    if (guessedLetters.includes(submitted)) {
      setStrikes((current) => current + 1);
      loseTurn(`${submitted} was already called. The turn ends.`);
      return;
    }

    const matches = countLetter(puzzle.solution, submitted);
    setGuessedLetters((current) => [...current, submitted]);
    setWheelResult(null);

    if (matches > 0) {
      let rewardMessage = "";
      if (wheelResult.type === "cash") {
        const won = wheelResult.value * matches;
        setRoundBanks((current) =>
          current.map((bank, index) => (index === currentPlayer ? bank + won : bank)),
        );
        rewardMessage = `+$${won.toLocaleString()} in round cash.`;
      } else if (wheelResult.type === "prize") {
        setRoundPrizes((current) =>
          current.map((prize, index) => (index === currentPlayer ? prize + PRIZE_VALUE : prize)),
        );
        rewardMessage = `Prize wedge worth $${PRIZE_VALUE.toLocaleString()} secured for this round.`;
      } else if (wheelResult.type === "freeSpin") {
        setFreeSpins((current) =>
          current.map((tokens, index) => (index === currentPlayer ? tokens + 1 : tokens)),
        );
        rewardMessage = "Free Spin token earned.";
      }
      playSound("correct");
      setMessage(`${submitted} appears ${matches} ${matches === 1 ? "time" : "times"}. ${rewardMessage}`);
      setPhase("spin");
    } else {
      setStrikes((current) => current + 1);
      loseTurn(`There is no ${submitted} in the puzzle. The turn ends.`);
    }
  };

  const winner = useMemo(() => {
    if (!players.length) return null;
    return [...players].sort((a, b) => b.money - a.money)[0];
  }, [players]);

  return (
    <main className={`app ${reducedMotion ? "reduce-motion" : ""}`}>
      <div className="rainbow-rail" aria-hidden="true" />

      {screen === "menu" && (
        <section className="menu-screen" data-testid="menu-screen">
          <header className="menu-topbar">
            <a className="studio-mark" href="https://fantomzone.app" aria-label="Fantom Zone home">
              <span className="studio-gem" aria-hidden="true">FZ</span>
              <span>FANTOM ZONE <small>ARCADE</small></span>
            </a>
            <div className="top-actions">
              <button className="icon-button" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Mute sound" : "Turn sound on"}>
                {soundOn ? "♪" : "×"}
              </button>
              <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Open settings">⚙</button>
            </div>
          </header>

          <div className="menu-stage">
            <div className="menu-wheel-wrap" aria-hidden="true">
              <div className="menu-wheel">
                <span>SPIN</span>
              </div>
              <div className="orbit orbit-one">★</div>
              <div className="orbit orbit-two">$</div>
              <div className="orbit orbit-three">?</div>
            </div>

            <div className="menu-content">
              <p className="eyebrow"><span /> EVERY ANSWER HAS A PRICE <span /></p>
              <h1 aria-label="Wheel of Goods">
                <span className="title-wheel">WHEEL</span>
                <span className="title-of">OF</span>
                <span className="title-goods">GOODS</span>
              </h1>
              <p className="menu-copy">Spin big. Call letters. Solve the puzzle and build a fortune!</p>

              <div className="menu-buttons">
                <button className="primary-play" data-testid="play-button" onClick={() => goTo("setup")}>
                  <span className="play-triangle" aria-hidden="true">▶</span>
                  PLAY NOW
                  <small>1–4 LOCAL PLAYERS</small>
                </button>
                <button className="secondary-button" onClick={() => goTo("rules")}>
                  <span aria-hidden="true">?</span> HOW TO PLAY
                </button>
              </div>
              <div className="menu-features" aria-label="Game features">
                <span>⚡ Quick rounds</span>
                <span>◎ Family friendly</span>
                <span>★ Official wheel rules</span>
              </div>
            </div>
          </div>
          <footer className="menu-footer"><span>v1.0</span><span>MADE FOR GAME NIGHT</span><span>PC + MOBILE</span></footer>
        </section>
      )}

      {screen === "setup" && (
        <section className="panel-screen setup-screen" data-testid="setup-screen">
          <button className="back-button" onClick={() => goTo("menu")}>← MENU</button>
          <div className="setup-card">
            <p className="eyebrow"><span /> GAME SETUP <span /></p>
            <h2>Who’s spinning?</h2>
            <p>Pass one device around and take turns at the wheel.</p>
            <div className="count-picker" aria-label="Number of players">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  className={playerCount === count ? "active" : ""}
                  onClick={() => { setPlayerCount(count); playSound("click"); }}
                  aria-pressed={playerCount === count}
                >
                  <strong>{count}</strong><span>{count === 1 ? "PLAYER" : "PLAYERS"}</span>
                </button>
              ))}
            </div>
            <div className="name-fields">
              {Array.from({ length: playerCount }, (_, index) => (
                <label key={index} style={{ "--player-color": PLAYER_COLORS[index] } as React.CSSProperties}>
                  <span>PLAYER {index + 1}</span>
                  <input
                    value={names[index]}
                    maxLength={14}
                    onChange={(event) => setNames((current) => current.map((name, nameIndex) => nameIndex === index ? event.target.value : name))}
                    aria-label={`Player ${index + 1} name`}
                  />
                </label>
              ))}
            </div>
            <button className="start-button" data-testid="start-game-button" onClick={startGame}>START THE SHOW <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "rules" && (
        <section className="panel-screen rules-screen" data-testid="rules-screen">
          <button className="back-button" onClick={() => goTo("menu")}>← MENU</button>
          <div className="rules-card">
            <p className="eyebrow"><span /> HOW TO PLAY <span /></p>
            <h2>Spin. Call. Solve it.</h2>
            <div className="rule-grid">
              <article><b>1</b><div><h3>Spin and call</h3><p>Spin, then call one consonant. Earn the wheel value for every match.</p></div></article>
              <article><b>2</b><div><h3>Buy vowels</h3><p>Before spinning, spend $250 of your round cash to call a vowel.</p></div></article>
              <article><b>3</b><div><h3>Solve the puzzle</h3><p>Before spinning, enter the full solution. The winner banks that round’s cash and prizes.</p></div></article>
              <article><b>4</b><div><h3>Reach $10,000</h3><p>Bankrupt loses only that round’s winnings. The first player to $10,000 wins.</p></div></article>
            </div>
            <button className="start-button" onClick={() => goTo("setup")}>LET’S PLAY <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="game-screen" data-testid="game-screen">
          <header className="game-header">
            <button className="mini-logo" onClick={() => goTo("menu")} aria-label="Return to menu"><b>W</b><span>WHEEL OF<br />GOODS</span></button>
            <div className="round-label">ROUND <strong>{round + 1}</strong><small> TO $10K</small></div>
            <div className="header-actions">
              <button className="icon-button small" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Mute sound" : "Turn sound on"}>{soundOn ? "♪" : "×"}</button>
              <button className="icon-button small" onClick={() => setSettingsOpen(true)} aria-label="Open settings">⚙</button>
            </div>
          </header>

          <div className="question-bar" data-testid="question-bar">
            <span className="question-number">Q{round + 1}</span>
            <h2>{puzzle.category} • {puzzle.clue}</h2>
            <div className="strikes" aria-label={`${strikes} missed calls`}>
              {[0, 1, 2].map((strike) => <span key={strike} className={strike < strikes ? "hit" : ""}>×</span>)}
            </div>
          </div>

          <div className="game-board">
            <section className="wheel-zone" aria-label="Prize wheel">
              <div className="turn-chip" style={{ "--player-color": players[currentPlayer]?.color ?? PLAYER_COLORS[0] } as React.CSSProperties}>
                <span>NOW PLAYING</span><strong>{players[currentPlayer]?.name}</strong>
              </div>
              <div className="wheel-frame">
                <div className="wheel-pointer" aria-hidden="true">▼</div>
                <div
                  className={`prize-wheel ${phase === "spinning" ? "is-spinning" : ""}`}
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                  data-testid="prize-wheel"
                >
                  {WHEEL_RESULTS.map((result, index) => (
                    <span key={`${result.label}-${index}`} style={{ "--i": index } as React.CSSProperties}>{result.label}</span>
                  ))}
                  <i>W</i>
                </div>
              </div>
              <button
                className="spin-button"
                data-testid="spin-button"
                onClick={spinWheel}
                disabled={phase !== "spin" && phase !== "qualifying"}
              >
                {phase === "spinning" ? "SPINNING…" : phase === "qualifying" ? "OPENING SPIN" : "SPIN THE WHEEL"}
              </button>
            </section>

            <section className="answer-zone" aria-label="Puzzle board">
              <div className="answer-heading"><span>PUZZLE BOARD</span><span>{guessedLetters.length} LETTERS CALLED</span></div>
              <div
                className="answer-board"
                data-testid="answer-board"
                aria-label={`Puzzle: ${maskPhrase(puzzle.solution, guessedLetters)}`}
                aria-live="polite"
              >
                {puzzle.words.map((word, wordIndex) => (
                  <span className="puzzle-word" key={`${word}-${wordIndex}`} aria-hidden="true">
                    {[...word].map((character, characterIndex) => {
                      const isRevealed = isPuzzleCharacterRevealed(character, guessedLetters);
                      return (
                        <span
                          className={`puzzle-letter ${isRevealed ? "revealed" : "hidden"}`}
                          key={`${character}-${characterIndex}`}
                        >
                          {isRevealed ? character : "_"}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </div>
              <div className="status-callout" aria-live="polite" data-testid="game-message">
                <span>{wheelResult ? wheelResult.label : phase === "answer" ? "?" : "★"}</span>
                <p>{message}</p>
              </div>
            </section>
          </div>

          <div className="game-controls">
            <div className="score-strip" aria-label="Player money">
              {players.map((player, index) => (
                <div key={`${player.name}-${index}`} className={index === currentPlayer ? "current" : ""} style={{ "--player-color": player.color } as React.CSSProperties}>
                  <span>{player.name}</span><strong>${(player.money + (roundBanks[index] ?? 0) + (roundPrizes[index] ?? 0)).toLocaleString()}</strong>
                </div>
              ))}
            </div>

            {(phase === "answer" || phase === "spin") && (
              <form className="answer-form" onSubmit={submitGuess} data-testid="answer-form">
                <label htmlFor="guess">{phase === "answer" ? "CALL A CONSONANT" : "BUY A VOWEL OR SOLVE"}</label>
                <input id="guess" data-testid="answer-input" value={guess} onChange={(event) => setGuess(event.target.value)} placeholder={phase === "answer" ? "Type one consonant…" : "Type a vowel or full solution…"} autoComplete="off" autoFocus />
                <button type="submit" disabled={!guess.trim()}>LOCK IT IN</button>
              </form>
            )}
            {phase === "turnOver" && <button className="wide-action" data-testid="next-player-button" onClick={advancePlayer}>NEXT PLAYER <span>→</span></button>}
            {phase === "freeSpinChoice" && (
              <div className="game-over-actions">
                <button className="wide-action gold" onClick={useFreeSpin}>USE FREE SPIN <span>↻</span></button>
                <button className="wide-action" onClick={declineFreeSpin}>SAVE IT &amp; PASS <span>→</span></button>
              </div>
            )}
            {phase === "roundOver" && <button className="wide-action gold" data-testid="next-round-button" onClick={nextRound}>NEXT PUZZLE <span>→</span></button>}
            {phase === "gameOver" && (
              <div className="game-over-actions">
                <p>🏆 {winner?.name} wins with <strong>${winner?.money.toLocaleString()}</strong>!</p>
                <button className="wide-action gold" onClick={() => goTo("setup")}>PLAY AGAIN <span>↻</span></button>
              </div>
            )}
          </div>
        </section>
      )}

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSettingsOpen(false)}>
          <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button>
            <p className="eyebrow"><span /> SETTINGS <span /></p>
            <h2 id="settings-title">Make it yours</h2>
            <label className="setting-row">
              <span><b>Sound effects</b><small>Wheel spins, wins, and strikes</small></span>
              <input type="checkbox" checked={soundOn} onChange={(event) => setSoundOn(event.target.checked)} />
            </label>
            <label className="setting-row">
              <span><b>Reduce motion</b><small>Use shorter wheel animations</small></span>
              <input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} />
            </label>
            <button className="start-button" onClick={() => setSettingsOpen(false)}>SAVE & CLOSE</button>
          </section>
        </div>
      )}
    </main>
  );
}
