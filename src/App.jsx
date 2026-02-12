import { useEffect, useRef, useState } from "react";
import roeiImage from "./roei.webp";
import roeiImage2 from "./roei2.webp";
import tamarImage from "./tamar.webp";
import tamarImage2 from "./tamar2.webp";

const EMOJIS = ["❤️", "😍"];
const PEEK_IMAGES = [
  { src: roeiImage, alt: "Roei" },
  { src: roeiImage2, alt: "Roei 2" },
  { src: tamarImage, alt: "Tamar" },
  { src: tamarImage2, alt: "Tamar 2" },
];
const SPAWN_EVERY_MS = 140;
const MAX_PARTICLES = 140;
const MIN_DURATION_MS = 3200;
const MAX_DURATION_MS = 5600;
const PEEK_VISIBLE_MS = 1900;
const PEEK_MIN_GAP_MS = 3400;
const PEEK_MAX_GAP_MS = 6200;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function randomPeekImage() {
  return PEEK_IMAGES[Math.floor(Math.random() * PEEK_IMAGES.length)];
}

function createParticle(width) {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    emoji: randomEmoji(),
    left: Math.round(randomBetween(0, Math.max(width - 24, 0))),
    size: randomBetween(20, 52),
    drift: randomBetween(-80, 80),
    duration: randomBetween(MIN_DURATION_MS, MAX_DURATION_MS),
    rotate: randomBetween(-18, 18),
  };
}

function createPeek() {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const selected = randomPeekImage();

  const sideRoll = Math.random();
  const side = sideRoll < 0.4 ? "left" : sideRoll < 0.8 ? "right" : "top";

  return {
    id,
    side,
    top: randomBetween(18, 70),
    left: randomBetween(20, 80),
    size: randomBetween(138, 230),
    wiggle: Math.random() < 0.45,
    src: selected.src,
    alt: selected.alt,
  };
}

export default function App() {
  const [particles, setParticles] = useState([]);
  const [activePeek, setActivePeek] = useState(null);
  const particleTimeoutIdsRef = useRef(new Set());
  const peekTimeoutIdsRef = useRef(new Set());

  useEffect(() => {
    const spawn = () => {
      const particle = createParticle(window.innerWidth);

      setParticles((prev) => {
        const next = [...prev, particle];
        return next.length > MAX_PARTICLES ? next.slice(next.length - MAX_PARTICLES) : next;
      });

      const removeId = window.setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particle.id));
        particleTimeoutIdsRef.current.delete(removeId);
      }, particle.duration);

      particleTimeoutIdsRef.current.add(removeId);
    };

    spawn();
    const intervalId = window.setInterval(spawn, SPAWN_EVERY_MS);

    return () => {
      window.clearInterval(intervalId);
      particleTimeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      particleTimeoutIdsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = randomBetween(PEEK_MIN_GAP_MS, PEEK_MAX_GAP_MS);
      const queueId = window.setTimeout(() => {
        const peek = createPeek();
        setActivePeek(peek);

        const hideId = window.setTimeout(() => {
          setActivePeek(null);
          peekTimeoutIdsRef.current.delete(hideId);
          scheduleNext();
        }, PEEK_VISIBLE_MS);

        peekTimeoutIdsRef.current.add(hideId);
        peekTimeoutIdsRef.current.delete(queueId);
      }, delay);

      peekTimeoutIdsRef.current.add(queueId);
    };

    scheduleNext();

    return () => {
      peekTimeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      peekTimeoutIdsRef.current.clear();
    };
  }, []);

  return (
    <main className="scroller">
      <section className="screen first-screen">
        <section className="hero">
          <p className="eyebrow">For My Valentine</p>
          <h1>Made With Love, Just For You</h1>
          <p className="subtitle">
            A tiny one-page surprise while we build the full site. Swipe up for the next page.
          </p>
        </section>

        <div className="rain-layer" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="drop"
              style={{
                left: `${p.left}px`,
                fontSize: `${p.size}px`,
                animationDuration: `${p.duration}ms`,
                "--drift-x": `${p.drift}px`,
                "--spin": `${p.rotate}deg`,
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>

        <div className="peek-layer" aria-hidden="true">
          {activePeek ? (
            <div
              key={activePeek.id}
              className={`peek-shot peek-${activePeek.side}`}
              style={
                activePeek.side === "top"
                  ? { top: "0px", left: `${activePeek.left}vw`, width: `${activePeek.size}px` }
                  : { top: `${activePeek.top}vh`, width: `${activePeek.size}px` }
              }
            >
              <img
                className={`peek-image ${activePeek.wiggle ? "peek-image-wiggle" : ""} ${
                  activePeek.wiggle && activePeek.side === "top" ? "peek-image-wiggle-top" : ""
                }`}
                src={activePeek.src}
                alt={activePeek.alt}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="screen second-screen">
        <div className="note-card">
          <p className="eyebrow">Page Two</p>
          <h2>More Coming Soon</h2>
          <p className="subtitle">
            This section is ready for your letter, memories, and your big Valentine message.
          </p>
        </div>
      </section>
    </main>
  );
}
