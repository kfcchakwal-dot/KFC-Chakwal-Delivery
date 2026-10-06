import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Play, Pause, Volume2, VolumeX, Video as VideoIcon, Sparkles } from 'lucide-react';

export const HomepageVideoSection: React.FC = () => {
  const { settings } = useStore();
  const videoConfig = settings.homepageVideo;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoConfig || !videoConfig.enabled || !videoConfig.videoUrl) {
    return null;
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 sm:my-8">
      <div className="bg-black rounded-3xl overflow-hidden border border-zinc-200 shadow-xl relative group">
        
        {/* Video Player */}
        <div className="relative aspect-video sm:aspect-[21/9] w-full bg-zinc-950 flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoConfig.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Titles & Badges */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white pointer-events-none">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#e4002b] text-white text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                <Sparkles className="w-3 h-3" />
                <span>Featured Video</span>
              </div>
              <h3 className="font-kfc text-xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-md">
                {videoConfig.title || 'KFC Chakwal Fresh Crispy Taste'}
              </h3>
              {videoConfig.subtitle && (
                <p className="text-xs sm:text-sm text-zinc-200 drop-shadow">
                  {videoConfig.subtitle}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
