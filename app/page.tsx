"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Screen = "menu" | "setup" | "game" | "rules";
type Phase = "spin" | "spinning" | "answer" | "turnOver" | "roundOver" | "gameOver";
type SoundName = "click" | "spin" | "correct" | "wrong" | "win";

type Answer = {
  label: string;
  points: number;
  aliases?: string[];
};

type Question = {
  prompt: string;
  answers: Answer[];
};

type Player = {
  name: string;
  money: number;
  color: string;
};

type WheelResult = {
  label: string;
  type: "cash" | "multiplier" | "bankrupt" | "lose";
  value: number;
};

const PLAYER_COLORS = ["#4f7cff", "#31cf80", "#ff4d62", "#a855f7"];

const QUESTIONS: Question[] = [
  {
    prompt: "Name something people buy at the grocery store every week.",
    answers: [
      { label: "Milk", points: 36 },
      { label: "Bread", points: 27 },
      { label: "Eggs", points: 18 },
      { label: "Fruit", points: 10, aliases: ["fruits"] },
      { label: "Snacks", points: 6, aliases: ["snack"] },
      { label: "Coffee", points: 3 },
    ],
  },
  {
    prompt: "Name a gift people are always happy to receive.",
    answers: [
      { label: "Cash", points: 32, aliases: ["money"] },
      { label: "Gift card", points: 24, aliases: ["voucher"] },
      { label: "Vacation", points: 18, aliases: ["trip", "travel"] },
      { label: "Electronics", points: 12, aliases: ["phone", "tablet"] },
      { label: "Jewelry", points: 8, aliases: ["jewellery"] },
      { label: "Books", points: 6, aliases: ["book"] },
    ],
  },
  {
    prompt: "Name something you might find in a shopping cart.",
    answers: [
      { label: "Groceries", points: 34, aliases: ["food"] },
      { label: "Clothes", points: 22, aliases: ["clothing"] },
      { label: "Toys", points: 17, aliases: ["toy"] },
      { label: "Home supplies", points: 12, aliases: ["household supplies"] },
      { label: "Electronics", points: 9, aliases: ["phone", "computer"] },
      { label: "Pet food", points: 6, aliases: ["dog food", "cat food"] },
    ],
  },
  {
    prompt: "Name something people compare before buying.",
    answers: [
      { label: "Price", points: 38, aliases: ["cost"] },
      { label: "Reviews", points: 23, aliases: ["ratings"] },
      { label: "Quality", points: 16 },
      { label: "Features", points: 10 },
      { label: "Brand", points: 8 },
      { label: "Warranty", points: 5 },
    ],
  },
  {
    prompt: "Name something that makes a store fun to visit.",
    answers: [
      { label: "Good deals", points: 31, aliases: ["sales", "discounts", "deals"] },
      { label: "Free samples", points: 24, aliases: ["samples"] },
      { label: "Friendly staff", points: 17, aliases: ["staff", "employees"] },
      { label: "Music", points: 11 },
      { label: "Cool displays", points: 9, aliases: ["displays"] },
      { label: "Food court", points: 8, aliases: ["food"] },
    ],
  },
];

