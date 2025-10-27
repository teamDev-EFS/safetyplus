import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { toast } from '../components/ui/Toaster';
import { formatCurrency, getImageUrl } from '../lib/utils';

export function WishlistPage() {
  const { user } = useAuthStore();
  const { items, removeItem, fetchWishlist, loading } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  useEffect(() => {
    if (user) {
      fetchWishlist(user.id);
    }
  }, [user, fetchWishlist]);

  if (!user) {
    return <Navigate to="/login" state={{ from: '/wishlist' }} />;
  }

  const handleRemove = async (productId: string) => {
    await removeItem(user.id, productId);
    toast('Removed from wishlist', 'success');
  };

  const handleMoveToCart = async (product: any) => {
    addToCart({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price_sell,
      quantity: 1,
      image_path: product.images?.[0]?.path || product.image_path,
    });
    await removeItem(user.id, product.id);
    toast('Moved to cart', 'success');
  };

  const handleAddAllToCart = () => {
    items.forEach((product) => {
      addToCart({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price_sell,
        quantity: 1,
        image_path: product.images?.[0]?.path || product.image_path,
      });
    });
    toast(`Added ${items.length} items to cart`, 'success');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-4 opacity-90">
            <Link to="/">Home</Link> › <span className="font-semibold">Wishlist</span>
          </nav>
          <h1 className="text-5xl font-bold mb-4">My Wishlist</h1>
          <p className="text-xl opacity-90">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Save items you love to your wishlist and come back to them later.
            </p>
            <Link to="/shop">
              <Button size="lg">
                <Package className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
            </Link>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Link
                to="/shop?category=safety-cabinets"
                className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl hover:shadow-lg transition"
              >
                <h3 className="font-semibold mb-2">Safety Cabinets</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore our range
                </p>
              </Link>
              <Link
                to="/shop?category=ppe"
                className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl hover:shadow-lg transition"
              >
                <h3 className="font-semibold mb-2">PPE Equipment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse safety gear
                </p>
              </Link>
              <Link
                to="/shop?category=fire-safety"
                className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl hover:shadow-lg transition"
              >
                <h3 className="font-semibold mb-2">Fire Safety</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View fire equipment
                </p>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {items.length} {items.length === 1 ? 'Product' : 'Products'}
                </h2>
              </div>
              <Button onClick={handleAddAllToCart} size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add All to Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <Link to={`/product/${product.slug}`} className="block relative aspect-square">
                    <img
                      src={getImageUrl(product.images?.[0]?.path || product.image_path)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=800';
                      }}
                    />

                    {product.badge && (
                      <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(product.id);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition group/heart"
                    >
                      <Heart className="w-5 h-5 text-red-600 fill-red-600" />
                    </button>
                  </Link>

                  <div className="p-4">
                    {product.brand && (
                      <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                        {product.brand.name}
                      </div>
                    )}

                    <Link
                      to={`/product/${product.slug}`}
                      className="block font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-green-600 dark:hover:text-green-400 transition min-h-[3rem]"
                    >
                      {product.name}
                    </Link>

                    <div className="flex items-baseline space-x-2 mb-4">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(product.price_sell)}
                      </span>
                      {product.price_mrp > product.price_sell && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.price_mrp)}
                          </span>
                          <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                            {Math.round(((product.price_mrp - product.price_sell) / product.price_mrp) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {product.stock_quantity !== undefined && (
                      <div className="mb-4">
                        {product.stock_quantity > 0 ? (
                          <span className="text-sm text-green-600 dark:text-green-400">
                            In Stock ({product.stock_quantity} available)
                          </span>
                        ) : (
                          <span className="text-sm text-red-600">Out of Stock</span>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleMoveToCart(product)}
                        className="flex-1"
                        size="sm"
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={() => handleRemove(product.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
