"use client";

import { useEffect, useRef, useState } from "react";
import { fmtDuration, safeEmbedId, type Embed, type Explainer } from "@/content/videos";

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="30" height="30">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
  </svg>
);

/**
 * Explainer playlist. Videos are silent, muted and never autoplay for visitors who prefer reduced motion or have Data Saver on.
 * Otherwise the selected video plays while at least half of it is on screen and pauses when it leaves.
 */
export function ExplainerPlayer({ items, initial = 0 }: { items: Explainer[]; initial?: number }) {
  const [index, setIndex] = useState(initial);
  const [paused, setPaused] = useState(true);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const current = items[index];

  const canAutoplay = () => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !conn?.saveData;
  };

  useEffect(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (canAutoplay() && !userPaused.current) void video.play().catch(() => {});
        } else video.pause();
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, [index]);

  function choose(i: number) {
    userPaused.current = false;
    setFailed(false);
    setIndex(i);
    // The new <video> mounts (keyed by slug); start it once it exists. Selecting a video is a deliberate action.
    requestAnimationFrame(() => void videoRef.current?.play().catch(() => {}));
  }

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      void v.play();
    } else {
      userPaused.current = true;
      v.pause();
    }
  }

  return (
    <div className="vplayer">
      <div className="vplayer__main">
        <div className="vplayer__stage" ref={stageRef}>
          {failed ? (
            // eslint-disable-next-line @next/next/no-img-element -- static poster shown when the browser can't play the video
            <img src={`/videos/${current.slug}.jpg`} alt={`${current.title}: still frame from the animation`} width={1280} height={720} />
          ) : (
            <video
              key={current.slug}
              ref={videoRef}
              muted
              loop
              playsInline
              controls
              preload="none"
              poster={`/videos/${current.slug}.jpg`}
              aria-label={`${current.title}. Silent animation. A text version is below.`}
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
              onError={() => setFailed(true)}
            >
              <source src={`/videos/${current.slug}.mp4`} type="video/mp4" />
              <source src={`/videos/${current.slug}.webm`} type="video/webm" />
              Your browser can&apos;t play this video. A text version is below.
            </video>
          )}
          {paused && !failed && (
            <button type="button" className="vplay" onClick={toggle} aria-label={`Play: ${current.title}`}>
              <PlayIcon />
            </button>
          )}
        </div>
        <div className="vplayer__info">
          <p className="badge" style={{ background: "var(--surface-dark-2)" }}>Animated explainer · silent · original illustration, not client footage</p>
          <h3 className="h3">{current.title}</h3>
          <p className="muted">{current.description}</p>
          <details className="vplayer__text">
            <summary>Read the text version</summary>
            {current.transcript.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </details>
        </div>
      </div>

      <ul className="vplayer__list" aria-label="Choose a video">
        {items.map((it, i) => (
          <li key={it.slug}>
            <button type="button" className="vchapter" aria-current={i === index} onClick={() => choose(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element -- small poster thumbnail */}
              <img src={`/videos/${it.slug}.jpg`} alt="" width={160} height={90} loading="lazy" />
              <span>
                <b>{it.title}</b>
                <small>{fmtDuration(it.seconds)}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Real YouTube/Vimeo videos. Nothing from the provider loads until the visitor clicks play. */
export function EmbedList({ items }: { items: Embed[] }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <ul className="vembeds">
      {items.filter(safeEmbedId).map((e) => {
        const key = `${e.provider}:${e.id}`;
        const src = e.provider === "youtube" ? `https://www.youtube-nocookie.com/embed/${e.id}?autoplay=1&rel=0` : `https://player.vimeo.com/video/${e.id}?autoplay=1&dnt=1`;
        return (
          <li key={key}>
            <div className="vplayer__stage">
              {active === key ? (
                <iframe src={src} title={e.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
              ) : (
                <>
                  {e.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element -- self-hosted poster
                    <img src={e.poster} alt="" width={1280} height={720} loading="lazy" />
                  ) : null}
                  <button type="button" className="vplay" onClick={() => setActive(key)} aria-label={`Play: ${e.title}`}>
                    <PlayIcon />
                  </button>
                </>
              )}
            </div>
            <h3 className="h3">{e.title}</h3>
            <p className="muted">{e.description}</p>
            {e.transcript && e.transcript.length > 0 && (
              <details className="vplayer__text">
                <summary>Read the text version</summary>
                {e.transcript.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
}
