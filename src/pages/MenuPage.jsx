import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Leaf, ArrowUpDown, Sparkles, Store } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import ProductDetailModal from '../components/modals/ProductDetailModal';
import { DEMO_PRODUCTS, DEMO_BAKERIES } from '../data/demoProducts';

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [partnerBakeries, setPartnerBakeries] = useState([]);

  // Filters state
  const categoryParam = searchParams.get('category') || 'All';
  const bakeryParam = searchParams.get('bakery') || 'All';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBakery, setSelectedBakery] = useState(bakeryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [egglessOnly, setEgglessOnly] = useState(false);
  const [veganOnly, setVeganOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { name: 'All', icon: '✨' },
    { name: 'Cakes', icon: '🎂' },
    { name: 'Pastries', icon: '🥐' },
    { name: 'Cupcakes', icon: '🧁' },
    { name: 'Donuts', icon: '🍩' },
    { name: 'Breads', icon: '🍞' },
    { name: 'Cookies', icon: '🍪' },
    { name: 'Beverages', icon: '🍵' },
  ];

  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category'));
    }
    if (searchParams.get('bakery')) {
      setSelectedBakery(searchParams.get('bakery'));
    }
  }, [searchParams]);

  useEffect(() => {
    setPartnerBakeries(DEMO_BAKERIES);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBakery, egglessOnly, veganOnly, sortBy]);

  const fetchProducts = () => {
    setLoading(true);
    const query = searchQuery.trim().toLowerCase();
    let filtered = DEMO_PRODUCTS.filter((product) => {
      const matchesCategory = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
      const matchesBakery = !selectedBakery || selectedBakery === 'All' || selectedBakery === 'All Bakeries' || product.bakeryName === selectedBakery;
      const matchesEggless = !egglessOnly || product.isEggless;
      const matchesVegan = !veganOnly || product.isVegan;
      const matchesSearch = !query || `${product.name} ${product.description} ${product.category} ${product.bakeryName}`.toLowerCase().includes(query);
      return matchesCategory && matchesBakery && matchesEggless && matchesVegan && matchesSearch;
    });
    if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => b.numReviews - a.numReviews);
    setProducts(filtered);
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleBakeryClick = (bName) => {
    setSelectedBakery(bName);
    if (bName === 'All Bakeries' || bName === 'All') {
      searchParams.delete('bakery');
    } else {
      searchParams.set('bakery', bName);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-sm font-bold uppercase tracking-widest text-lavender-700 dark:text-purple-300 bg-lavender-100 dark:bg-mocha-800 py-1.5 px-4 rounded-full">
          Multi-Bakery Artisan Catalog
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-berry-950 dark:text-white">
          Our Handcrafted Treats
        </h1>
        <p className="text-base text-berry-900/80 dark:text-purple-200/80 leading-relaxed max-w-2xl mx-auto">
          Freshly baked in small batches each morning across our boutique partner bakeries. Filter by your dietary preferences or explore signature cloud cakes and tarts in Indian Rupees (₹).
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-3xl p-6 shadow-soft border border-lavender-200 dark:border-lavender-800 space-y-5">
        {/* Top row: Search input & Sorting */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cakes, tarts, shokupan..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-lavender-200 dark:border-lavender-700 focus:outline-none focus:ring-2 focus:ring-lavender-400 text-sm font-medium bg-white dark:bg-mocha-900 text-berry-950 dark:text-white placeholder-berry-900/40 dark:placeholder-purple-300/40"
            />
            <Search className="w-4 h-4 text-lavender-600 dark:text-lavender-400 absolute left-4 top-3.5" />
          </form>

          {/* Bakery Name Selector Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <span className="text-sm font-bold text-berry-950 dark:text-purple-100 flex items-center gap-1.5 shrink-0 mr-1">
              <Store className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
              <span>Bakery:</span>
            </span>
            {['All Bakeries', ...partnerBakeries.map((bakery) => bakery.name)].map((bName) => (
              <button
                key={bName}
                onClick={() => handleBakeryClick(bName)}
                className={`py-2 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 border ${
                  (selectedBakery === bName || (bName === 'All Bakeries' && selectedBakery === 'All'))
                    ? 'bg-lavender-600 text-white border-lavender-600 shadow-xs'
                    : 'bg-white dark:bg-mocha-800 hover:bg-lavender-100 dark:hover:bg-mocha-700 text-berry-950 dark:text-purple-100 border-lavender-200 dark:border-lavender-700'
                }`}
              >
                {bName}
              </button>
            ))}
          </div>

          {/* Dietary Checkboxes & Sort */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">
            <label className="flex items-center gap-2 text-sm font-semibold text-berry-950 dark:text-purple-100 cursor-pointer select-none bg-white dark:bg-mocha-800 py-2 px-3.5 rounded-full border border-lavender-200 dark:border-lavender-700 hover:border-emerald-300 transition">
              <input
                type="checkbox"
                checked={egglessOnly}
                onChange={(e) => setEgglessOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-400"
              />
              <Leaf className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Eggless</span>
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-berry-950 dark:text-purple-100 cursor-pointer select-none bg-white dark:bg-mocha-800 py-2 px-3.5 rounded-full border border-lavender-200 dark:border-lavender-700 hover:border-teal-300 transition">
              <input
                type="checkbox"
                checked={veganOnly}
                onChange={(e) => setVeganOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-400"
              />
              <span>🌱 Vegan</span>
            </label>

            <div className="flex items-center gap-1.5 bg-white dark:bg-mocha-800 py-2 px-3.5 rounded-full border border-lavender-200 dark:border-lavender-700">
              <ArrowUpDown className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-semibold text-berry-950 dark:text-purple-100 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="popular" className="dark:bg-mocha-900 dark:text-white">Most Popular</option>
                <option value="rating" className="dark:bg-mocha-900 dark:text-white">Highest Rated</option>
                <option value="price-asc" className="dark:bg-mocha-900 dark:text-white">Price (₹): Low to High</option>
                <option value="price-desc" className="dark:bg-mocha-900 dark:text-white">Price (₹): High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enlarged Artisan Category Icons & Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`py-2.5 px-5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-2.5 border ${
                selectedCategory === cat.name
                  ? 'bg-lavender-600 text-white border-lavender-600 shadow-soft'
                  : 'bg-white dark:bg-mocha-800 hover:bg-lavender-100 dark:hover:bg-mocha-700 text-berry-950 dark:text-purple-100 border-lavender-200 dark:border-lavender-700'
              }`}
            >
              <span className="text-xl shrink-0">{cat.icon}</span>
              <span className="shrink-0">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white/60 dark:bg-mocha-800/60 rounded-3xl p-4 animate-pulse h-80"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-mocha-800/50 rounded-4xl border border-lavender-200 dark:border-lavender-800 max-w-lg mx-auto p-8 space-y-3">
          <span className="text-5xl">🧁</span>
          <h3 className="font-display font-bold text-xl text-berry-950 dark:text-white">No sweet treats match your filters</h3>
          <p className="text-sm text-berry-900/80 dark:text-purple-200/80">
            Try resetting your search query, choosing all bakeries, or selecting another dietary preference.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBakery('All Bakeries');
              setSearchQuery('');
              setEgglessOnly(false);
              setVeganOnly(false);
            }}
            className="py-2.5 px-6 rounded-full bg-lavender-600 text-white text-sm font-semibold mt-2 shadow-xs hover:bg-lavender-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onProductUpdated={(updated) => {
            setSelectedProduct(updated);
            setProducts((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p))
            );
          }}
        />
      )}
    </div>
  );
};

export default MenuPage;
