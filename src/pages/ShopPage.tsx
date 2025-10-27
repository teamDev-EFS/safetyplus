import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { Product } from '../types/database';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { formatCurrency, calculateDiscount, getImageUrl } from '../lib/utils';
import { Search, Filter } from 'lucide-react';

export function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
        .eq('is_active', true);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data } = await query.order('created_at', { ascending: false }).limit(24);
      return data as Product[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return data;
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Shop Safety Equipment</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md sticky top-24">
              <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === null
                          ? 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      All Products
                    </button>
                    {categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory === category.id
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-800"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const discount = calculateDiscount(product.price_mrp, product.price_sell);
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                        <img
                          src={getImageUrl(product.images[0]?.path)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        {discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {discount}% OFF
                          </div>
                        )}
                        {product.brand && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-3 py-1 rounded-full">
                            {product.brand.name}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline space-x-2 mb-3">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.price_sell)}
                          </span>
                          {discount > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.price_mrp)}
                            </span>
                          )}
                        </div>
                        <Button className="w-full" size="sm">
                          View Details
                        </Button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
