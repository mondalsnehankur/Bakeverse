import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, Heart, Gift, Send, ChefHat, Check, ArrowRight, RefreshCw, Sliders, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const AiHubPage = () => {
  const { addToCart, addGiftBoxToCart } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'flavor' | 'gift'

  // 1. Chef Baker Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask about eggless recipes, store hours, custom celebration tiers, or flavor pairings.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const quickQuestions = [
    'What are your store hours & delivery times? ⏰',
    'Which cakes are 100% eggless? 🌿',
    'Can you recommend a romantic anniversary treat? 🍓',
    'What makes your Japanese Shokupan so fluffy? 🍞',
  ];

  const handleSendChat = async (textToSend) => {
    const q = textToSend || chatInput;
    if (!q.trim() || chatLoading) return;

    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: q });
      if (res.data.success) {
        const reply = typeof res.data.reply === 'string' && res.data.reply.trim()
          ? res.data.reply.trim()
          : 'No complete response was returned.';
        setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Chat response unavailable. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // 2. Flavor Finder State
  const baseFlavors = ['Matcha', 'Lavender', 'Wild Strawberry', 'Salted Caramel', 'Valrhona Chocolate', 'Mango', 'Earl Grey'];
  const accentFlavors = ['White Chocolate', 'Bergamot Tea', 'Sicilian Pistachio', 'Dark Fudge', 'Passionfruit', 'Sweet Cream', 'Rose Water'];
  const [selectedBase, setSelectedBase] = useState('Matcha');
  const [selectedAccent, setSelectedAccent] = useState('White Chocolate');
  const [flavorResult, setFlavorResult] = useState(null);
  const [flavorLoading, setFlavorLoading] = useState(false);
  const [addedFlavorProducts, setAddedFlavorProducts] = useState({});

  const handleAddFlavorProduct = async (product) => {
    await addToCart(product, 1);
    setAddedFlavorProducts((current) => ({ ...current, [product._id]: true }));
    window.setTimeout(() => {
      setAddedFlavorProducts((current) => ({ ...current, [product._id]: false }));
    }, 1400);
  };

  const selectFeatureTab = (tab) => {
    if (tab !== 'chat' && !isAuthenticated) {
      navigate('/login?redirect=/ai-features');
      return;
    }
    if (tab !== 'chat' && !isCustomer) {
      setActiveTab('chat');
      return;
    }
    setActiveTab(tab);
  };

  const handleEvaluateFlavor = async () => {
    try {
      setFlavorLoading(true);
      const res = await api.post('/ai/flavor', {
        baseFlavor: selectedBase,
        accentFlavor: selectedAccent,
      });
      if (res.data.success) {
        setFlavorResult({
          ...res.data.evaluation,
          recommendations: Array.isArray(res.data.recommendations) ? res.data.recommendations : [],
        });
      }
    } catch (err) {
      console.warn('Flavor evaluation error:', err);
    } finally {
      setFlavorLoading(false);
    }
  };

  // 3. Gift Assistant State
  const [budget, setBudget] = useState(1200);
  const [occasion, setOccasion] = useState('Birthday');
  const [recipient, setRecipient] = useState('Best Friend');
  const [giftResult, setGiftResult] = useState(null);
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftAdded, setGiftAdded] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [customGiftMode, setCustomGiftMode] = useState(false);
  const [customGiftProducts, setCustomGiftProducts] = useState([]);

  const handleCurateGift = async () => {
    try {
      setGiftLoading(true);
      const res = await api.post('/ai/gift', {
        budget,
        occasion,
        recipient,
      });
      if (res.data.success) {
        const result = res.data.giftBox;
        setGiftResult(result);
        setGiftNote(result.greetingCardMessage || '');
        setCustomGiftProducts((result.products || []).map((product) => product._id));
      }
    } catch (err) {
      console.warn('Gift box curation error:', err);
    } finally {
      setGiftLoading(false);
    }
  };

  const handleAddGiftBox = async () => {
    const selectedProducts = customGiftMode
      ? (giftResult?.availableProducts || []).filter((product) => customGiftProducts.includes(product._id))
      : (giftResult?.products || []);
    if (!selectedProducts.length) return;
    const price = selectedProducts.reduce((sum, product) => sum + Number(product.price || 0), 0) + 100;
    await addGiftBoxToCart({
      ...giftResult,
      price,
      products: selectedProducts,
      items: selectedProducts.map((product) => ({
        productId: product._id,
        name: product.name,
        bakeryName: product.bakeryName,
        price: product.price,
        quantity: 1,
        image: product.image,
      })),
      greetingCardMessage: giftNote,
    });
    setGiftAdded(true);
    window.setTimeout(() => setGiftAdded(false), 1600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-sm font-bold uppercase tracking-widest text-lavender-700 dark:text-lavender-300 bg-lavender-100 dark:bg-mocha-800/80 py-1 px-3 rounded-full">
          Sweet AI Intelligence Hub
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-berry-950 dark:text-white">
          Chef Baker’s AI Studio
        </h1>
        <p className="text-sm text-berry-900/75 dark:text-purple-200/80 leading-relaxed">
          Ask our AI master baker anything, discover botanical flavor pairings, or generate a custom gift box tailored to your budget.
        </p>
      </div>

      {/* Feature Selector Tabs */}
      <div className="flex justify-center">
        <div className="bg-lavender-100 dark:bg-mocha-800/80 p-1.5 rounded-full flex flex-wrap gap-1 border border-lavender-200 dark:border-lavender-800">
          <button
            onClick={() => selectFeatureTab('chat')}
            className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-lavender-600 text-white shadow-soft'
                : 'text-berry-900 dark:text-purple-200 hover:bg-lavender-200/70 dark:hover:bg-mocha-700'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Chef Baker Chatbot</span>
          </button>

          {(!isAuthenticated || isCustomer) && (
            <>
              <button
                onClick={() => selectFeatureTab('flavor')}
                className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'flavor'
                    ? 'bg-lavender-600 text-white shadow-soft'
                    : 'text-berry-900 dark:text-purple-200 hover:bg-lavender-200/70 dark:hover:bg-mocha-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Flavor Finder</span>
              </button>

              <button
                onClick={() => selectFeatureTab('gift')}
                className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'gift'
                    ? 'bg-lavender-600 text-white shadow-soft'
                    : 'text-berry-900 dark:text-purple-200 hover:bg-lavender-200/70 dark:hover:bg-mocha-700'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Gift Assistant</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab 1: Chef Baker Chatbot */}
      {activeTab === 'chat' && (
        <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-soft border border-lavender-200 dark:border-lavender-800 max-w-3xl mx-auto space-y-6 animate-pop-in">
          <div className="flex items-center gap-3 pb-4 border-b border-lavender-100 dark:border-lavender-800">
            <div className="w-12 h-12 rounded-2xl bg-lavender-200 dark:bg-mocha-700 flex items-center justify-center text-2xl shadow-xs">
              🧁
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-berry-950 dark:text-white">
                Chef Baker Concierge
              </h3>
              <p className="text-sm text-lavender-700 dark:text-lavender-300">
                Live AI Assistant • Trained on BakeVerse Pâtisserie archives
              </p>
            </div>
          </div>

          {/* Chat message history */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-lavender-200 dark:bg-mocha-700 flex items-center justify-center text-sm shrink-0 mt-1">
                    🧁
                  </div>
                )}
                <div
                  className={`p-4 rounded-3xl max-w-md break-words whitespace-pre-wrap text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-lavender-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-mocha-800 text-berry-900 dark:text-purple-100 rounded-tl-xs border border-lavender-200 dark:border-lavender-700 shadow-card'
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-sm text-lavender-600 dark:text-lavender-300 italic">
                <span className="animate-bounce">🧁</span> Chef Baker is whipping up a response...
              </div>
            )}
          </div>

          {/* Quick Inquiry Pills */}
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-semibold text-lavender-700 dark:text-lavender-300 block">Suggested Sweet Questions:</span>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChat(q)}
                  className="text-xs py-1.5 px-3 rounded-full bg-lavender-50 dark:bg-mocha-800 hover:bg-lavender-100 dark:hover:bg-mocha-700 text-berry-900 dark:text-purple-200 border border-lavender-200 dark:border-lavender-700 transition text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex gap-2 pt-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about flavors, eggless options, timings..."
              className="flex-1 text-sm px-4 py-3 rounded-2xl border border-lavender-200 dark:border-lavender-700 focus:outline-none focus:ring-2 focus:ring-lavender-400 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white placeholder:text-berry-900/40 dark:placeholder:text-purple-300/40"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="py-3 px-6 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white text-sm font-semibold flex items-center gap-2 shadow-soft disabled:opacity-50 transition"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Flavor Finder */}
      {activeTab === 'flavor' && (
        <div className="glass-card rounded-4xl p-6 sm:p-10 shadow-soft border border-lavender-200 dark:border-lavender-800 max-w-3xl mx-auto space-y-8 animate-pop-in">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <h3 className="font-display font-semibold text-2xl text-berry-950 dark:text-white">
              Interactive Flavor Chemistry Evaluator
            </h3>
            <p className="text-sm text-berry-900/70 dark:text-purple-200/70 leading-relaxed">
              Pick two flavors and let our pastry AI evaluate their sensory synergy and recommended pastry format.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-lavender-50/60 dark:bg-mocha-800/60 p-6 rounded-3xl border border-lavender-100 dark:border-lavender-800">
            {/* Base Flavor */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-lavender-300 block">
                1. Select Base Note
              </label>
              <div className="grid grid-cols-2 gap-2">
                {baseFlavors.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBase(b)}
                    className={`p-2.5 rounded-2xl text-xs font-semibold transition text-center ${
                      selectedBase === b
                        ? 'bg-lavender-600 text-white shadow-soft scale-105'
                        : 'bg-white dark:bg-mocha-700 text-berry-900 dark:text-purple-200 border border-lavender-200 dark:border-lavender-700 hover:bg-lavender-100 dark:hover:bg-mocha-600'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Flavor */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-lavender-300 block">
                2. Select Accent Note
              </label>
              <div className="grid grid-cols-2 gap-2">
                {accentFlavors.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAccent(a)}
                    className={`p-2.5 rounded-2xl text-xs font-semibold transition text-center ${
                      selectedAccent === a
                        ? 'bg-purple-700 text-white shadow-soft scale-105'
                        : 'bg-white dark:bg-mocha-700 text-berry-900 dark:text-purple-200 border border-lavender-200 dark:border-lavender-700 hover:bg-lavender-100 dark:hover:bg-mocha-600'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleEvaluateFlavor}
              disabled={flavorLoading}
              className="py-3.5 px-8 rounded-full bg-gradient-to-r from-lavender-600 to-purple-600 text-white font-semibold text-sm shadow-soft hover:shadow-lg transition transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              {flavorLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Evaluate Flavor Synergy</span>
            </button>
          </div>

          {/* Flavor Evaluation Results */}
          {flavorResult && (
            <div className="bg-white dark:bg-mocha-800 rounded-3xl p-6 border border-lavender-200 dark:border-lavender-700 shadow-card space-y-4 animate-pop-in">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-lavender-100 dark:border-lavender-700">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-lavender-600 dark:text-lavender-400">
                    Pairing Analysis: {selectedBase} + {selectedAccent}
                  </span>
                  <h4 className="font-display font-semibold text-xl text-berry-950 dark:text-white mt-0.5">
                    {flavorResult.verdict}
                  </h4>
                </div>

                {/* Score Gauge */}
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 py-1.5 px-3.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-display font-bold text-sm">
                  <span>Harmony Score:</span>
                  <span className="text-base text-emerald-600 dark:text-emerald-400">{flavorResult.harmonyScore}%</span>
                </div>
              </div>

              <p className="text-sm text-berry-900/80 dark:text-purple-200/80 leading-relaxed">
                {flavorResult.notes}
              </p>

              <div className="p-4 rounded-2xl bg-lavender-50 dark:bg-mocha-700/80 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-lavender-300 block">
                    Suggested Bakery Creation
                  </span>
                  <span className="font-display font-semibold text-sm text-berry-950 dark:text-white">
                    {flavorResult.suggestedTreat}
                  </span>
                </div>

                {/* Color Palette Swatches */}
                {flavorResult.palette && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-lavender-700 dark:text-lavender-300 font-semibold mr-1">Palette:</span>
                    {flavorResult.palette.map((hex, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 rounded-full border border-white dark:border-mocha-600 shadow-xs"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-lavender-300">
                    Bakery Matches For Your Taste
                  </span>
                  <p className="text-xs text-berry-900/65 dark:text-purple-200/65 mt-1">
                    Products matched to {selectedBase} and {selectedAccent}.
                  </p>
                </div>
                {flavorResult.recommendations?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {flavorResult.recommendations.map((product) => (
                      <div key={product._id} className="overflow-hidden rounded-2xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-900">
                        {product.image && (
                          <img src={product.image} alt={product.name} className="h-28 w-full object-cover" />
                        )}
                        <div className="p-3 space-y-2">
                          <h5 className="font-display font-semibold text-sm text-berry-950 dark:text-white">{product.name}</h5>
                          <p className="text-[11px] text-lavender-700 dark:text-lavender-300">{product.bakeryName}</p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-berry-950 dark:text-white">₹{Number(product.price).toLocaleString('en-IN')}</p>
                            <button
                              type="button"
                              onClick={() => handleAddFlavorProduct(product)}
                              disabled={product.inStock === false}
                              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                                addedFlavorProducts[product._id]
                                  ? 'bg-emerald-500 text-white'
                                  : product.inStock === false
                                    ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                                    : 'bg-lavender-600 text-white hover:bg-lavender-700'
                              }`}
                            >
                              {addedFlavorProducts[product._id] ? <Check className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                              {addedFlavorProducts[product._id] ? 'Added' : 'Add to cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-lavender-50 dark:bg-mocha-700/70 p-3 text-xs text-berry-900/70 dark:text-purple-200/70">
                    No in-stock menu item matched both flavor notes yet. Ask a partner bakery for a custom pairing.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Gift Box Assistant */}
      {activeTab === 'gift' && (
        <div className="glass-card rounded-4xl p-6 sm:p-10 shadow-soft border border-lavender-200 dark:border-lavender-800 max-w-3xl mx-auto space-y-8 animate-pop-in">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <h3 className="font-display font-semibold text-2xl text-berry-950 dark:text-white">
              Curated Pastry Gift Box Assistant
            </h3>
            <p className="text-sm text-berry-900/70 dark:text-purple-200/70 leading-relaxed">
              Drag the budget slider and select your occasion to compose a personalized, boutique dessert hamper.
            </p>
          </div>

          <div className="space-y-6 bg-lavender-50/60 dark:bg-mocha-800/60 p-6 sm:p-8 rounded-3xl border border-lavender-100 dark:border-lavender-800">
            {/* Occasion & Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-lavender-300 block mb-1.5">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 rounded-2xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-700 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                >
                  <option value="Birthday">Birthday Celebration 🎂</option>
                  <option value="Anniversary">Romantic Anniversary 💖</option>
                  <option value="Housewarming">New Home / Housewarming 🏡</option>
                  <option value="Apology">Sweet Apology 🌸</option>
                  <option value="Just Because">Just Because / Appreciation ✨</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-lavender-300 block mb-1.5">
                  Recipient
                </label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 rounded-2xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-700 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                >
                  <option value="Best Friend">Best Friend</option>
                  <option value="Partner / Spouse">Partner / Spouse</option>
                  <option value="Parents / Family">Parents / Family</option>
                  <option value="Colleague / Mentor">Colleague / Mentor</option>
                </select>
              </div>
            </div>

            {/* Budget Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-berry-950 dark:text-white">
                <span className="uppercase tracking-wider text-lavender-800 dark:text-lavender-300">Target Budget:</span>
                <span className="text-xl font-display text-lavender-700 dark:text-lavender-300 font-bold">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="3500"
                step="100"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-lavender-200 dark:bg-mocha-700 rounded-lg appearance-none cursor-pointer accent-lavender-600"
              />
              <div className="flex justify-between text-xs text-lavender-600 dark:text-lavender-400 font-semibold">
                <span>₹500 (Petite)</span>
                <span>₹1,500 (Artisan Bloom)</span>
                <span>₹3,500 (Luxe Treasury)</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleCurateGift}
              disabled={giftLoading}
              className="py-3.5 px-8 rounded-full bg-gradient-to-r from-lavender-600 to-purple-600 text-white font-semibold text-sm shadow-soft hover:shadow-lg transition transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              {giftLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              <span>Curate Personalized Hamper</span>
            </button>
          </div>

          {/* Gift Result Display */}
          {giftResult && (
            <div className="bg-white dark:bg-mocha-800 rounded-3xl p-6 sm:p-8 border border-lavender-200 dark:border-lavender-700 shadow-card space-y-5 animate-pop-in">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-lavender-600 dark:text-lavender-400">
                    Curated Box Recommendation
                  </span>
                  <h4 className="font-display font-semibold text-2xl text-berry-950 dark:text-white">
                    {giftResult.boxName}
                  </h4>
                  <p className="text-sm text-berry-900/70 dark:text-lavender-200/70 mt-0.5">{giftResult.tagline}</p>
                </div>
                <span className="font-display font-bold text-2xl text-lavender-700 dark:text-lavender-300">
                  ₹{(customGiftMode
                    ? (giftResult.availableProducts || [])
                      .filter((product) => customGiftProducts.includes(product._id))
                      .reduce((sum, product) => sum + Number(product.price || 0), 0) + 100
                    : Number(giftResult.estimatedPrice || 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Items included */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-lavender-300">
                  Included Confections:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-berry-900 dark:text-purple-200">
                  {giftResult.items?.map((item, idx) => (
                    <li key={item.productId || idx} className="flex items-center gap-2 bg-lavender-50 dark:bg-mocha-700 p-2.5 rounded-xl border border-lavender-100 dark:border-lavender-700">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong>{item.quantity}x {item.name}</strong>
                        <span className="block text-xs text-lavender-700 dark:text-lavender-300">
                          {item.bakeryName} · ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-lavender-200 dark:border-lavender-700 bg-lavender-50/60 dark:bg-mocha-700/60 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm text-berry-950 dark:text-white block">Create a custom gift box</span>
                    <span className="text-xs text-berry-900/70 dark:text-purple-200/70">Choose bakery products yourself. Packaging adds ₹100.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomGiftMode((current) => !current)}
                    className="rounded-xl bg-white dark:bg-mocha-800 border border-lavender-200 dark:border-lavender-700 px-3 py-2 text-xs font-bold text-lavender-700 dark:text-lavender-300"
                  >
                    {customGiftMode ? 'Use curated box' : 'Customize'}
                  </button>
                </div>
                {customGiftMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(giftResult.availableProducts || []).map((product) => {
                      const selected = customGiftProducts.includes(product._id);
                      return (
                        <label key={product._id} className="flex items-center gap-2 rounded-xl bg-white dark:bg-mocha-800 p-2 text-xs text-berry-900 dark:text-purple-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => setCustomGiftProducts((current) => (
                              selected
                                ? current.filter((id) => id !== product._id)
                                : [...current, product._id]
                            ))}
                            className="accent-lavender-600"
                          />
                          <span className="flex-1">{product.name}</span>
                          <span className="font-bold">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Presentation & Greeting Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-marshmallow-200/90 dark:bg-mocha-700 border border-lavender-200/60 dark:border-lavender-700 text-sm space-y-1">
                  <span className="font-bold text-lavender-800 dark:text-lavender-300 block">🎁 Boutique Packaging:</span>
                  <p className="text-berry-900/80 dark:text-purple-200/80">{giftResult.presentation}</p>
                </div>

                <div className="p-4 rounded-2xl bg-sakura-100/60 dark:bg-mocha-700 border border-sakura-200 dark:border-lavender-700 text-sm space-y-1">
                  <span className="font-bold text-berry-900 dark:text-purple-100 block">💌 Calligraphy Note Included:</span>
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-sakura-200 dark:border-lavender-700 bg-white/70 dark:bg-mocha-800 p-2 text-sm italic text-berry-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                    aria-label="Edit calligraphy note"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddGiftBox}
                  disabled={giftAdded || (customGiftMode ? customGiftProducts.length === 0 : !giftResult.products?.length)}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition ${
                    giftAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-lavender-600 hover:bg-lavender-700 text-white disabled:opacity-50'
                  }`}
                >
                  {giftAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {giftAdded ? 'Gift Box Added to Cart' : 'Add Curated Gift Box to Cart'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiHubPage;
