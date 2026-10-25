import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, CheckCircle, RefreshCw, AlertCircle, ToggleLeft, ToggleRight, Clock, Eye, X, Cake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Cake3D from '../components/3d/Cake3D';
import api from '../services/api';

const getBlueprintAnnotations = (params) => {
  if (Array.isArray(params.spatialAnnotations) && params.spatialAnnotations.length >= 3) {
    return params.spatialAnnotations;
  }
  const theme = params.themeName || params.cakeName || 'custom cake';
  return [
    { id: 'top_topper', position: [0, 0, 0], label: 'Top Zone', detail: `Place the ${theme} topper on the top tier.` },
    { id: 'front_plaque', position: [0, 0, 0], label: 'Front Zone', detail: `Apply the ${theme} edible image print to the front plaque.` },
    { id: 'tier_accent', position: [0, 0, 0], label: 'Special Trim / Ribbon', detail: `Add ${theme} ribbon or accent sugar work at the lower tier joint.` },
  ];
};

const StorefrontPage = () => {
  const { user, isStorefront, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected3DCakeOrder, setSelected3DCakeOrder] = useState(null);
  const [accountRequest, setAccountRequest] = useState({ name: '', email: '', phone: '' });
  const [requestMessage, setRequestMessage] = useState('');
  const [productForm, setProductForm] = useState({ name: '', category: 'Cakes', description: '', price: '', image: '', isEggless: false, isVegan: false });
  const [editingProductId, setEditingProductId] = useState(null);
  const [productMessage, setProductMessage] = useState('');

  const vendorBakeryName = user?.bakeryName || 'Sweet Treats Studio';

  useEffect(() => {
    if (!authLoading && !isStorefront) {
      navigate('/login?redirect=/storefront');
      return;
    }

    if (isStorefront) {
      fetchStorefrontData();
      const interval = setInterval(fetchStorefrontData, 10000);
      return () => clearInterval(interval);
    }
  }, [isStorefront, authLoading, vendorBakeryName]);

  const fetchStorefrontData = async () => {
    try {
      setLoading(true);
      const [orderRes, prodRes] = await Promise.all([
        api.get(`/orders?bakery=${encodeURIComponent(vendorBakeryName)}`),
        api.get(`/products?bakery=${encodeURIComponent(vendorBakeryName)}`),
      ]);

      if (orderRes.data.success) setOrders(orderRes.data.orders);
      if (prodRes.data.success) setProducts(prodRes.data.products);
    } catch (err) {
      console.warn('Storefront data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle inStock status
  const handleToggleStock = async (product) => {
    try {
      const res = await api.put(`/products/${product._id}`, {
        inStock: !product.inStock,
      });
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? res.data.product : p))
        );
      }
    } catch (err) {
      alert('Could not update product stock status');
    }
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setProductMessage('');
    try {
      const response = editingProductId
        ? await api.put(`/products/${editingProductId}`, productForm)
        : await api.post('/products', productForm);
      if (response.data.success) {
        setProducts((previous) => editingProductId
          ? previous.map((product) => product._id === editingProductId ? response.data.product : product)
          : [response.data.product, ...previous]);
        setProductForm({ name: '', category: 'Cakes', description: '', price: '', image: '', isEggless: false, isVegan: false });
        setEditingProductId(null);
        setProductMessage(editingProductId ? 'Product updated.' : 'Product added to your bakery.');
      }
    } catch (err) {
      setProductMessage(err.response?.data?.message || 'Could not save product.');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Remove ${product.name} from your bakery menu?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((previous) => previous.filter((item) => item._id !== product._id));
    } catch (err) {
      setProductMessage(err.response?.data?.message || 'Could not remove product.');
    }
  };

  // Advance Order Status
  const handleRequestAccount = async (event) => {
    event.preventDefault();
    setRequestMessage('');
    try {
      await api.post('/auth/storefront-account-requests', accountRequest);
      setAccountRequest({ name: '', email: '', phone: '' });
      setRequestMessage('Account request sent to the super admin for approval.');
    } catch (err) {
      setRequestMessage(err.response?.data?.message || 'Could not submit account request.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-soft border border-lavender-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-lavender-200 flex items-center justify-center text-3xl shadow-xs">
            🏬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl text-berry-950 dark:text-white">
                {vendorBakeryName}
              </h1>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-lavender-200 dark:bg-mocha-700 text-lavender-900 dark:text-lavender-200">
                Storefront Portal
              </span>
            </div>
            <p className="text-sm text-lavender-700 dark:text-lavender-300 mt-0.5">
              Live kitchen order fulfillment & 3D custom cake blueprint synchronization.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to="/storefront/kitchen" className="py-2 px-4 rounded-xl bg-lavender-600 text-white text-sm font-semibold">Open Kitchen Pickup Desk</Link>
          <button onClick={fetchStorefrontData} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-mocha-800 border border-lavender-200 dark:border-lavender-700 text-sm font-semibold text-berry-900 dark:text-white shadow-xs hover:bg-lavender-50 dark:hover:bg-mocha-700 transition">
            <RefreshCw className="w-4 h-4 text-lavender-600" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleRequestAccount} className="lg:col-span-12 glass-card rounded-3xl p-5 border border-lavender-200 dark:border-lavender-800">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="sm:flex-1">
              <label className="text-xs font-bold uppercase tracking-wider">Request another bakery login</label>
              <input required value={accountRequest.name} onChange={(e) => setAccountRequest({ ...accountRequest, name: e.target.value })} placeholder="Staff member name" className="mt-1 w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-700 bg-white dark:bg-mocha-900 text-sm" />
            </div>
            <div className="sm:flex-1">
              <input required type="email" value={accountRequest.email} onChange={(e) => setAccountRequest({ ...accountRequest, email: e.target.value })} placeholder="Staff email" className="w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-700 bg-white dark:bg-mocha-900 text-sm" />
            </div>
            <div className="sm:flex-1">
              <input value={accountRequest.phone} onChange={(e) => setAccountRequest({ ...accountRequest, phone: e.target.value })} placeholder="Phone (optional)" className="w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-700 bg-white dark:bg-mocha-900 text-sm" />
            </div>
            <button type="submit" className="py-2.5 px-4 rounded-xl bg-lavender-600 text-white text-sm font-semibold">Submit Request</button>
          </div>
          {requestMessage && <p className="mt-2 text-xs font-semibold text-lavender-700 dark:text-lavender-300">{requestMessage}</p>}
        </form>
        {/* Left Column: Live Fulfillment Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-berry-950 dark:text-white">
              Kitchen Fulfillment Queue ({orders.length})
            </h3>
            <span className="text-sm text-lavender-700 dark:text-lavender-300 font-medium">Real-time sync</span>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="glass-card rounded-4xl p-12 text-center text-sm text-berry-900/60 dark:text-purple-200/60">
                No active orders in fulfillment queue for {vendorBakeryName}.
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o._id}
                  className="glass-card rounded-3xl p-5 shadow-card border border-lavender-200 dark:border-lavender-800 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-berry-950 dark:text-white">
                          #{o._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${o.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : o.orderStatus === 'OUT FOR DELIVERY'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                              : o.orderStatus === 'BAKING'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}
                        >
                          {o.orderStatus}
                        </span>
                      </div>
                      <p className="text-sm text-berry-900/80 dark:text-purple-200/80 mt-1">
                        <span className="font-semibold">{o.userId?.name || 'Customer'}</span> • {o.deliverySlot}
                      </p>
                      <p className="text-xs text-lavender-700 dark:text-lavender-300">{o.shippingAddress}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-bold text-base text-berry-950">
                        ₹{o.total?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* 3D Custom Cake Inspection Badge */}
                  {o.customCake3DParams && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 dark:from-purple-950/40 via-lavender-50 dark:via-mocha-800/80 to-pink-50 dark:to-mocha-800/60 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl animate-soft-float">🎂</span>
                        <div>
                          <span className="text-xs font-bold text-purple-950 dark:text-purple-200 block">
                            Custom 3D Cake Blueprint Attached
                          </span>
                          <span className="text-xs text-purple-700 dark:text-purple-300">
                            {o.customCake3DParams.tiers || 2} Tiers • "{o.customCake3DParams.customText || 'Celebration'}"
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelected3DCakeOrder(o)}
                        className="py-1.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect 3D Blueprint</span>
                      </button>
                    </div>
                  )}

                  {/* Items summary */}
                  <div className="bg-white/80 dark:bg-mocha-800/80 p-3 rounded-2xl border border-lavender-100 dark:border-lavender-800 text-sm space-y-1">
                    {o.items?.filter((item) => item.isGiftBox).map((item, index) => (
                      <div key={`gift-${index}`} className="mb-2 rounded-xl bg-lavender-50 dark:bg-mocha-700 p-3 text-xs text-berry-900 dark:text-purple-100">
                        <strong>{item.giftBox?.boxName || item.customName || 'Curated Gift Box'}</strong>
                        <div>Packaging: {item.giftBox?.presentation || 'Boutique packaging'}</div>
                        <div>Calligraphy note: “{item.giftBox?.greetingCardMessage || 'No note added'}”</div>
                        <div>{item.giftBox?.products?.length || 0} bakery products included</div>
                      </div>
                    ))}
                    {o.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-berry-900/80 dark:text-purple-200/80">
                        <span>
                          {item.quantity}x {item.isGiftBox ? (item.customName || item.giftBox?.boxName || 'Curated Gift Box') : (item.productId?.name || 'Treat')}
                        </span>
                        <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {o.customMessage && (
                      <div className="pt-1.5 border-t border-lavender-100 dark:border-lavender-700 text-xs text-lavender-800 dark:text-lavender-300 font-medium">
                        Customer Note: "{o.customMessage}"
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Bakery product management */}
        <div className="lg:col-span-5 glass-card rounded-4xl p-6 shadow-soft border border-lavender-200 space-y-4">
          <div>
            <h3 className="font-display font-bold text-xl text-berry-950 dark:text-white">
              Live Showcase Stock Control
            </h3>
            <p className="text-sm text-berry-900/70 dark:text-purple-200/70 mt-0.5">Add, edit, remove, or toggle products for {vendorBakeryName}.</p>
          </div>
          <form onSubmit={handleSaveProduct} className="p-3 rounded-2xl bg-lavender-50 dark:bg-mocha-800 border border-lavender-100 dark:border-lavender-700 space-y-2">
            <input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product name" className="w-full p-2 rounded-lg border border-lavender-200 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="p-2 rounded-lg border border-lavender-200 text-sm">
                {['Cakes', 'Pastries', 'Cupcakes', 'Donuts', 'Breads', 'Cookies', 'Beverages'].map((category) => <option key={category}>{category}</option>)}
              </select>
              <input required type="number" min="0" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="Price (₹)" className="p-2 rounded-lg border border-lavender-200 text-sm" />
            </div>
            <input required value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="Image URL" className="w-full p-2 rounded-lg border border-lavender-200 text-sm" />
            <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Description (optional)" className="w-full p-2 rounded-lg border border-lavender-200 text-sm" rows="2" />
            <div className="flex gap-3 text-xs"><label><input type="checkbox" checked={productForm.isEggless} onChange={(e) => setProductForm({ ...productForm, isEggless: e.target.checked })} /> Eggless</label><label><input type="checkbox" checked={productForm.isVegan} onChange={(e) => setProductForm({ ...productForm, isVegan: e.target.checked })} /> Vegan</label></div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-lavender-600 text-white text-sm font-semibold">{editingProductId ? 'Save Changes' : 'Add Product'}</button>
              {editingProductId && <button type="button" onClick={() => { setEditingProductId(null); setProductForm({ name: '', category: 'Cakes', description: '', price: '', image: '', isEggless: false, isVegan: false }); }} className="px-3 rounded-xl border text-sm">Cancel</button>}
            </div>
            {productMessage && <p className="text-xs font-semibold text-lavender-700">{productMessage}</p>}
          </form>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {products.map((p) => (
              <div
                key={p._id}
                className="p-3.5 rounded-2xl bg-white dark:bg-mocha-800 border border-lavender-200 dark:border-lavender-700 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-berry-950 dark:text-white truncate">{p.name}</h4>
                    <p className="text-xs text-lavender-700 dark:text-lavender-300">₹{p.price?.toLocaleString('en-IN')} • {p.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setEditingProductId(p._id); setProductForm({ name: p.name, category: p.category, description: p.description || '', price: p.price, image: p.image, isEggless: p.isEggless, isVegan: p.isVegan }); }} className="text-xs font-semibold text-lavender-700">Edit</button>
                <button onClick={() => handleDeleteProduct(p)} className="text-xs font-semibold text-red-600">Remove</button>
                <button
                  onClick={() => handleToggleStock(p)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition ${p.inStock
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                >
                  <span>{p.inStock ? 'In Stock' : 'Sold Out'}</span>
                </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Custom Cake Baking Blueprint Modal for Bakery Owner */}
      {selected3DCakeOrder && selected3DCakeOrder.customCake3DParams && (() => {
        const p = selected3DCakeOrder.customCake3DParams;
        // Resolve palette from new structure or legacy flat fields
        const resolvedPalette = p.palette || {
          baseColor: p.tierColor || '#C084FC',
          frostingColor: p.frostingColor || '#FAF5FF',
          dripColor: p.dripColor || '#F472B6',
          accentColor: p.accentColor || '#FFD700',
          standColor: p.standColor || '#FAFAFA',
        };
        const resolvedAnnotations = getBlueprintAnnotations(p);
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card bg-white dark:bg-mocha-900 rounded-4xl max-w-3xl w-full p-6 shadow-2xl border border-lavender-200 dark:border-lavender-800 space-y-5 animate-pop-in my-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-lavender-100 dark:border-lavender-800">
                <div className="flex items-center gap-2">
                  <Cake className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
                  <div>
                    <h3 className="font-display font-bold text-lg text-berry-950 dark:text-white">
                      Open 3D Baking Blueprint
                    </h3>
                    <p className="text-xs text-lavender-700 dark:text-lavender-300">
                      Order #{selected3DCakeOrder._id.slice(-6).toUpperCase()} — {p.themeName || p.cakeName || 'Custom Cake'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected3DCakeOrder(null)}
                  className="p-1.5 rounded-full hover:bg-lavender-100 dark:hover:bg-mocha-700 text-berry-900 dark:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Side-by-side: 3D Canvas + Baker Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 3D Cake Viewer — full palette, topperType, spatialAnnotations */}
                <div className="h-72 rounded-3xl bg-lavender-50/70 dark:bg-mocha-800 border border-lavender-200/60 dark:border-lavender-700 overflow-hidden">
                  <Cake3D
                    tiers={p.tiers || 2}
                    palette={resolvedPalette}
                    themeName={p.themeName || p.cakeName || ''}
                    toppings={p.toppings || { candles: true, cherries: true }}
                    customText={p.customText || p.plaqueText || ''}
                    textColor={p.textColor || '#FFFFFF'}
                    topperType={p.topperType || 'none'}
                    spatialAnnotations={resolvedAnnotations}
                    showSpatialGuides={true}
                    interactive={true}
                    autoRotate={true}
                    className="w-full h-full"
                  />
                </div>

                {/* Baker Specification Checklist */}
                <div className="space-y-3 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-lavender-300">
                    Baker Specification Checklist
                  </p>

                  {/* Color palette */}
                  <div className="p-3 rounded-2xl bg-lavender-50 dark:bg-mocha-800 border border-lavender-100 dark:border-lavender-700 space-y-2">
                    <p className="font-bold text-lavender-800 dark:text-lavender-300">🎨 Color Palette</p>
                    {[
                      { label: 'Base Sponge Color', color: resolvedPalette.baseColor },
                      { label: 'Frosting Color', color: resolvedPalette.frostingColor },
                      { label: 'Drip Glaze Color', color: resolvedPalette.dripColor },
                      { label: 'Accent Color', color: resolvedPalette.accentColor },
                    ].map(({ label, color }) => (
                      <div key={label} className="flex items-center gap-2 text-berry-900/80">
                        <input type="checkbox" className="rounded" readOnly />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span><strong>{label}:</strong> <code className="text-xs bg-gray-100 dark:bg-mocha-800 px-1 rounded">{color}</code></span>
                      </div>
                    ))}
                  </div>

                  {/* Architectural */}
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 space-y-1.5">
                    <p className="font-bold text-purple-800 dark:text-purple-200">📐 Architectural Specs</p>
                    <div className="flex items-center gap-2 text-berry-900/80 dark:text-purple-200/80">
                      <input type="checkbox" className="rounded" readOnly />
                      <span><strong>Tiers:</strong> {p.tiers || 2}</span>
                    </div>
                    <div className="flex items-center gap-2 text-berry-900/80 dark:text-purple-200/80">
                      <input type="checkbox" className="rounded" readOnly />
                      <span><strong>Topper:</strong> {p.topperType || 'none'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-berry-900/80 dark:text-purple-200/80">
                      <input type="checkbox" className="rounded" readOnly />
                      <span><strong>Plaque Inscription:</strong> "{p.plaqueText || p.customText || 'N/A'}"</span>
                    </div>
                  </div>

                  {/* Spatial annotation pins */}
                  {resolvedAnnotations.length > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 space-y-1.5">
                      <p className="font-bold text-amber-800">📍 Decoration Placement Pins</p>
                      {resolvedAnnotations.map((pin, idx) => (
                        <div key={pin.id} className="flex items-start gap-2 text-berry-900/80">
                          <input type="checkbox" className="rounded mt-0.5 shrink-0" readOnly />
                          <div>
                            <span className="font-bold text-amber-900">Pin #{idx + 1} — {pin.label}:</span>{' '}
                            <span>{pin.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flavor notes */}
                  {(p.flavorNotes || p.flavorProfile) && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <p className="font-bold text-emerald-800 mb-1">🍰 Flavor / Construction Notes</p>
                      <p className="text-berry-900/75 italic">{p.flavorNotes || p.flavorProfile}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelected3DCakeOrder(null)}
                  className="py-2 px-5 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs shadow-xs transition"
                >
                  Close Blueprint
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default StorefrontPage;
