import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import {
  formatCurrency,
  calculateDiscount,
  getImageUrl,
} from "../../lib/utils";

interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  priceMrp: number;
  priceSell: number;
  images: Array<{ path: string; alt?: string }>;
  brandId?: any;
}

interface ProductCarouselProps {
  products: Product[];
  title: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  showViewAll = true,
  viewAllLink = "/shop",
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {showViewAll && (
            <Link to={viewAllLink}>
              <Button variant="outline">
                View All <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="relative">
          {/* Navigation buttons */}
          {products.length > itemsPerView && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
                aria-label="Next products"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map((product) => {
              const discount = calculateDiscount(
                product.priceMrp,
                product.priceSell
              );

              return (
                <Link
                  key={product._id || product.id}
                  to={`/product/${product.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                    <img
                      src={getImageUrl(
                        product.images?.[0]?.path || "/placeholder.jpg"
                      )}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {discount}% OFF
                      </div>
                    )}
                    {product.brandId && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-3 py-1 rounded-full">
                        Brand
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline space-x-2 mb-3">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(product.priceSell)}
                      </span>
                      {discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.priceMrp)}
                        </span>
                      )}
                    </div>
                    <Button className="w-full" size="sm">
                      Add to Cart
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Dots indicator */}
          {products.length > itemsPerView && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-green-600 w-8"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
