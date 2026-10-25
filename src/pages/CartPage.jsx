import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, CreditCard, Sparkles, X, CheckCircle2, QrCode, Smartphone, Building2, Cake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CartPage = () => {
  const { items, itemCount, subtotal, updateQuantity, updateGiftBoxInCart, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Checkout inputs
  const [shippingAddress, setShippingAddress] = useState(user?.address || '42 Blossom Garden Way, Koramangala, Bengaluru, Karnataka');
  const [deliverySlot, setDeliverySlot] = useState('Morning (9 AM - 12 PM)');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');
  const [customMessage, setCustomMessage] = useState('');

  // Payment modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('pooja@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('789');
  const [isPaying, setIsPaying] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [editingGiftBox, setEditingGiftBox] = useState(null);
  const [giftEditNote, setGiftEditNote] = useState('');
  const [giftEditProducts, setGiftEditProducts] = useState([]);
  const [giftEditError, setGiftEditError] = useState('');

  // Indian tax and delivery rules
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 49;
  const total = subtotal + tax + deliveryFee;

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const openGiftBoxEditor = (item) => {
    setEditingGiftBox(item);
    setGiftEditError('');
    setGiftEditNote(item.giftBox?.greetingCardMessage || '');
    setGiftEditProducts((item.giftBox?.products || []).map((product) => String(product.productId?._id || product.productId || product._id)));
  };

  const saveGiftBox = async () => {
    if (!editingGiftBox) return;
    const availableProducts = editingGiftBox.giftBox?.availableProducts?.length
      ? editingGiftBox.giftBox.availableProducts
      : editingGiftBox.giftBox?.products || [];
    const products = availableProducts.filter((product) =>
      giftEditProducts.includes(String(product.productId?._id || product.productId || product._id))
    );
    if (!products.length) {
      setGiftEditError('Select at least one bakery product.');
      return;
    }
    try {
      await updateGiftBoxInCart(editingGiftBox.productId, {
        ...editingGiftBox.giftBox,
        products: products.map((product) => ({
          _id: product._id || product.productId?._id || product.productId,
          name: product.name,
          bakeryName: product.bakeryName,
          price: Number(product.price || 0),
          image: product.image,
          category: product.category,
          description: product.description,
          isEggless: product.isEggless,
          isVegan: product.isVegan,
        })),
        greetingCardMessage: giftEditNote,
      });
      setEditingGiftBox(null);
    } catch (error) {
      setGiftEditError(error.response?.data?.message || error.message || 'Could not save gift box.');
    }
  };

  const handleCompletePayment = async (e) => {
    e.preventDefault();
    setOrderError('');

    // Phone validation
    const cleanPhone = contactPhone.replace(/[\s-]/g, '');
    if (!cleanPhone.startsWith('+91') && cleanPhone.length < 10) {
      setOrderError('Please provide a valid Indian phone number starting with +91 or 10 digits.');
      return;
    }

    setIsPaying(true);

    try {
      // Detect if any item in cart is a custom 3D cake
      const customItem = items.find((i) => i.customCake3DParams || i.isCustom);
      const customCake3DParams = customItem ? customItem.customCake3DParams : null;
      const detectedBakery = customItem?.bakeryName || items[0]?.bakeryName || 'Sweet Treats Studio';

      const orderPayload = {
        shippingAddress: `${shippingAddress} (Ph: ${contactPhone})`,
        deliverySlot,
        customMessage,
        bakeryName: detectedBakery,
        customCake3DParams,
        // Send cart items
        items: items.map((i) => ({
          productId: i.productId,
          isGiftBox: i.isGiftBox || false,
          giftBox: i.isGiftBox ? { ...i.giftBox, greetingCardMessage: i.giftBox.greetingCardMessage } : undefined,
          isCustom: i.isCustom || false,
          is3DCake: i.is3DCake || false,
          cakeConfig: i.cakeConfig || undefined,
          customCake3DParams: i.customCake3DParams || undefined,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          bakeryName: i.bakeryName,
        })),
      };

      const res = await api.post('/orders', orderPayload);

      if (res.data.success) {
        // Trigger celebratory confetti burst!
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#C084FC', '#F43F5E', '#FDE047', '#38BDF8'],
        });

        clearCart();
        setIsCheckoutModalOpen(false);

        // Redirect to profile to see live order tracking
        setTimeout(() => {
          navigate('/profile');
        }, 1200);
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Could not process order. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-lavender-100 dark:bg-mocha-800 flex items-center justify-center text-5xl mx-auto animate-soft-float">
          🛍️
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-3xl text-berry-950 dark:text-white">
            Your Sweet Bag is Empty
          </h2>
          <p className="text-xs sm:text-sm text-berry-900/70 dark:text-lavender-200/70 max-w-sm mx-auto">
            You haven’t added any artisan cakes or pastries yet. Discover our fresh treats baked each sunrise across premier partner bakeries!
          </p>
        </div>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 py-3 px-8 rounded-full bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-sm shadow-soft transition"
        >
          <span>Browse Fresh Treats</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center sm:text-left">
        <h1 className="font-display font-bold text-3xl text-berry-950 dark:text-white">
          Your Sweet Treat Bag
        </h1>
        <p className="text-sm text-berry-900/70 dark:text-lavender-200/70 mt-1">
          {itemCount} handcrafted {itemCount === 1 ? 'delight' : 'delights'} ready for doorstep delivery across India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="glass-card rounded-3xl p-4 sm:p-5 shadow-card border border-lavender-200 dark:border-lavender-800 flex items-center gap-4 sm:gap-6"
            >
              {item.is3DCake || item.isCustom ? (
                <button
                  type="button"
                  onClick={() => navigate('/bake-cake', { state: { editCake: item } })}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 shadow-xs bg-gradient-to-br from-purple-500 to-pink-400 text-white flex flex-col items-center justify-center gap-1 hover:scale-105 transition"
                  title="Open 3D cake design"
                >
                  <Cake className="w-8 h-8" />
                  <span className="text-[10px] font-bold">OPEN 3D</span>
                </button>
              ) : (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 shadow-xs"
                />
              )}

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lavender-100 dark:bg-mocha-700 text-berry-950 dark:text-lavender-200">
                    {item.bakeryName || 'Sweet Treats Studio'}
                  </span>
                  {item.customCake3DParams && (
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      3D Custom Cake
                    </span>
                  )}
                </div>

                <h3 className="font-display font-semibold text-sm sm:text-base text-berry-950 dark:text-white truncate">
                  {item.name}
                </h3>
                {item.isGiftBox && (
                  <div className="space-y-1">
                    <p className="text-xs text-lavender-700 dark:text-lavender-300">
                      Gift box · {item.giftBox?.presentation || 'Boutique packaging'}
                    </p>
                    <p className="text-xs text-berry-900/70 dark:text-purple-200/70">
                      {item.giftBox?.products?.length || 0} items · ₹100 packaging · Note: {item.giftBox?.greetingCardMessage || 'Not added'}
                    </p>
                    <button
                      type="button"
                      onClick={() => openGiftBoxEditor(item)}
                      className="text-xs font-bold text-lavender-700 dark:text-lavender-300 underline"
                    >
                      View and edit gift box
                    </button>
                  </div>
                )}
                {(item.is3DCake || item.isCustom) && (
                  <button
                    type="button"
                    onClick={() => navigate('/bake-cake', { state: { editCake: item } })}
                    className="text-xs font-bold text-purple-700 dark:text-purple-300 underline"
                  >
                    View and edit 3D cake
                  </button>
                )}

                <p className="font-display font-bold text-sm text-lavender-700 dark:text-lavender-300">
                  ₹{item.price?.toLocaleString('en-IN')}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center border border-lavender-200 dark:border-lavender-700 rounded-xl bg-white dark:bg-mocha-800 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 rounded-lg hover:bg-lavender-50 dark:hover:bg-mocha-700 text-berry-900 dark:text-white transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-berry-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 rounded-lg hover:bg-lavender-50 dark:hover:bg-mocha-700 text-berry-900 dark:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-700 p-1 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              <div className="text-right shrink-0">
                <span className="font-display font-bold text-base text-berry-950 dark:text-white block">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}

          {editingGiftBox && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-mocha-900 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-xl text-berry-950 dark:text-white">Edit {editingGiftBox.name}</h2>
                    <p className="text-xs text-lavender-700 dark:text-lavender-300">Product total + ₹100 packaging</p>
                  </div>
                  <button type="button" onClick={() => setEditingGiftBox(null)} className="p-2 text-berry-900 dark:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(editingGiftBox.giftBox?.availableProducts?.length
                    ? editingGiftBox.giftBox.availableProducts
                    : editingGiftBox.giftBox?.products || []
                  ).map((product) => {
                    const id = String(product.productId?._id || product.productId || product._id);
                    const selected = giftEditProducts.includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 rounded-xl border border-lavender-200 dark:border-lavender-700 p-3 text-xs text-berry-900 dark:text-purple-100">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => setGiftEditProducts((current) => selected ? current.filter((value) => value !== id) : [...current, id])}
                          className="accent-lavender-600"
                        />
                        <span className="flex-1">{product.name}</span>
                        <strong>₹{Number(product.price || 0).toLocaleString('en-IN')}</strong>
                      </label>
                    );
                  })}
                </div>
                <textarea
                  value={giftEditNote}
                  onChange={(event) => setGiftEditNote(event.target.value)}
                  rows={3}
                  placeholder="Write a calligraphy note"
                  className="w-full rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 p-3 text-sm text-berry-900 dark:text-white"
                />
                {giftEditError && <p className="text-xs font-semibold text-red-600">{giftEditError}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-berry-950 dark:text-white">
                    New price: ₹{(
                      (editingGiftBox.giftBox?.availableProducts?.length
                        ? editingGiftBox.giftBox.availableProducts
                        : editingGiftBox.giftBox?.products || []
                      )
                        .filter((product) => giftEditProducts.includes(String(product.productId?._id || product.productId || product._id)))
                        .reduce((sum, product) => sum + Number(product.price || 0), 0) + 100
                    ).toLocaleString('en-IN')}
                  </span>
                  <button type="button" onClick={saveGiftBox} disabled={!giftEditProducts.length} className="rounded-xl bg-lavender-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    Save gift box
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Note */}
          <div className="p-4 rounded-3xl bg-lavender-100/60 dark:bg-mocha-800/80 border border-lavender-200 dark:border-lavender-800 flex items-center gap-3 text-xs text-berry-900/80 dark:text-lavender-200/80">
            <Truck className="w-5 h-5 text-lavender-600 dark:text-lavender-400 shrink-0" />
            <span>
              <strong>Free express delivery</strong> on orders above ₹500! Every order is temperature-controlled to ensure delicate chantilly creams arrive fresh.
            </span>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-4xl p-6 sm:p-8 shadow-soft border border-lavender-200 dark:border-lavender-800 space-y-6">
          <h3 className="font-display font-bold text-xl text-berry-950 dark:text-white pb-3 border-b border-lavender-100 dark:border-lavender-800">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-berry-900/80 dark:text-lavender-200/80">
            <div className="flex justify-between">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-berry-950 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (5%)</span>
              <span className="font-semibold text-berry-950 dark:text-white">₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Local Delivery</span>
              <span className="font-semibold">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-lavender-100 dark:border-lavender-800 flex justify-between items-center text-sm font-bold text-berry-950 dark:text-white">
              <span className="text-base">Total Due</span>
              <span className="font-display text-2xl text-lavender-700 dark:text-lavender-300">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenCheckout}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lavender-600 to-purple-600 hover:from-lavender-700 hover:to-purple-700 text-white font-semibold text-sm tracking-wide shadow-soft hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-lavender-700 dark:text-lavender-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted UPI & Card Payments</span>
          </div>
        </div>
      </div>

      {/* Indian Checkout & Payment Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white dark:bg-mocha-900 rounded-4xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-lavender-200 dark:border-lavender-800 space-y-5 animate-pop-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-lavender-100 dark:border-lavender-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
                <h3 className="font-display font-bold text-lg text-berry-950 dark:text-white">
                  Checkout & Payment
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-lavender-100 dark:hover:bg-mocha-800 text-berry-900 dark:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
                {orderError}
              </div>
            )}

            <form onSubmit={handleCompletePayment} className="space-y-4 text-xs">
              {/* Delivery Address */}
              <div>
                <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">
                  Delivery Address in India
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street, Flat/Building, Landmark, City, State"
                  className="w-full py-2.5 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
              </div>

              {/* Contact Phone (+91) */}
              <div>
                <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">
                  Contact Phone (+91)
                </label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full py-2.5 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
              </div>

              {/* Delivery Slot */}
              <div>
                <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">
                  Preferred Delivery Slot
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                  <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                </select>
              </div>

              {/* Custom Cake Message / Bakery Note */}
              <div>
                <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">
                  Baker's Note / Gift Message (Optional)
                </label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Please include 5 candles & handle with care!"
                  className="w-full py-2.5 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
              </div>

              {/* Payment Method Selector (UPI / Cards / Net Banking) */}
              <div className="pt-2 border-t border-lavender-100 dark:border-lavender-800 space-y-2">
                <label className="font-bold text-berry-900 dark:text-lavender-100 block">
                  Select Payment Method (INR)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                      paymentMethod === 'upi'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'bg-white dark:bg-mocha-800 border-lavender-200 dark:border-lavender-700 text-berry-900 dark:text-lavender-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>UPI / GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                      paymentMethod === 'card'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'bg-white dark:bg-mocha-800 border-lavender-200 dark:border-lavender-700 text-berry-900 dark:text-lavender-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Card / RuPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                      paymentMethod === 'netbanking'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'bg-white dark:bg-mocha-800 border-lavender-200 dark:border-lavender-700 text-berry-900 dark:text-lavender-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* Conditional Payment Details */}
                {paymentMethod === 'upi' && (
                  <div className="p-3 rounded-2xl bg-lavender-50/70 dark:bg-mocha-800 border border-lavender-200 dark:border-lavender-700 space-y-2">
                    <label className="text-sm font-bold text-berry-900 dark:text-lavender-200 block">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full py-2 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-700 text-berry-950 dark:text-white"
                    />
                    <span className="text-xs font-medium text-lavender-700 dark:text-lavender-400 block">
                      Supports Google Pay, PhonePe, Paytm, BHIM UPI
                    </span>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-3 rounded-2xl bg-lavender-50/70 dark:bg-mocha-800 border border-lavender-200 dark:border-lavender-700 space-y-2">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number"
                      className="w-full py-2 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-700 text-berry-950 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full py-2 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-700 text-berry-950 dark:text-white"
                      />
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        className="w-full py-2 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-700 text-berry-950 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="p-3 rounded-2xl bg-lavender-50/70 dark:bg-mocha-800 border border-lavender-200 dark:border-lavender-700">
                    <select className="w-full py-2 px-3 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-700 text-berry-950 dark:text-white">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Submit Payment */}
              <button
                type="submit"
                disabled={isPaying}
                className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs tracking-wide shadow-soft hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isPaying ? 'Processing Payment...' : `Pay ₹${total.toLocaleString('en-IN')} & Place Order`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
