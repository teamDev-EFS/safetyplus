import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Product } from '../types/database';
import { formatCurrency, calculateDiscount, getImageUrl } from '../lib/utils';
import { useCartStore } from '../store/cartStore';
import { toast } from '../components/ui/Toaster';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        await supabase
          .from('products')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
      }

      return data as Product;
    },
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price_sell,
      image_path: product.images[0]?.path || '',
      qty: quantity,
    });

    toast('Added to cart successfully!', 'success');
  };

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
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = calculateDiscount(product.price_mrp, product.price_sell);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-amber-600">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          {product.category && (
            <>
              <span>{product.category.name}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
              <img
                src={getImageUrl(product.images[0]?.path)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-500 transition">
                    <img src={getImageUrl(img.path)} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.brand && (
              <div className="inline-block px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium mb-4">
                {product.brand.name}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline space-x-3 mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price_sell)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(product.price_mrp)}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-sm font-bold rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="mb-6">
              <span className={`inline-block px-4 py-2 rounded-lg font-medium ${
                product.stock_qty > 0
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}>
                {product.stock_qty > 0 ? `In Stock (${product.stock_qty} available)` : 'Out of Stock'}
              </span>
            </div>

            {product.description_html && (
              <div className="prose dark:prose-invert mb-8" dangerouslySetInnerHTML={{ __html: product.description_html }} />
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
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
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
                disabled={product.stock_qty === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {product.specs && product.specs.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-4">Specifications</h2>
                <dl className="space-y-3">
                  {product.specs.map((spec, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
                      <dt className="font-medium text-gray-600 dark:text-gray-400">{spec.key}</dt>
                      <dd className="text-gray-900 dark:text-white">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
