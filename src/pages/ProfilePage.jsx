import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChefHat, PackageCheck, Truck, CheckCircle2, ShoppingBag, RefreshCw, Sparkles, MapPin, Mail, Phone, Calendar, Cake, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Cake3D from '../components/3d/Cake3D';
import api from '../services/api';

const ProfilePage = () => {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart, addGiftBoxToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [viewing3DOrder, setViewing3DOrder] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/profile');
      return;
    }

    if (isAuthenticated) {
      fetchMyOrders();
      // Poll every 8 seconds for real-time status progression
      const interval = setInterval(fetchMyOrders, 8000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, authLoading]);

  const fetchMyOrders = async () => {
    try {
      const authToken = token || localStorage.getItem('bakeverse_token') || localStorage.getItem('token');
      const res = await api.get('/orders/my-orders', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Could not load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handle1ClickReorder = async (order) => {
    if (!order.items || order.items.length === 0) return;

    for (const item of order.items) {
      if (item.isGiftBox && item.giftBox) {
        await addGiftBoxToCart(item.giftBox);
      } else if (item.productId) {
        await addToCart(item.productId, item.quantity);
      }
    }
    navigate('/cart');
  };

  // Customer-facing fulfillment progress, including the bakery pickup handoff.
  const steps = [
    { key: 'PLACED', label: 'Placed', icon: Clock, desc: 'Order confirmed' },
    { key: 'BAKING', label: 'Baking', icon: ChefHat, desc: 'Fresh in the oven' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: PackageCheck, desc: 'Prepared by bakery' },
    { key: 'OUT FOR DELIVERY', label: 'On The Way', icon: Truck, desc: 'Express courier' },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, desc: 'Enjoy every bite' },
  ];

  const getStepIndex = (status) => {
    const normalizedStatus = {
      CONFIRMED: 'PLACED',
      PROCESSING: 'BAKING',
      IN_PREPARATION: 'BAKING',
      READY_FOR_PICKUP: 'READY_FOR_PICKUP',
      SHIPPED: 'OUT FOR DELIVERY',
      OUT_FOR_DELIVERY: 'OUT FOR DELIVERY',
      COMPLETED: 'DELIVERED',
    }[status] || status;
    const idx = steps.findIndex((s) => s.key === normalizedStatus);
    return idx > -1 ? idx : 0;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Profile Summary */}
      <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-soft border border-lavender-200 dark:border-lavender-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-lavender-400 to-sakura-300 text-white flex items-center justify-center font-display font-bold text-2xl shadow-soft">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-display font-bold text-2xl text-berry-950 dark:text-white">
                {user?.name}
              </h1>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-lavender-200 dark:bg-mocha-700 text-berry-950 dark:text-lavender-200">
                {user?.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-lavender-800 dark:text-lavender-300">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-lavender-600" />
                {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-lavender-600" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-center sm:text-right bg-lavender-50/80 dark:bg-mocha-800 p-4 rounded-2xl border border-lavender-100 dark:border-lavender-700 min-w-[140px]">
          <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-lavender-400 block">
            Total Orders
          </span>
          <span className="font-display font-bold text-2xl text-berry-950 dark:text-white">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Orders List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-berry-950 dark:text-white">
            Live Order Status & History
          </h2>
          <button
            onClick={fetchMyOrders}
            className="flex items-center gap-1.5 text-xs font-semibold text-lavender-700 dark:text-lavender-300 hover:text-berry-950 dark:hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loadingOrders ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-3xl p-6 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-4xl p-12 text-center text-sm text-berry-900/60 dark:text-lavender-300/60 space-y-3">
            <span className="text-4xl block">🛍️</span>
            <p>You haven’t placed any sweet orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderStatus = String(order.orderStatus || order.status || '').toUpperCase();
              const isCancelled = orderStatus === 'CANCELLED' || orderStatus === 'CANCELED';
              const currentStepIdx = getStepIndex(orderStatus);

              return (
                <div
                  key={order._id}
                  className="glass-card rounded-4xl p-6 sm:p-8 shadow-card border border-lavender-200 dark:border-lavender-800 space-y-6"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-lavender-100 dark:border-lavender-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-berry-950 dark:text-white">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-lavender-600 dark:text-lavender-400">
                          • {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-lavender-100 dark:bg-mocha-700 text-berry-950 dark:text-lavender-200">
                          {order.bakeryName || 'Sweet Treats Studio'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCancelled ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' : 'bg-lavender-100 dark:bg-mocha-700 text-berry-950 dark:text-lavender-200'}`}>
                          {isCancelled ? 'CANCELLED' : orderStatus || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm text-berry-900/70 dark:text-lavender-300/70 mt-0.5">
                        Delivery Slot: <strong className="text-berry-950 dark:text-white">{order.deliverySlot}</strong>
                      </p>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <span className="text-xs text-lavender-600 dark:text-lavender-400 font-semibold block">Total</span>
                      <span className="font-display font-bold text-xl text-berry-950 dark:text-white">
                        ₹{order.total?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Cancelled orders use a dedicated state instead of the delivery stepper. */}
                  {isCancelled ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                      <X className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Order cancelled</p>
                        <p className="text-xs mt-0.5">This order will not be prepared or delivered.</p>
                      </div>
                    </div>
                  ) : (
                  /* 4-Step Order Progress Stepper */
                  <div className="py-2">
                    <div className="relative">
                      {/* Stepper connecting line */}
                      <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-lavender-200 dark:bg-mocha-700 z-0" />
                      <div
                        className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-gradient-to-r from-purple-600 to-lavender-500 transition-all duration-500 z-0"
                        style={{ width: `${(currentStepIdx / (steps.length - 1)) * 90}%` }}
                      />

                      {/* Step Nodes */}
                      <div className="relative z-10 flex justify-between items-center">
                        {steps.map((step, idx) => {
                          const StepIcon = step.icon;
                          const isCompleted = idx < currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center">
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                  isCompleted || isCurrent
                                    ? 'bg-lavender-600 text-white shadow-soft scale-105'
                                    : 'bg-white dark:bg-mocha-800 border-2 border-lavender-200 dark:border-lavender-700 text-gray-400'
                                }`}
                              >
                                <StepIcon className="w-5 h-5" />
                              </div>
                              <span className={`text-xs font-bold mt-1.5 ${isCurrent ? 'text-lavender-700 dark:text-lavender-300' : 'text-berry-900/80 dark:text-lavender-200/80'}`}>
                                {step.label}
                              </span>
                              <span className="hidden sm:inline text-xs text-berry-900/50 dark:text-lavender-400/50">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* 3D Custom Cake Inspection Button if order has customCake3DParams */}
                  {order.customCake3DParams && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-lavender-50 to-pink-50 dark:from-mocha-800 dark:to-mocha-700 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Cake className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                        <div>
                          <span className="text-xs font-bold text-purple-950 dark:text-purple-200 block">
                            Custom 3D Cake Design Attached
                          </span>
                          <span className="text-xs text-purple-700 dark:text-purple-300">
                            {order.customCake3DParams.tiers || 2} Tiers • "{order.customCake3DParams.customText || 'Celebration'}"
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewing3DOrder(order)}
                        className="py-1.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View My 3D Cake</span>
                      </button>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="bg-white/80 dark:bg-mocha-800/80 rounded-2xl p-4 border border-lavender-100 dark:border-lavender-800 space-y-2 text-sm">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-berry-900/80 dark:text-lavender-200/80">
                        <span className="font-medium">
                          {item.quantity}x {item.isGiftBox ? `${item.customName || item.giftBox?.boxName || 'Curated Gift Box'} (gift box)` : (item.productId?.name || 'Artisan Treat')}
                        </span>
                        <span className="font-bold text-berry-950 dark:text-white">
                          ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    {order.customMessage && (
                      <div className="pt-2 border-t border-lavender-100 dark:border-lavender-700 text-xs text-lavender-800 dark:text-lavender-300 italic">
                        Note: "{order.customMessage}"
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => handle1ClickReorder(order)}
                      className="py-2 px-5 rounded-2xl bg-lavender-100 dark:bg-mocha-700 hover:bg-lavender-600 hover:text-white text-berry-950 dark:text-white font-semibold text-sm transition"
                    >
                      Reorder Treats
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3D Cake Viewer Modal for Customer */}
      {viewing3DOrder && viewing3DOrder.customCake3DParams && (() => {
        const p = viewing3DOrder.customCake3DParams;
        const resolvedPalette = p.palette || {
          baseColor: p.tierColor || '#C084FC',
          frostingColor: p.frostingColor || '#FAF5FF',
          dripColor: p.dripColor || '#F472B6',
          accentColor: '#FFD700',
          standColor: '#FAFAFA',
        };
        const resolvedAnnotations = Array.isArray(p.spatialAnnotations) ? p.spatialAnnotations : [];
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card bg-white dark:bg-mocha-900 rounded-4xl max-w-xl w-full p-6 shadow-2xl border border-lavender-200 dark:border-lavender-800 space-y-4 animate-pop-in">
              <div className="flex items-center justify-between pb-3 border-b border-lavender-100 dark:border-lavender-800">
                <div className="flex items-center gap-2">
                  <Cake className="w-5 h-5 text-lavender-600" />
                  <h3 className="font-display font-bold text-lg text-berry-950 dark:text-white">
                    {p.themeName || p.cakeName || 'Your Custom 3D Cake Model'}
                  </h3>
                </div>
                <button
                  onClick={() => setViewing3DOrder(null)}
                  className="p-1.5 rounded-full hover:bg-lavender-100 dark:hover:bg-mocha-800 text-berry-900 dark:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full h-80 rounded-3xl bg-lavender-50/70 dark:bg-mocha-800 border border-lavender-200 dark:border-lavender-700 overflow-hidden flex items-center justify-center">
                <Cake3D
                  tiers={p.tiers || 2}
                  palette={resolvedPalette}
                  topperType={p.topperType || 'none'}
                  toppings={p.toppings || { candles: true, cherries: true, sprinkles: true }}
                  customText={p.customText || p.plaqueText || ''}
                  textColor={p.textColor || '#FFFFFF'}
                  spatialAnnotations={resolvedAnnotations}
                  showSpatialGuides={true}
                  interactive={true}
                  autoRotate={true}
                  className="w-full h-full"
                />
              </div>

              <div className="p-3 rounded-2xl bg-lavender-50 dark:bg-mocha-800 text-sm text-berry-900/80 dark:text-lavender-200 space-y-1">
                <p><strong>Theme / Concept:</strong> {p.themeName || p.cakeName || 'Custom Celebration'}</p>
                <p><strong>Baker Kitchen:</strong> {viewing3DOrder.bakeryName}</p>
                <p><strong>Topper:</strong> {p.topperType || 'Standard'}</p>
                {p.customText && <p><strong>Plaque Inscription:</strong> "{p.customText}"</p>}
                {(p.flavorNotes || p.flavorProfile) && (
                  <p className="italic text-berry-900/70 dark:text-lavender-300">
                    <strong>Flavor:</strong> {p.flavorNotes || p.flavorProfile}
                  </p>
                )}
              </div>

              <div className="text-right">
                <button
                  onClick={() => setViewing3DOrder(null)}
                  className="py-2 px-5 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-sm shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProfilePage;
