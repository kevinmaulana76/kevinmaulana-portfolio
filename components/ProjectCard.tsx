import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types.ts';
import { ImageWithFallback } from './ImageWithFallback.tsx';

interface Props {
  project: Project;
}

export const ProjectCard: React.FC<Props> = ({ project }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const images = project.imageUrls || [];
  const threshold = 50;
  const AUTO_SLIDE_DELAY = 4000;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length <= 1 || isDragging || isHovered) return;
    const timer = setInterval(() => { nextImage(); }, AUTO_SLIDE_DELAY);
    return () => clearInterval(timer);
  }, [images.length, isDragging, isHovered, currentIndex]);

  const handleStart = (clientX: number) => {
    if (images.length <= 1) return;
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - startX;
    setDragOffset(offset);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    if (dragOffset < -threshold && currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <div 
      className="group relative border-poster p-1 mb-8 bg-black select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); if(isDragging) handleEnd(); }}
    >
      <div 
        ref={sliderRef}
        className={`relative aspect-[4/5] overflow-hidden bg-zinc-900 ${images.length > 1 ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <div 
          className={`flex h-full w-full transition-transform duration-500 ease-out ${isDragging ? 'transition-none' : ''}`}
          style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` }}
        >
          {images.map((url, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 pointer-events-none">
              <ImageWithFallback 
                src={url} 
                alt={`${project.title} - image ${idx + 1}`} 
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          ))}
        </div>
        
        {images.length > 1 && (
          <>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4 pointer-events-none">
              <button onClick={prevImage} className="w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-all pointer-events-auto">
                <i className="fas fa-chevron-left text-[10px]"></i>
              </button>
              <button onClick={nextImage} className="w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-all pointer-events-auto">
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 text-[8px] font-black uppercase tracking-widest border border-white/20">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col uppercase font-bold tracking-widest text-[10px]">
        <div className="flex justify-between border-b border-[#F5F5F0]/20 pb-2 mb-2">
          <span>{project.title}</span>
          <span>{project.category}</span>
        </div>
        <p className="text-[#F5F5F0]/50 normal-case font-normal leading-tight text-xs line-clamp-2">
          {project.description}
        </p>
      </div>
    </div>
  );
};