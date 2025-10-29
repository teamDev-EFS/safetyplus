import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { useWishlistStore } from "../store/wishlistStore";
import { formatCurrency, calculateDiscount, getImageUrl } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Heart, ShoppingCart } from "lucide-react";
import { useToast } from "../hooks/useToast";

export function WishlistPage() {
  const { items, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleUnwishlist = async (productId: string, productName: string) => {
    try {
      await removeFromWishlist(productId);
      toast({
        title: "Removed from wishlist",
        description: `${productName} has been removed from your wishlist.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from wishlist",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
          <div className="text-center py-16">
            <Heart className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Your wishlist is empty
            </p>
            <Link to="/shop">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Button>Add All to Cart</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const discount = calculateDiscount(
              product.priceMrp,
              product.priceSell
            );

            return (
              <div
                key={item.productId}
                className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                  <img
                    src={getImageUrl(
                      product.images[0]?.path || "/placeholder.jpg"
                    )}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {discount}% OFF
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
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
                  <div className="flex space-x-2">
                    <Link to={`/product/${product.slug}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleUnwishlist(product._id, product.name)
                      }
                    >
                      <Heart className="w-4 h-4 fill-red-600 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
