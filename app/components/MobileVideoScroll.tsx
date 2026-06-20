"use client";

import { useEffect, useRef } from "react";

interface MobileVideoSegmentProps {
  src: string;
}

function VideoSegment({ src }: MobileVideoSegmentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className="w-full"
      muted
      playsInline
      loop={false}
    />
  );
}

interface MobileVideoScrollProps {
  segments: string[];
}

export default function MobileVideoScroll({ segments }: MobileVideoScrollProps) {
  return (
    <div className="flex flex-col gap-0">
      {segments.map((src, i) => (
        <VideoSegment key={i} src={src} />
      ))}
    </div>
  );
}
