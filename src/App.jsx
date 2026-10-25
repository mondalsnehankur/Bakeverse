import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';

function DemoNoticePage() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-24 text-center space-y-5">
      <div className="text-5xl">🧁</div>
      <p className="text-sm font-bold uppercase tracking-widest text-lavender-700 dark:text-purple-300">Demo preview</p>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-berry-950 dark:text-white">This feature is not enabled in the demo</h1>
      <p className="text-berry-900/80 dark:text-purple-200/80 leading-relaxed">The public preview is designed for browsing the sample catalogue. Sign-in, ordering, checkout, AI tools, custom cake design and bakery dashboards require the full backend and are intentionally unavailable here.</p>
      <Link to="/menu" className="inline-flex rounded-full bg-lavender-600 hover:bg-lavender-700 text-white px-6 py-3 font-semibold transition">Explore the sample menu</Link>
    </section>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
            <div className="min-h-screen flex flex-col justify-between bg-lavender-50 dark:bg-mocha-950 text-berry-950 dark:text-purple-50 transition-colors duration-300">
              <Navbar />
              <div className="text-center px-4 py-2 text-xs sm:text-sm font-semibold bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-100 border-y border-amber-200 dark:border-amber-900">
                DEMO PREVIEW · Sample products only · Accounts, orders, checkout and AI services are disabled
              </div>
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/buy" element={<Navigate to="/menu" replace />} />
                  <Route path="*" element={<DemoNoticePage />} />
                </Routes>
              </main>
              <Footer />
            </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
