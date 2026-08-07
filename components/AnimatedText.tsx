"use client";

import { useEffect, useState, useMemo } from "react";

interface AnimatedTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export default function AnimatedText({ text, speed = 50, onComplete }: AnimatedTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = useMemo(() => text.split(" "), [text]);

  useEffect(() => {
    setVisibleCount(0);
    if (!text) return;

    let count = 0;
    const timer = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= words.length) {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, words.length, onComplete]);

  return (
    <p className="leading-relaxed">
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={`inline-block transition-opacity duration-300 ${
            i < visibleCount ? "opacity-100" : "opacity-0"
          }`}
          style={{
            animation: i < visibleCount ? `fadeIn 300ms ease-out ${i * speed}ms both` : undefined,
          }}
        >
          {word}
          {i < words.length - 1 && " "}
        </span>
      ))}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </p>
  );
}
