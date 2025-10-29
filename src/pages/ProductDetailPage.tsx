import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { formatCurrency, calculateDiscount, getImageUrl } from "../lib/utils";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useToast } from "../hooks/useToast";
import { ShoppingCart, ChevronRight, Heart } from "lucide-react";
import { useState } from "react";
import { productsAPI } from "../lib/api";
import { SEO, productJSONLD, breadcrumbJSONLD } from "../components/SEO";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const {
    items: wishlistItems,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlistStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      return await productsAPI.getBySlug(slug!);
    },
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      product_id: product._id || product.id,
      sku: product.sku,
      name: product.name,
      price: product.priceSell,
      image_path: product.images?.[0]?.path || "",
      qty: quantity,
    });

    toast({ title: "Success", description: "Added to cart successfully!" });
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    const productId = product._id || product.id;
    const isInWishlist = wishlistItems.some(
      (item) => item.productId === productId
    );

    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
        toast({ title: "Removed", description: "Removed from wishlist!" });
      } else {
        await addToWishlist(productId);
        toast({ title: "Added", description: "Added to wishlist!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  const isInWishlist = product
    ? wishlistItems.some(
        (item) => item.productId === (product._id || product.id)
      )
    : false;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <SEO title="Product Not Found" noindex />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const productUrl = `/product/${product.slug || product._id}`;
  const productImage = getImageUrl(product.images?.[0]?.path || "");
  const categoryName =
    typeof product.categoryId === "object" && product.categoryId?.name
      ? product.categoryId.name
      : "";

  return (
    <Layout>
      <SEO
        title={product.name}
        description={
          product.descriptionHtml
            ? product.descriptionHtml.replace(/<[^>]*>/g, "").substring(0, 160)
            : `${product.name} - ${
                categoryName || "Safety Equipment"
              } from SafetyPlus`
        }
        image={productImage}
        type="product"
        url={productUrl}
        jsonLd={[
          productJSONLD({
            name: product.name,
            description: product.descriptionHtml?.replace(/<[^>]*>/g, "") || "",
            image: productImage,
            price: product.priceSell,
            currency: product.currency || "INR",
            sku: product.sku,
            url: productUrl,
            brand: "SafetyPlus",
          }),
          breadcrumbJSONLD([
            { name: "Home", url: "/" },
            { name: "Shop", url: "/shop" },
            ...(categoryName
              ? [{ name: categoryName, url: `/shop?category=${categoryName}` }]
              : []),
            { name: product.name, url: productUrl },
          ]),
        ]}
      />
      {(() => {
        const discount = calculateDiscount(product.priceMrp, product.priceSell);

        return (
          <div className="container mx-auto px-4 py-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
              <Link to="/" className="hover:text-amber-600">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/shop" className="hover:text-amber-600">
                Shop
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white">
                {product.name}
              </span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                  <img
                    src={getImageUrl(product.images?.[0]?.path)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.slice(1, 5).map((img: any, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-500 transition"
                      >
                        <img
                          src={getImageUrl(img.path)}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h1>

                <div className="flex items-baseline space-x-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(product.priceSell)}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatCurrency(product.priceMrp)}
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-sm font-bold rounded-full">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="mb-6">
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-medium ${
                      product.stockQty > 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {product.stockQty > 0
                      ? `In Stock (${product.stockQty} available)`
                      : "Out of Stock"}
                  </span>
                </div>

                {product.descriptionHtml && (
                  <div
                    className="prose dark:prose-invert mb-8"
                    dangerouslySetInnerHTML={{
                      __html: product.descriptionHtml,
                    }}
                  />
                )}

                <div className="flex items-center space-x-4 mb-8">
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 text-center border-x border-gray-300 dark:border-gray-700 py-3 bg-transparent"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      +
                    </button>
                  </div>

                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={product.stockQty === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWishlistToggle}
                    className={`px-4 ${
                      isInWishlist
                        ? "text-red-600 border-red-600 hover:bg-red-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isInWishlist ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>

                {product.specs && product.specs.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <h2 className="font-bold text-lg mb-4">Specifications</h2>
                    <dl className="space-y-3">
                      {product.specs.map((spec: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800 last:border-0"
                        >
                          <dt className="font-medium text-gray-600 dark:text-gray-400">
                            {spec.key}
                          </dt>
                          <dd className="text-gray-900 dark:text-white">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </Layout>
  );
}