const WHEEL_RESULTS: WheelResult[] = [
  { label: "$100", type: "cash", value: 100 },
  { label: "$250", type: "cash", value: 250 },
  { label: "×2", type: "multiplier", value: 2 },
  { label: "$500", type: "cash", value: 500 },
  { label: "LOSE", type: "lose", value: 0 },
  { label: "$750", type: "cash", value: 750 },
  { label: "$150", type: "cash", value: 150 },
  { label: "×3", type: "multiplier", value: 3 },
  { label: "$400", type: "cash", value: 400 },
  { label: "BUST", type: "bankrupt", value: 0 },
  { label: "$1K", type: "cash", value: 1000 },
  { label: "$300", type: "cash", value: 300 },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [strikes, setStrikes] = useState(0);
  const [phase, setPhase] = useState<Phase>("spin");
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState<WheelResult | null>(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Spin the wheel to start!");
  const [soundOn, setSoundOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const spinTimerRef = useRef<number | null>(null);

  const question = QUESTIONS[round % QUESTIONS.length];

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
    setRevealed([]);
    setStrikes(0);
    setPhase("spin");
    setWheelResult(null);
    setGuess("");
    setMessage(`${gamePlayers[0].name}, spin the wheel!`);
    playSound("win");
    setScreen("game");
  };

  const advancePlayer = useCallback(() => {
    setCurrentPlayer((player) => (players.length ? (player + 1) % players.length : 0));
    setWheelResult(null);
    setGuess("");
    setPhase("spin");
    const nextIndex = players.length ? (currentPlayer + 1) % players.length : 0;
    setMessage(`${players[nextIndex]?.name ?? "Next player"}, spin the wheel!`);
  }, [currentPlayer, players]);

  const finishRound = useCallback(() => {
    if (round >= QUESTIONS.length - 1) {
      setPhase("gameOver");
      setMessage("That’s the game! Count up the goods!");
      playSound("win");
    } else {
      setPhase("roundOver");
      setMessage(`Round ${round + 1} complete!`);
      playSound("win");
    }
  }, [playSound, round]);

  const nextRound = () => {
    const next = round + 1;
    setRound(next);
    setRevealed([]);
    setStrikes(0);
    setWheelResult(null);
    setCurrentPlayer((player) => (players.length ? (player + 1) % players.length : 0));
    setPhase("spin");
    setMessage("New question! Spin the wheel.");
    playSound("click");
  };

  const spinWheel = () => {
    if (phase !== "spin") return;
    playSound("spin");
    const resultIndex = Math.floor(Math.random() * WHEEL_RESULTS.length);
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
        if (result.type === "bankrupt") {
          setPlayers((current) =>
            current.map((player, index) =>
              index === currentPlayer ? { ...player, money: 0 } : player,
            ),
          );
          setMessage("BUST! Your total drops to $0.");
          setPhase("turnOver");
          playSound("wrong");
        } else if (result.type === "lose") {
          setMessage("Lose a turn! Pass it to the next player.");
          setPhase("turnOver");
          playSound("wrong");
        } else {
          setMessage(`${result.label} is live — give your answer!`);
          setPhase("answer");
          playSound("click");
        }
      },
      reducedMotion ? 450 : 3000,
    );
  };

  const submitGuess = (event: FormEvent) => {
    event.preventDefault();
    if (phase !== "answer" || !guess.trim() || !wheelResult) return;

    const submitted = normalize(guess);
    const answerIndex = question.answers.findIndex((answer, index) => {
      if (revealed.includes(index)) return false;
      const accepted = [answer.label, ...(answer.aliases ?? [])].map(normalize);
      return accepted.includes(submitted);
    });

    if (answerIndex >= 0) {
      const answer = question.answers[answerIndex];
      const won =
        wheelResult.type === "multiplier"
          ? answer.points * 25 * wheelResult.value
          : wheelResult.value + answer.points * 10;
      const nextRevealed = [...revealed, answerIndex];
      setRevealed(nextRevealed);
      setPlayers((current) =>
        current.map((player, index) =>
          index === currentPlayer ? { ...player, money: player.money + won } : player,
        ),
      );
      setGuess("");
      setWheelResult(null);
      playSound("correct");
      if (nextRevealed.length === question.answers.length) {
        setMessage(`Perfect board! ${answer.label} earns $${won.toLocaleString()}.`);
        finishRound();
      } else {
        setMessage(`Survey says… ${answer.label}! +$${won.toLocaleString()}`);
        setPhase("spin");
      }
    } else {
      const nextStrikes = strikes + 1;
      setStrikes(nextStrikes);
      setGuess("");
      setWheelResult(null);
      playSound("wrong");
      if (nextStrikes >= 3) {
        setMessage("Three strikes! That ends the round.");
        finishRound();
      } else {
        setMessage(`Not on the board — strike ${nextStrikes}!`);
        setPhase("turnOver");
      }
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
              <p className="menu-copy">Spin big. Think fast. Turn the top survey answers into a fortune!</p>

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
                <span>★ 5 survey boards</span>
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
            <h2>Spin. Answer. Bank it.</h2>
            <div className="rule-grid">
              <article><b>1</b><div><h3>Spin the wheel</h3><p>Land on cash or a multiplier. Watch out for Lose and Bust.</p></div></article>
              <article><b>2</b><div><h3>Give an answer</h3><p>The question stays on screen. Match one of the six survey answers.</p></div></article>
              <article><b>3</b><div><h3>Build your fortune</h3><p>Correct answers add money. Three team strikes end the round.</p></div></article>
              <article><b>4</b><div><h3>Top the leaderboard</h3><p>After five questions, the player with the most money wins.</p></div></article>
            </div>
            <button className="start-button" onClick={() => goTo("setup")}>LET’S PLAY <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="game-screen" data-testid="game-screen">
          <header className="game-header">
            <button className="mini-logo" onClick={() => goTo("menu")} aria-label="Return to menu"><b>W</b><span>WHEEL OF<br />GOODS</span></button>
            <div className="round-label">ROUND <strong>{round + 1}</strong><small> OF {QUESTIONS.length}</small></div>
            <div className="header-actions">
              <button className="icon-button small" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Mute sound" : "Turn sound on"}>{soundOn ? "♪" : "×"}</button>
              <button className="icon-button small" onClick={() => setSettingsOpen(true)} aria-label="Open settings">⚙</button>
            </div>
          </header>

          <div className="question-bar" data-testid="question-bar">
            <span className="question-number">Q{round + 1}</span>
            <h2>{question.prompt}</h2>
            <div className="strikes" aria-label={`${strikes} of 3 strikes`}>
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
                disabled={phase !== "spin"}
              >
                {phase === "spinning" ? "SPINNING…" : "SPIN THE WHEEL"}
              </button>
            </section>

            <section className="answer-zone" aria-label="Survey answers">
              <div className="answer-heading"><span>TOP ANSWERS</span><span>{revealed.length}/{question.answers.length} FOUND</span></div>
              <ol className="answer-board" data-testid="answer-board">
                {question.answers.map((answer, index) => {
                  const isRevealed = revealed.includes(index);
                  return (
                    <li key={answer.label} className={isRevealed ? "revealed" : ""}>
                      <b>{index + 1}</b>
                      <span>{isRevealed ? answer.label : <i aria-label="hidden answer">••••••••••••</i>}</span>
                      <strong>{isRevealed ? answer.points : "?"}</strong>
                    </li>
                  );
                })}
              </ol>
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
                  <span>{player.name}</span><strong>${player.money.toLocaleString()}</strong>
                </div>
              ))}
            </div>

            {phase === "answer" && (
              <form className="answer-form" onSubmit={submitGuess} data-testid="answer-form">
                <label htmlFor="guess">YOUR ANSWER</label>
                <input id="guess" data-testid="answer-input" value={guess} onChange={(event) => setGuess(event.target.value)} placeholder="Type an answer…" autoComplete="off" autoFocus />
                <button type="submit" disabled={!guess.trim()}>LOCK IT IN</button>
              </form>
            )}
            {phase === "turnOver" && <button className="wide-action" data-testid="next-player-button" onClick={advancePlayer}>NEXT PLAYER <span>→</span></button>}
            {phase === "roundOver" && <button className="wide-action gold" data-testid="next-round-button" onClick={nextRound}>NEXT QUESTION <span>→</span></button>}
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
