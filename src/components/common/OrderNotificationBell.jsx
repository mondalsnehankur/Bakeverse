import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, CheckCircle2, Clock, Truck, ChefHat, PackageCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const OrderNotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchLatestOrder = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success && res.data.orders.length > 0) {
          // Find most recent order that is not yet delivered, or the latest order
          const latest = res.data.orders[0];
          setActiveOrder(latest);
        }
      } catch (err) {
        // silent
      }
    };

    fetchLatestOrder();
    const interval = setInterval(fetchLatestOrder, 10000); // Polling for real-time status progression
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated || !activeOrder) {
    return null;
  }

  const getStatusDetails = (status) => {
    switch (status) {
      case 'PLACED':
        return {
          label: 'Order Placed & Confirmed',
          icon: <Clock className="w-4 h-4 text-amber-500" />,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          desc: 'Your sweet treats are lined up in queue!',
        };
      case 'BAKING':
        return {
          label: 'Currently Baking in Oven 🧁',
          icon: <ChefHat className="w-4 h-4 text-purple-600 animate-bounce" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          desc: 'Fresh artisan aromas are filling our boutique!',
        };
      case 'READY_FOR_PICKUP':
        return {
          label: 'Ready for Pickup',
          icon: <PackageCheck className="w-4 h-4 text-emerald-600" />,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          desc: 'Your order has been prepared and is awaiting final dispatch.',
        };
      case 'OUT FOR DELIVERY':
        return {
          label: 'Out for Express Delivery 🛵',
          icon: <Truck className="w-4 h-4 text-blue-600 animate-pulse" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          desc: 'Our delivery courier is racing towards your door!',
        };
      case 'DELIVERED':
        return {
          label: 'Delivered & Enjoyed ✨',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          desc: 'Delivered fresh! Thank you for choosing BakeVerse.',
        };
      case 'COMPLETED':
        return {
          label: 'Order Completed',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          desc: 'Your order has completed its fulfillment journey.',
        };
      case 'CANCELLED':
      case 'CANCELED':
        return {
          label: 'Order Cancelled',
          icon: <Clock className="w-4 h-4 text-red-600" />,
          color: 'bg-red-100 text-red-800 border-red-200',
          desc: 'This order will not be prepared or delivered.',
        };
      default:
        return {
          label: status,
          icon: <Sparkles className="w-4 h-4 text-purple-500" />,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          desc: 'Order in progress.',
        };
    }
  };

  const currentStatus = String(activeOrder.orderStatus || activeOrder.status || '').toUpperCase();
  const statusInfo = getStatusDetails(currentStatus);
  const isOngoing = !['COMPLETED', 'DELIVERED', 'CANCELLED', 'CANCELED'].includes(currentStatus);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-lavender-100 dark:bg-mocha-800 hover:bg-lavender-200 dark:hover:bg-mocha-700 text-lavender-700 dark:text-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-lavender-400"
        title="Live Order Notifications"
      >
        <Bell className="w-5 h-5" />
        {isOngoing && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-600"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-80 sm:w-92 glass-card rounded-3xl p-5 shadow-xl border border-lavender-200 dark:border-lavender-800 z-50 animate-pop-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-lavender-100 dark:border-lavender-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h4 className="font-display font-bold text-berry-950 dark:text-white text-base">Live Order Alert</h4>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-lavender-200 dark:bg-mocha-700 text-berry-950 dark:text-purple-100">
              #{activeOrder._id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="mt-3.5 space-y-3">
            <div className={`p-3.5 rounded-2xl border ${statusInfo.color} flex items-start gap-3`}>
              <div className="p-2 rounded-xl bg-white dark:bg-mocha-800 shadow-sm mt-0.5">{statusInfo.icon}</div>
              <div>
                <p className="font-bold text-sm">{statusInfo.label}</p>
                <p className="text-xs opacity-90 mt-0.5">{statusInfo.desc}</p>
              </div>
            </div>

            <div className="text-sm font-medium text-lavender-800 dark:text-purple-200 bg-lavender-50/70 dark:bg-mocha-800/80 p-3 rounded-2xl border border-lavender-100 dark:border-lavender-700/60 flex items-center justify-between">
              <span>Slot: {activeOrder.deliverySlot}</span>
              <span className="font-bold text-berry-950 dark:text-white">₹{activeOrder.total?.toLocaleString('en-IN')}</span>
            </div>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-2.5 px-4 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white text-sm font-semibold tracking-wide transition shadow-sm"
            >
              Track Live Order ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderNotificationBell;
