import { useEffect, useRef, useState } from "react";
import roeiImage from "./roei.webp";
import roeiImage2 from "./roei2.webp";
import tamarImage from "./tamar.webp";
import tamarImage2 from "./tamar2.webp";

const EMOJIS = ["\u2764\uFE0F", "\uD83D\uDE0D"];
const FLOWERS = ["💐", "🌹", "🌷", "🪻", "🍫"];
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
const FLOWER_BURST_COUNT = 30;

const SCRATCH_ITEMS_BASE = [
  { src: roeiImage, alt: "Roei", highlight: true },
  { src: roeiImage, alt: "Roei", highlight: true },
  { src: roeiImage, alt: "Roei", highlight: true },
  { src: roeiImage2, alt: "Roei 2", highlight: false },
  { src: tamarImage, alt: "Tamar", highlight: false },
  { src: tamarImage, alt: "Tamar", highlight: false },
];

const SLIDES = [
  {
    eyebrow: "For Poopy (My Valentine)",
    title: "Your Valentine Gift ❤️",
    subtitle: "",
  },
  {
    eyebrow: "I'm Partly Sorry",
    title: "An Apology",
    subtitle: "Since it's expensive to get you flowers in Guat, and we're going to spend so much in Costa (😍), I created this gift instead.",
  },
  {
    eyebrow: "",
    title: "What is one of our favorite things to do together?",
    subtitle: "",
  },
  {
    type: "scratch",
    eyebrow: "A Scratch Game! (The thing we LOVE)",
    title: "Can You Win?",
    subtitle: "Scratch all 6 circles to reveal your prize!",
  },
  {
    eyebrow: "",
    title: "To My Biggest Love",
    subtitle: "Happy long-distance Valentines Day my love, I love you more than anything in this world ❤️",
    hasButton: true,
  },
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function randomFlowerEmoji() {
  return FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
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

function createFlower(originX, originY) {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    emoji: randomFlowerEmoji(),
    x: originX,
    y: originY,
    dx: randomBetween(-window.innerWidth * 0.48, window.innerWidth * 0.48),
    dy: randomBetween(-window.innerHeight * 0.72, window.innerHeight * 0.24),
    scale: randomBetween(1.2, 3.6),
    duration: randomBetween(3600, 5600),
    delay: randomBetween(0, 420),
    rotate: randomBetween(-180, 180),
    size: randomBetween(22, 44),
  };
}

function shuffleArray(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function ScratchCircle({ imageSrc, alt, done, onDone, shouldHighlightWin, showWinState }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const strokeCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.getBoundingClientRect().width;
    canvas.width = Math.max(1, Math.floor(size * dpr));
    canvas.height = Math.max(1, Math.floor(size * dpr));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#9a9a9a";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < size * 18; i += 1) {
      const alpha = randomBetween(0.08, 0.28);
      const tone = Math.floor(randomBetween(130, 180));
      ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha})`;
      ctx.fillRect(randomBetween(0, size), randomBetween(0, size), randomBetween(1, 3), randomBetween(1, 3));
    }
  }, []);

  useEffect(() => {
    if (!done) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [done]);

  const scratchAt = (event) => {
    if (done) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    strokeCountRef.current += 1;
    if (strokeCountRef.current % 6 !== 0) {
      return;
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    let sampled = 0;

    for (let i = 3; i < imageData.length; i += 4 * 12) {
      sampled += 1;
      if (imageData[i] < 40) {
        transparent += 1;
      }
    }

    if (sampled > 0 && transparent / sampled > 0.5) {
      onDone();
    }
  };

  const handlePointerDown = (event) => {
    if (done) {
      return;
    }

    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    scratchAt(event);
  };

  const handlePointerMove = (event) => {
    if (!drawingRef.current || done) {
      return;
    }

    scratchAt(event);
  };

  const handlePointerUp = (event) => {
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = () => {
    drawingRef.current = false;
  };

  return (
    <div className={`scratch-circle ${done ? "scratch-circle-done" : ""} ${showWinState && shouldHighlightWin ? "scratch-circle-winning" : ""}`}>
      <img className="scratch-image" src={imageSrc} alt={alt} />
      <canvas
        ref={canvasRef}
        className={`scratch-overlay ${done ? "scratch-overlay-cleared" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />
    </div>
  );
}

