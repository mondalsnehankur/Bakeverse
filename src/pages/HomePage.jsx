import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart, Star, ShieldCheck, Truck, Clock, Cake, Coffee, Cookie, Store } from 'lucide-react';
import BakeryHeroCanvas from '../components/3d/BakeryHeroCanvas';
import ProductCard from '../components/common/ProductCard';
import ProductDetailModal from '../components/modals/ProductDetailModal';
import { DEMO_PRODUCTS, DEMO_BAKERIES } from '../data/demoProducts';

const HomePage = () => {
  const [featuredTreats, setFeaturedTreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [partnerBakeries, setPartnerBakeries] = useState([]);

  useEffect(() => {
    setFeaturedTreats(DEMO_PRODUCTS.slice(0, 8));
    setPartnerBakeries(DEMO_BAKERIES);
    setLoading(false);
  }, []);

  const categories = [
    { name: 'Cakes', icon: '🎂', count: 'Cloud & Chiffon', link: '/menu?category=Cakes' },
    { name: 'Pastries', icon: '🥐', count: 'Tarts & Mille-feuille', link: '/menu?category=Pastries' },
    { name: 'Cupcakes', icon: '🧁', count: 'Pastel Berry Swirls', link: '/menu?category=Cupcakes' },
    { name: 'Donuts', icon: '🍩', count: 'Mochi Pon-De-Rings', link: '/menu?category=Donuts' },
    { name: 'Breads', icon: '🍞', count: 'Golden Milk Shokupan', link: '/menu?category=Breads' },
    { name: 'Cookies', icon: '🍪', count: 'Parisian Macarons', link: '/menu?category=Cookies' },
    { name: 'Beverages', icon: '🍵', count: 'Cold Cloud Lattes', link: '/menu?category=Beverages' },
  ];

  const bakeryDetails = {
    'Sweet Treats Studio': {
      specialty: 'Specialty Cloud Chiffons & Korean Ombre Cakes',
      avatar: '🎂',
      badge: 'Boutique Patisserie',
      description: 'Handcrafting ultra-light chiffon celebration cakes, pastel berry swirls, and floral tea infusions.',
    },
    'Artisan Crust Bakery': {
      specialty: 'Japanese Shokupan, Brioche & Sourdough',
      avatar: '🍞',
      badge: 'Heritage Bakery',
      description: 'Honoring traditional hot-water baking methods with golden brioche loaves and slow-fermented breads.',
    },
    'Velvet & Whisk Patisserie': {
      specialty: 'Parisian Jewel Macarons & Fruit Tarts',
      avatar: '🥐',
      badge: 'Haute Confiserie',
      description: 'Creating dark chocolate entremets, ceremonial matcha tarts, and crisp almond macarons.',
    },
  };

  const premierBakeries = (partnerBakeries.length ? partnerBakeries : Object.keys(bakeryDetails).map((name) => ({ name }))).map((bakery) => ({
    ...bakery,
    ...(bakeryDetails[bakery.name] || {
      specialty: 'Small-batch artisan bakery treats',
      avatar: '🧁',
      badge: 'Partner Bakery',
      description: 'Fresh handcrafted treats prepared by our bakery partner.',
    }),
    link: `/menu?bakery=${encodeURIComponent(bakery.name)}`,
  }));

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Scattered 3D Hero Section */}
      <section className="relative min-h-[580px] sm:min-h-[660px] flex items-center justify-center pt-6">
        {/* 3D Canvas Background with Scattered Treats */}
        <BakeryHeroCanvas />

        {/* Central Typography Statement Block */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <div className="max-w-2xl mx-auto space-y-4 pointer-events-auto">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/95 dark:bg-mocha-800/95 backdrop-blur-md border border-lavender-200 dark:border-lavender-800 text-sm font-semibold text-berry-950 dark:text-purple-100 shadow-soft animate-soft-float">
              <Sparkles className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
              <span>Multi-Bakery Artisan Marketplace</span>
            </div>

            {/* Central Statement Quote */}
            <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-berry-950 dark:text-white tracking-tight leading-[1.15] drop-shadow-xs">
              Crafting Sweet Moments,{' '}
              <span className="bg-gradient-to-r from-purple-700 via-lavender-500 to-pink-500 dark:from-purple-400 dark:via-lavender-300 dark:to-pink-300 bg-clip-text text-transparent">
                One Bite at a Time
              </span>
            </h1>

            <p className="text-base sm:text-lg text-berry-900/90 dark:text-purple-100 font-medium max-w-xl mx-auto leading-relaxed">
              Order small-batch handcrafted desserts from top artisan partner bakeries across town. Delivered fresh to your doorstep in Indian Rupees (₹).
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/menu"
                className="py-3 px-7 rounded-full bg-gradient-to-r from-lavender-600 to-purple-600 hover:from-lavender-700 hover:to-purple-700 text-white font-semibold text-sm tracking-wide shadow-soft hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Premier Partner Bakeries Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-sm font-bold uppercase tracking-widest text-lavender-700 dark:text-lavender-300">
            Artisan Kitchens
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-berry-950 dark:text-white">
            Our Premier Partner Bakeries
          </h2>
          <p className="text-sm sm:text-base text-berry-900/80 dark:text-purple-200/80 leading-relaxed">
            Each partner bakery brings distinct culinary traditions, authentic recipes, and mastery over small-batch baking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {premierBakeries.map((b) => (
            <div
              key={b.name}
              className="glass-card rounded-4xl p-7 sm:p-8 border border-lavender-200/90 dark:border-lavender-800 shadow-soft hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-lavender-100 dark:bg-mocha-700 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-xs">
                    {b.avatar}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-lavender-200 dark:bg-lavender-900/80 text-berry-950 dark:text-purple-100">
                    {b.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-2xl text-berry-950 dark:text-white group-hover:text-lavender-600 dark:group-hover:text-lavender-400 transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-sm font-semibold text-lavender-700 dark:text-lavender-300 mt-1">
                    {b.specialty}
                  </p>
                </div>

                <p className="text-sm text-berry-900/80 dark:text-purple-200/80 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <Link
                to={b.link}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-lavender-700 dark:text-lavender-300 hover:text-berry-950 dark:hover:text-white transition group-hover:translate-x-1"
              >
                <span>Browse {b.name} Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-sm font-bold uppercase tracking-widest text-lavender-700 dark:text-lavender-300">
            Handcrafted Collections
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-berry-950 dark:text-white">
            Explore Artisan Categories
          </h2>
          <p className="text-sm sm:text-base text-berry-900/80 dark:text-purple-200/80 leading-relaxed">
            Every treat is freshly whipped with unrefined Japanese sugars and fresh botanical essences.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 sm:gap-6">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={c.link}
              className="glass-card rounded-3xl p-6 sm:p-7 min-h-[220px] text-center border border-lavender-200/90 dark:border-lavender-800 shadow-card hover:shadow-soft hover:border-lavender-300 dark:hover:border-lavender-600 transition-all duration-300 flex flex-col items-center justify-center group"
            >
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-lavender-100/90 dark:bg-mocha-700/80 flex items-center justify-center text-4xl shadow-xs group-hover:scale-110 transition-transform duration-300 mb-3">
                <span>{c.icon}</span>
              </div>
              <h4 className="font-display font-bold text-xl text-berry-950 dark:text-white group-hover:text-lavender-600 dark:group-hover:text-lavender-300 transition-colors">
                {c.name}
              </h4>
              <span className="text-sm font-medium text-berry-900/75 dark:text-purple-200/75 line-clamp-1 mt-1">
                {c.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Signature Treats Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-lavender-700 dark:text-lavender-300">
              Fresh From The Oven
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-berry-950 dark:text-white">
              Signature Creations
            </h2>
          </div>
          <Link
            to="/menu"
            className="flex items-center gap-2 text-sm font-bold text-lavender-700 dark:text-lavender-300 hover:text-berry-950 dark:hover:text-white transition"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/60 dark:bg-mocha-800/60 rounded-3xl p-4 animate-pulse h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTreats.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onProductUpdated={(updated) => {
            setSelectedProduct(updated);
            setFeaturedTreats((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p))
            );
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
