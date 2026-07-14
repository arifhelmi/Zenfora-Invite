"use client";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

export function InvitationMusicPlayer({ src, title }: { src: string; title?: string }) {
  return <aside className="invitation-music" aria-label="Musik undangan">
    {title && <p className="invitation-music-title">{title}</p>}
    <AudioPlayer
      src={src}
      autoPlay={false}
      showJumpControls={false}
      showFilledProgress={false}
      customAdditionalControls={[]}
      customVolumeControls={[]}
      layout="horizontal-reverse"
      preload="metadata"
    />
  </aside>;
}
