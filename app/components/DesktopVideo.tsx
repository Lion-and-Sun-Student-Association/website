"use client";

import { useEffect, useRef } from "react";

interface DesktopVideoProps {
  segments: string[];
}

export default function DesktopVideo({ segments }: DesktopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentSegment = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || segments.length === 0) return;

    video.src = segments[0];
    video.play();

    const onEnded = () => {
      currentSegment.current += 1;
      if (currentSegment.current < segments.length) {
        video.src = segments[currentSegment.current];
        video.play();
      }
    };

    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, [segments]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      muted
      playsInline
    />
  );
}