function ScratchBoard() {
  const [scratchItems] = useState(() => shuffleArray(SCRATCH_ITEMS_BASE));
  const [doneMap, setDoneMap] = useState(() => scratchItems.map(() => false));
  const clearedCount = doneMap.filter(Boolean).length;
  const roeiClearedCount = scratchItems.reduce(
    (count, item, index) => (item.highlight && doneMap[index] ? count + 1 : count),
    0
  );
  const hasWon = roeiClearedCount === 3;

  const markDone = (index) => {
    setDoneMap((prev) => {
      if (prev[index]) {
        return prev;
      }

      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  return (
    <div className="scratch-board-wrap">
      <div className="scratch-grid">
        {scratchItems.map((item, index) => (
          <ScratchCircle
            key={`${item.alt}-${index}`}
            imageSrc={item.src}
            alt={item.alt}
            done={doneMap[index]}
            onDone={() => markDone(index)}
            shouldHighlightWin={item.highlight}
            showWinState={hasWon}
          />
        ))}
      </div>
      <p className="scratch-progress">{`${clearedCount}/6 scratched`}</p>
      {hasWon ? <p className="scratch-win-text">You Won My Heart</p> : null}
    </div>
  );
}

export default function App() {
  const [particles, setParticles] = useState([]);
  const [activePeek, setActivePeek] = useState(null);
  const [burstFlowers, setBurstFlowers] = useState([]);
  const particleTimeoutIdsRef = useRef(new Set());
  const peekTimeoutIdsRef = useRef(new Set());
  const burstTimeoutRef = useRef(null);
  const burstButtonRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (burstTimeoutRef.current) {
        window.clearTimeout(burstTimeoutRef.current);
      }
    };
  }, []);

  const handleFlowerBurst = () => {
    const buttonRect = burstButtonRef.current?.getBoundingClientRect();
    const originX = buttonRect ? buttonRect.left + buttonRect.width / 2 : window.innerWidth / 2;
    const originY = buttonRect ? buttonRect.top + buttonRect.height / 2 : window.innerHeight * 0.7;
    const nextFlowers = Array.from({ length: FLOWER_BURST_COUNT }, () => createFlower(originX, originY));

    setBurstFlowers(nextFlowers);

    if (burstTimeoutRef.current) {
      window.clearTimeout(burstTimeoutRef.current);
    }

    burstTimeoutRef.current = window.setTimeout(() => {
      setBurstFlowers([]);
      burstTimeoutRef.current = null;
    }, 6800);
  };

  return (
    <main className="app-shell">
      <div className="background-stage" aria-hidden="true">
        <div className="rain-layer">
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
      </div>

      <div className="scroller">
        {SLIDES.map((slide) => (
          <section key={slide.title} className="screen">
            <article className={`glass-card ${slide.type === "scratch" ? "glass-card-scratch" : ""}`}>
              <p className="eyebrow">{slide.eyebrow}</p>
              <h1>{slide.title}</h1>
              <p className="subtitle">{slide.subtitle}</p>
              {slide.type === "scratch" ? <ScratchBoard /> : null}
              {slide.hasButton ? (
                <button ref={burstButtonRef} className="burst-button" type="button" onClick={handleFlowerBurst}>
                  Here you go
                </button>
              ) : null}
            </article>
          </section>
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
              className={`peek-image ${activePeek.wiggle ? "peek-image-wiggle" : ""} ${activePeek.wiggle && activePeek.side === "top" ? "peek-image-wiggle-top" : ""
                }`}
              src={activePeek.src}
              alt={activePeek.alt}
            />
          </div>
        ) : null}
      </div>

      <div className="flower-burst-layer" aria-hidden="true">
        {burstFlowers.map((flower) => (
          <span
            key={flower.id}
            className="flower-pop"
            style={{
              left: `${flower.x}px`,
              top: `${flower.y}px`,
              fontSize: `${flower.size}px`,
              animationDuration: `${flower.duration}ms`,
              animationDelay: `${flower.delay}ms`,
              "--flower-dx": `${flower.dx}px`,
              "--flower-dy": `${flower.dy}px`,
              "--flower-scale": flower.scale,
              "--flower-rotate": `${flower.rotate}deg`,
            }}
          >
            {flower.emoji}
          </span>
        ))}
      </div>
    </main>
  );
}
