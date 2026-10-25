import React from 'react';
import { X, Star, Leaf, ShoppingBag } from 'lucide-react';

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-berry-950/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-mocha-900 rounded-4xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-lavender-200 dark:border-lavender-800 p-6 sm:p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close product details" className="absolute top-4 right-4 p-2 rounded-full bg-lavender-100 dark:bg-mocha-800 hover:bg-lavender-200 dark:hover:bg-mocha-700 text-berry-950 dark:text-white transition">
          <X className="w-5 h-5" />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="aspect-square rounded-3xl overflow-hidden bg-lavender-50 dark:bg-mocha-800">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-4 pt-2">
            <p className="text-sm font-semibold text-lavender-700 dark:text-purple-300">{product.bakeryName}</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-berry-950 dark:text-white">{product.name}</h2>
            <div className="flex items-center gap-2 text-sm text-amber-500 font-semibold"><Star className="w-4 h-4 fill-amber-400" /> {product.rating.toFixed(1)} <span className="text-berry-900/60 dark:text-purple-300/60">({product.numReviews} sample ratings)</span></div>
            <p className="text-2xl font-display font-bold text-lavender-700 dark:text-purple-300">₹{product.price.toLocaleString('en-IN')}</p>
            <p className="text-sm sm:text-base text-berry-900/80 dark:text-purple-200/80 leading-relaxed">{product.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-lavender-100 dark:bg-mocha-800 px-3 py-1 text-xs font-semibold">{product.category}</span>
              {product.isEggless && <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold flex items-center gap-1"><Leaf className="w-3 h-3" /> Eggless</span>}
              {product.isVegan && <span className="rounded-full bg-teal-100 text-teal-800 px-3 py-1 text-xs font-semibold">Vegan</span>}
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-sm text-amber-900 dark:text-amber-100">
              <p className="font-bold flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Demonstration catalogue</p>
              <p className="mt-1">This is sample product information. Ordering, checkout, customer accounts and reviews are not enabled in this preview.</p>
            </div>
            <button onClick={onClose} className="w-full py-3 px-6 rounded-2xl font-semibold text-sm bg-lavender-600 hover:bg-lavender-700 text-white transition">Continue browsing</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
