
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Clock, ShieldCheck, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-lavender-100/70 dark:bg-mocha-950 border-t border-lavender-200/80 dark:border-lavender-900/40 mt-20 pt-14 pb-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Column 1: Brand & Philosophy */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-lavender-300 dark:bg-mocha-800 flex items-center justify-center shadow-xs">
                <span className="text-xl">🧁</span>
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-berry-950 dark:text-white">
                BakeVerse
                <span className="text-lavender-600 dark:text-lavender-400 font-bold ml-1 text-xl">
                  AI
                </span>
              </span>
            </div>

            <p className="text-sm leading-relaxed text-berry-900/80 dark:text-purple-200/80">
              Whimsical Korean & Japanese dessert boutique blending heritage
              pastry techniques with modern sweet intelligence. Freshly baked
              each sunrise with organic unrefined ingredients.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-lavender-800 dark:text-purple-200 bg-lavender-200/60 dark:bg-mocha-800 py-1.5 px-3 rounded-full w-fit">
              <Sparkles className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
              <span>100% Artisan Handcrafted</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-berry-950 dark:text-white text-sm tracking-wider uppercase">
              Treat Catalog
            </h4>

            <ul className="space-y-2.5 text-sm text-berry-900/80 dark:text-purple-200/80">
              <li>
                <Link
                  to="/menu?category=Cakes"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  Botanical Cloud Cakes
                </Link>
              </li>
              <li>
                <Link
                  to="/menu?category=Pastries"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  Matcha & Fruit Tartlets
                </Link>
              </li>
              <li>
                <Link
                  to="/menu?category=Donuts"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  Mochi Pon-De-Rings
                </Link>
              </li>
              <li>
                <Link
                  to="/menu?category=Cookies"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  Parisian Ganache Macarons
                </Link>
              </li>
              <li>
                <Link
                  to="/menu?category=Breads"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  Golden Japanese Shokupan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Demo AI Experiences */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-berry-950 dark:text-white text-sm tracking-wider uppercase">
              AI Experiences
            </h4>

            <ul className="space-y-2.5 text-sm text-berry-900/80 dark:text-purple-200/80">
              <li>
                <Link
                  to="/ai-features"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  Chef Baker AI Chatbot
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-features"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  Interactive Flavor Pairing Finder
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-features"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  Curated Gift Box Assistant
                </Link>
              </li>
              <li>
                <Link
                  to="/bake-cake"
                  className="hover:text-lavender-700 dark:hover:text-white transition"
                >
                  3D Visual Cake Preview Generator
                </Link>
              </li>
            </ul>

            <p className="text-xs leading-relaxed text-berry-900/60 dark:text-purple-200/60">
              These features are previews and are not enabled in this demo.
            </p>
          </div>

          {/* Column 4: Hours & Boutique Info */}
          <div className="space-y-3 text-sm text-berry-900/80 dark:text-purple-200/80">
            <h4 className="font-display font-bold text-berry-950 dark:text-white text-sm tracking-wider uppercase">
              Boutique Hours
            </h4>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-lavender-600 dark:text-lavender-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-berry-950 dark:text-white">
                  Monday - Sunday
                </p>
                <p>8:00 AM - 9:00 PM</p>
                <p className="text-xs text-lavender-700 dark:text-purple-300 mt-0.5">
                  Express delivery before 3:00 PM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Eggless & Vegan Certified Kitchen</span>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <Mail className="w-4 h-4 text-lavender-600 dark:text-lavender-400 mt-0.5 shrink-0" />
              <span>concierge@bakeverse.com</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-lavender-200 dark:border-lavender-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-berry-900/70 dark:text-purple-200/70">
          <p>
            © {new Date().getFullYear()} BakeVerse AI. All sweet rights reserved.
          </p>

          <div className="flex items-center gap-1.5">
            <span>Crafted with sweet dedication</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 mx-1" />
            <span>& organic vanilla</span>
          </div>
        </div>

        {/* Demo Disclaimer */}
        <p className="text-center text-xs mt-5 text-berry-900/60 dark:text-purple-200/60">
          Demo preview: sample products only. Accounts, orders, checkout and AI
          services are disabled.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
