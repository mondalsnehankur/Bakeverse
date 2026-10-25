import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, ChefHat, RefreshCw, Truck } from 'lucide-react';
import api from '../services/api';

const statusClass = (status) => status === 'READY_FOR_PICKUP'
  ? 'bg-emerald-100 text-emerald-800'
  : status === 'IN_PREPARATION'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-lavender-100 text-lavender-800';

const StorefrontDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const loadKitchen = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/storefront/orders/kitchen');
      if (response.data.success) setGroups(response.data.orders || []);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Could not load kitchen orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKitchen();
    const timer = setInterval(loadKitchen, 10000);
    return () => clearInterval(timer);
  }, [loadKitchen]);

  const updateItem = async (group, item, status) => {
    try {
      await api.patch(`/storefront/orders/${group.order._id}/items/${item._id}/status`, { status });
      setNotice(status === 'READY_FOR_PICKUP' ? 'Item marked ready. Admin has been notified.' : 'Item moved into preparation.');
      await loadKitchen();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Could not update kitchen item.');
    }
  };

  const inKitchen = useMemo(() => groups.filter((group) => group.items.some((item) => item.itemStatus !== 'READY_FOR_PICKUP')), [groups]);
  const ready = useMemo(() => groups.filter((group) => group.items.some((item) => item.itemStatus === 'READY_FOR_PICKUP')), [groups]);

  const renderGroup = (group) => (
    <article key={group.order._id} className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-lg">Order #{group.order.orderNumber}</h3>
          <p className="text-sm opacity-70">{group.order.customer?.name || 'Customer'} · {group.order.deliverySlot}</p>
          <p className="text-xs opacity-60">{group.order.shippingAddress}</p>
        </div>
        <span className="text-xs font-bold rounded-full bg-purple-100 text-purple-800 px-3 py-1">{group.readyCount}/{group.items.length} ready</span>
      </div>
      <div className="space-y-3">
        {group.items.map((item) => {
          const config = item.cakeConfig || item.customCake3DParams;
          return (
            <div key={item._id} className="rounded-2xl bg-lavender-50 dark:bg-mocha-800 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">{item.quantity}x {item.customName || item.productId?.name || 'Bakery item'}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(item.itemStatus || 'PENDING')}`}>{item.itemStatus || 'PENDING'}</span>
              </div>
              {item.customMessage && <p className="text-sm mt-1">Note: {item.customMessage}</p>}
              {config && <p className="text-xs mt-2 opacity-75">3D cake: {config.tiers || 1} tiers · {config.topperType || config.topperStyle || 'custom topper'} · {config.customText || config.plaqueText || 'No inscription'}</p>}
              {item.giftBox && <p className="text-xs mt-2 opacity-75">Gift box: {item.giftBox.boxName || 'Curated box'} · Note: {item.giftBox.greetingCardMessage || 'No note'}</p>}
              {item.giftBox?.products?.length > 0 && (
                <div className="mt-2 rounded-xl bg-white/70 dark:bg-mocha-900/70 p-3">
                  <p className="text-xs font-bold">Products to prepare from your bakery:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    {item.giftBox.products.map((product, index) => (
                      <li key={`${product.productId || product.name}-${index}`}>• {product.quantity || 1}x {product.name} · ₹{Number(product.price || 0).toLocaleString('en-IN')}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.itemStatus !== 'READY_FOR_PICKUP' && (
                <div className="flex gap-2 mt-3">
                  {item.itemStatus !== 'IN_PREPARATION' && <button onClick={() => updateItem(group, item, 'IN_PREPARATION')} className="rounded-xl border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800">Start Preparation</button>}
                  <button onClick={() => updateItem(group, item, 'READY_FOR_PICKUP')} className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs font-bold"><CheckCircle className="inline w-3.5 h-3.5 mr-1" />Mark as Ready for Pickup</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 p-6 flex items-center justify-between gap-4">
        <div><p className="text-xs uppercase tracking-widest font-bold text-lavender-700">Storefront Kitchen Desk</p><h1 className="font-display font-bold text-3xl">Kitchen Orders & Pickup Desk</h1><p className="text-sm opacity-70 mt-1">Prepare only your bakery’s items and notify Super Admin when they are ready.</p></div>
        <button onClick={loadKitchen} className="rounded-xl border border-lavender-300 px-3 py-2 text-sm font-bold"><RefreshCw className="inline w-4 h-4 mr-1" />Refresh</button>
      </header>
      {notice && <div className="rounded-2xl bg-emerald-50 text-emerald-800 px-4 py-3 text-sm font-semibold">{notice}</div>}
      {loading && <p className="text-sm opacity-70">Loading kitchen queue...</p>}
      <section className="space-y-4"><h2 className="font-display font-bold text-2xl"><ChefHat className="inline w-6 h-6 mr-2" />In Kitchen ({inKitchen.length})</h2>{inKitchen.map(renderGroup)}{!loading && !inKitchen.length && <p className="rounded-2xl border border-dashed p-8 text-center opacity-70">No items need preparation.</p>}</section>
      <section className="space-y-4"><h2 className="font-display font-bold text-2xl"><Truck className="inline w-6 h-6 mr-2" />Ready for Dispatch / Pickup ({ready.length})</h2>{ready.map(renderGroup)}{!loading && !ready.length && <p className="rounded-2xl border border-dashed p-8 text-center opacity-70">No items are ready yet.</p>}</section>
    </div>
  );
};

export default StorefrontDashboard;
