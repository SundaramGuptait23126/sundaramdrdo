import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { getPropertyImage } from "@/lib/stockImages";

interface Props {
  images: string[];
  propertyType: string;
  title: string;
}

const ImageGallery = ({ images, propertyType, title }: Props) => {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const allImages = images.length > 0 ? images : [
    getPropertyImage(images, propertyType, 0),
    getPropertyImage(images, propertyType, 1),
    getPropertyImage(images, propertyType, 2),
  ];

  const getImg = (i: number) => getPropertyImage(allImages, propertyType, i);

  const prev = useCallback(() => setActive((a) => (a - 1 + allImages.length) % allImages.length), [allImages.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % allImages.length), [allImages.length]);

  return (
    <>
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl group cursor-pointer" onClick={() => setLightbox(true)}>
          <img
            src={getImg(active)}
            alt={title}
            className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
          <button className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-card transition-colors">
            <ZoomIn className="h-3.5 w-3.5" /> View All {allImages.length} Photos
          </button>
          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          <div className="absolute left-3 bottom-3 rounded-full bg-foreground/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {active + 1} / {allImages.length}
          </div>
        </div>
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === active ? "border-primary ring-1 ring-primary/30" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img
                  src={getImg(i)}
                  alt=""
                  className="h-16 w-24 object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm" onClick={() => setLightbox(false)}>
          <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/20 text-white hover:bg-card/40 transition-colors" onClick={() => setLightbox(false)}>
            <X className="h-5 w-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-card/20 text-white hover:bg-card/40 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={getImg(active)}
            alt={title}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-card/20 text-white hover:bg-card/40 transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={`h-2 w-2 rounded-full transition-colors ${i === active ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
