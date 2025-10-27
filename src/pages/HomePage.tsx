import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award, Clock } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Product } from '../types/database';
import { formatCurrency, calculateDiscount, getImageUrl } from '../lib/utils';

export function HomePage() {
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);
      return data as Product[];
    },
  });

  return (
    <Layout>
      <section className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              Trusted by 12,500+ Customers Nationwide
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              YOUR SAFETY,<br />OUR PRIORITY
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              India's largest safety equipment supplier with 1,322+ partner suppliers and 250+ dedicated professionals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Premium Quality', desc: 'Certified safety equipment' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Nationwide shipping' },
              { icon: Award, title: 'Trusted Brand', desc: '10+ years of excellence' },
              { icon: Clock, title: '24/7 Support', desc: 'Always here to help' },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Elite Products</h2>
                <p className="text-gray-600 dark:text-gray-400">Handpicked premium safety equipment</p>
              </div>
              <Link to="/shop">
                <Button variant="outline">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
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
                        Add to Cart
                      </Button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ensure Your Safety?</h2>
          <p className="text-xl text-gray-300 mb-8">Explore our comprehensive range of safety equipment</p>
          <Link to="/shop">
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600">
              Browse Catalogue <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
