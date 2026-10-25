import React from 'react';
import { Star, ShoppingBag, Leaf, Store } from 'lucide-react';

const ProductCard = ({ product, onSelect }) => {
  const handleQuickAdd = (e) => e.stopPropagation();

  return (
    <div
      onClick={() => onSelect && onSelect(product)}
      className="group bg-white dark:bg-mocha-800 rounded-3xl p-4 border border-lavender-200/80 dark:border-lavender-800/80 shadow-card hover:shadow-soft hover:border-lavender-300 dark:hover:border-lavender-600 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Decorative top shimmer on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lavender-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3.5 bg-lavender-50 dark:bg-mocha-700">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Category & Bakery Pill */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            <span className="text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full bg-white/95 dark:bg-mocha-900/90 backdrop-blur-md text-berry-950 dark:text-purple-100 shadow-xs">
              {product.category}
            </span>
          </div>

          {/* Dietary Badges */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
            {product.isEggless && (
              <span
                className="flex items-center gap-1 text-xs font-bold py-1 px-2.5 rounded-full bg-emerald-600/95 text-white backdrop-blur-md shadow-xs"
                title="100% Eggless Treat"
              >
                <Leaf className="w-3.5 h-3.5 fill-current" />
                Eggless
              </span>
            )}
            {product.isVegan && (
              <span
                className="text-xs font-bold py-1 px-2.5 rounded-full bg-teal-600/95 text-white backdrop-blur-md shadow-xs"
                title="100% Vegan Recipe"
              >
                Vegan
              </span>
            )}
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-red-500 text-white font-bold text-sm uppercase px-3.5 py-1.5 rounded-full shadow-md">
                Sold Out Today
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1.5">
          {/* Bakery Name Origin */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-lavender-700 dark:text-purple-300">
            <Store className="w-3.5 h-3.5" />
            <span className="truncate">{product.bakeryName || 'Sweet Treats Studio'}</span>
          </div>

          <h3 className="font-display font-bold text-berry-950 dark:text-white text-lg group-hover:text-lavender-600 dark:group-hover:text-lavender-300 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{product.rating?.toFixed(1) || '5.0'}</span>
            <span className="text-berry-900/60 dark:text-purple-300/60 font-medium">({product.numReviews || 0})</span>
          </div>

          <p className="text-sm text-berry-900/80 dark:text-purple-200/80 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Price & Action Button (INR Currency) */}
      <div className="mt-4 pt-3 border-t border-lavender-100 dark:border-lavender-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs text-lavender-700 dark:text-purple-300 uppercase font-bold block">Price</span>
          <span className="font-display font-bold text-xl text-berry-950 dark:text-white">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={handleQuickAdd}
          disabled
          className="p-2.5 rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-mocha-900 text-gray-400 cursor-not-allowed"
          title="Ordering is disabled in the demonstration"
          aria-label="Ordering disabled in demo"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
