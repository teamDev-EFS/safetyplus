import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = {
  id: string;
  name: string;
  category?: string;
  price: string; // already formatted
  mrp?: string; // optional formatted
  image: string;
  to: string; // link
};

export function ProductRail({
  products,
  emptyText = "Nothing to show",
}: {
  products: Item[];
  emptyText?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max);
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    updateEdges();
    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [products?.length]);

  const scrollBy = (dir: number) => {
    railRef.current?.scrollBy({
      left: dir * (railRef.current.clientWidth - 120),
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200/60 dark:ring-gray-800 p-10 text-center text-gray-500">
        {emptyText}
      </div>
    );
  }

  // Determine grid layout based on product count for optimal display
  const getGridClasses = () => {
    const count = products.length;
    if (count === 1) return "grid-cols-1 max-w-sm mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    // 5+ products use scroll rail
    return null;
  };

  const gridClasses = getGridClasses();

  // If we have 1-4 products, use grid layout to avoid gaps
  if (gridClasses) {
    return (
      <div className={`grid ${gridClasses} gap-4`}>
        {products.map((p) => (
          <Link
            to={p.to}
            key={p.id}
            className="rounded-2xl ring-1 ring-gray-200/60 dark:ring-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] rounded-t-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              {p.category && (
                <div className="text-xs text-gray-500 mb-1">{p.category}</div>
              )}
              <div className="font-semibold line-clamp-2">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-emerald-700 font-bold">{p.price}</div>
                {p.mrp && (
                  <div className="text-xs text-gray-500 line-through">
                    {p.mrp}
                  </div>
                )}
              </div>
              <div className="mt-3 inline-flex text-emerald-700 text-sm font-medium">
                View Details
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Buttons */}
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        disabled={atStart}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full shadow bg-white/90 ring-1 ring-gray-200 disabled:opacity-40"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        disabled={atEnd}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full shadow bg-white/90 ring-1 ring-gray-200 disabled:opacity-40"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollbarWidth: "none" }}
      >
        {/* hide scrollbar (WebKit) */}
        <style>{`.scrollbar-hide::-webkit-scrollbar{ display: none; }`}</style>

        {products.map((p) => (
          <Link
            to={p.to}
            key={p.id}
            className="snap-start shrink-0 w-[260px] md:w-[300px] rounded-2xl ring-1 ring-gray-200/60 dark:ring-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] rounded-t-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              {p.category && (
                <div className="text-xs text-gray-500 mb-1">{p.category}</div>
              )}
              <div className="font-semibold line-clamp-2">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-emerald-700 font-bold">{p.price}</div>
                {p.mrp && (
                  <div className="text-xs text-gray-500 line-through">
                    {p.mrp}
                  </div>
                )}
              </div>
              <div className="mt-3 inline-flex text-emerald-700 text-sm font-medium">
                View Details
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
