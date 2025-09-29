'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlayIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { getYouTubeVideoId, getVimeoVideoId } from '@/lib/utils';

interface VideoEmbedProps {
  url: string;
  thumbnail?: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
}

export default function VideoEmbed({
  url,
  thumbnail,
  className = '',
  autoplay = false,
  muted = true,
  loop = false,
  showControls = true,
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [error, setError] = useState<string | null>(null);

  const youtubeId = getYouTubeVideoId(url);
  const vimeoId = getVimeoVideoId(url);

  if (!youtubeId && !vimeoId) {
    setError('Invalid video URL. Please provide a valid YouTube or Vimeo URL.');
  }

  const getEmbedUrl = () => {
    if (youtubeId) {
      const params = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        mute: muted ? '1' : '0',
        loop: loop ? '1' : '0',
        controls: showControls ? '1' : '0',
        rel: '0',
        modestbranding: '1',
      });
      return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
    }

    if (vimeoId) {
      const params = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        muted: muted ? '1' : '0',
        loop: loop ? '1' : '0',
        controls: showControls ? '1' : '0',
      });
      return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
    }

    return '';
  };

  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail;

    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }

    // For Vimeo, we'll need to fetch the thumbnail via API or use a default
    return '/placeholder-video.jpg';
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-900 ${className}`}>
      {!isPlaying ? (
        <motion.div
          className="relative cursor-pointer group"
          onClick={() => setIsPlaying(true)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={getThumbnailUrl()}
            alt="Video thumbnail"
            fill
            className="object-cover"
            onError={() => {
              // Image error handled by Next.js Image component
            }}
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:bg-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayIcon className="w-8 h-8 text-gray-900 ml-1" />
            </motion.div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-white text-sm font-medium">Click to play video</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded video"
          />
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white rounded-lg p-2 hover:bg-black/80 transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}