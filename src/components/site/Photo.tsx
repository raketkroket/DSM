import Image from 'next/image';
import type { ImageRef } from '@/lib/content/types';

type PhotoProps = {
  image: ImageRef;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  grade?: boolean;
};

/** Fills its (positioned) parent. Falls back to a quiet blueprint surface when no image is set. */
export function Photo({ image, sizes, className = '', imgClassName = '', priority, grade = true }: PhotoProps) {
  if (!image.src) {
    return <div aria-hidden className={`blueprint absolute inset-0 bg-mist ${className}`} />;
  }
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${grade ? 'photo-grade' : ''} ${imgClassName} ${className}`}
      style={image.focus ? { objectPosition: image.focus } : undefined}
    />
  );
}
