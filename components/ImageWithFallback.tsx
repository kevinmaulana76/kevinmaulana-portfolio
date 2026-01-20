
import React, { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

export const ImageWithFallback: React.FC<Props> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-zinc-900 flex items-center justify-center p-4 text-center`}>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Image_Not_Found</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      onError={() => setError(true)}
      className={className}
    />
  );
};
