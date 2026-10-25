import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, 
  ShoppingBag, 
  Cake, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  Store, 
  CheckCircle, 
  RefreshCw, 
  X, 
  AlertCircle,
  Eye,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Cake3D from '../components/3d/Cake3D';

const PREMIER_BAKERIES = [
  'Sweet Treats Studio',
  'Artisan Crust',
  'Pastry Palace',
];

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalUsers: 0,
  });

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [storefronts, setStorefronts] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'accounts' | 'users'

  // Inspect 3D Cake Modal state
  const [inspectingCake, setInspectingCake] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');

  // Product Add / Edit Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Cakes',
    bakeryName: 'Sweet Treats Studio',
    price: '',
    image: '',
    description: '',
    isEggless: true,
    isVegan: false,
    inStock: true,
  });
  const [productError, setProductError] = useState('');

  // Account Provisioning Form state
  const [accountType, setAccountType] = useState('storefront'); // 'storefront' | 'admin'
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    bakeryName: 'Sweet Treats Studio',
    bakeryId: '',
  });
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }

    if (isAdmin) {
      fetchAllAdminData();
    }
  }, [isAdmin, authLoading]);

  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [metricRes, orderRes, prodRes, storeRes, usersRes, requestRes, bakeryRes] = await Promise.all([
        api.get('/orders/metrics'),
        api.get('/orders'),
        api.get('/products'),
        api.get('/auth/storefronts'),
        api.get('/auth/users'),
        api.get('/auth/storefront-account-requests'),
        api.get('/auth/bakeries'),
      ]);

      if (metricRes.data.success) setMetrics(metricRes.data.metrics);
      if (orderRes.data.success) setOrders(orderRes.data.orders);
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (storeRes.data.success) setStorefronts(storeRes.data.storefronts);
      if (usersRes.data.success) setAllUsers(usersRes.data.users);
      if (requestRes.data.success) setAccountRequests(requestRes.data.requests);
      if (bakeryRes.data.success) setBakeries(bakeryRes.data.bakeries);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAccountRequest = async (request, decision) => {
    const password = decision === 'approve' ? window.prompt('Set a temporary password (minimum 6 characters):') : '';
    if (decision === 'approve' && !password) return;
    try {
      await api.put(`/auth/storefront-account-requests/${request._id}`, { decision, password });
      setAccountRequests((current) => current.map((item) => (
        item._id === request._id ? { ...item, status: decision === 'approve' ? 'APPROVED' : 'REJECTED' } : item
      )));
      if (decision === 'approve') {
        const storeRes = await api.get('/auth/storefronts');
        if (storeRes.data.success) setStorefronts(storeRes.data.storefronts);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not review account request.');
    }
  };

  const handleDeactivateBakery = async (bakery) => {
    if (!window.confirm(`Deactivate ${bakery.name} and all its storefront accounts?`)) return;
    try {
      await api.delete(`/auth/bakeries/${bakery._id}`);
      setBakeries((current) => current.map((item) => item._id === bakery._id ? { ...item, active: false } : item));
      setStorefronts((current) => current.map((item) => item.bakeryId?._id === bakery._id ? { ...item, active: false } : item));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not deactivate bakery.');
    }
  };

  // Advance Order Status along 4 steps
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order record?')) return;
    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        // Refresh metrics after deletion
        const metricRes = await api.get('/orders/metrics');
        if (metricRes.data.success) setMetrics(metricRes.data.metrics);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete order');
    }
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Cakes',
      bakeryName: 'Sweet Treats Studio',
      price: '',
      image: '',
      description: '',
      isEggless: true,
      isVegan: false,
      inStock: true,
    });
    setProductError('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      bakeryName: prod.bakeryName || 'Sweet Treats Studio',
      price: prod.price,
      image: prod.image,
      description: prod.description,
      isEggless: prod.isEggless,
      isVegan: prod.isVegan,
      inStock: prod.inStock,
    });
    setProductError('');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProductError('');

    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, productForm);
        if (res.data.success) {
          setProducts((prev) =>
            prev.map((p) => (p._id === editingProduct._id ? res.data.product : p))
          );
          setIsProductModalOpen(false);
        }
      } else {
        const res = await api.post('/products', productForm);
        if (res.data.success) {
          setProducts((prev) => [res.data.product, ...prev]);
          setIsProductModalOpen(false);
        }
      }
    } catch (err) {
      setProductError(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this treat from the catalog?')) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      alert('Could not delete product');
    }
  };

  // Provision Account (Admin or Storefront)
  const handleProvisionAccount = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    try {
      const endpoint = accountType === 'admin' ? '/auth/create-admin' : '/auth/create-storefront';
      const res = await api.post(endpoint, accountForm);
      if (res.data.success) {
        setAccountSuccess(
          `${accountType === 'admin' ? 'Administrator' : 'Storefront vendor'} "${res.data.user.name}" provisioned successfully!`
        );
        setAccountForm({
          name: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          bakeryName: 'Sweet Treats Studio',
          bakeryId: '',
        });
        
        // Refresh lists
        const [storeRes, usersRes] = await Promise.all([
          api.get('/auth/storefronts'),
          api.get('/auth/users'),
        ]);
        if (storeRes.data.success) setStorefronts(storeRes.data.storefronts);
        if (usersRes.data.success) setAllUsers(usersRes.data.users);
      }
    } catch (err) {
      setAccountError(err.response?.data?.message || 'Failed to provision account.');
    }
  };

  const nextStatusMap = {
    'PLACED': 'BAKING',
    'BAKING': 'OUT FOR DELIVERY',
    'OUT FOR DELIVERY': 'DELIVERED',
  };

  const visibleOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .filter((order) => {
      if (orderFilter === 'active') return order.orderStatus !== 'DELIVERED';
      if (orderFilter === 'completed') return order.orderStatus === 'DELIVERED';
      return true;
    });

  const getGiftBoxProducts = (order) => order.items
    ?.filter((item) => item.isGiftBox)
    .flatMap((item) => item.giftBox?.products || []) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1.5 border border-purple-200 dark:border-purple-800/40">
              <Shield className="w-3.5 h-3.5 text-lavender-600 dark:text-lavender-400" />
              Master Administrator
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-berry-950 dark:text-mocha-50 mt-1">
            BakeVerse Command Center
          </h1>
          <p className="text-xs sm:text-sm text-lavender-700 dark:text-mocha-300 mt-0.5">
            Multi-Bakery Governance, Live Order Tracking & Account Provisioning
          </p>
        </div>

        <button
          onClick={fetchAllAdminData}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 text-xs font-semibold text-berry-900 dark:text-mocha-100 shadow-xs hover:bg-lavender-50 dark:hover:bg-mocha-800 transition"
        >
          <RefreshCw className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards (In Indian Rupees ₹) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-3xl p-6 shadow-card border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-mocha-300 block">
              Total Marketplace Revenue
            </span>
            <span className="font-display font-bold text-3xl text-berry-950 dark:text-mocha-50 mt-1 block">
              ₹{metrics.totalRevenue ? Number(metrics.totalRevenue).toLocaleString('en-IN') : '0'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
            ₹
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 shadow-card border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-mocha-300 block">
              Total Orders Processed
            </span>
            <span className="font-display font-bold text-3xl text-berry-950 dark:text-mocha-50 mt-1 block">
              {metrics.totalOrders}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-lavender-200 dark:bg-mocha-800 text-lavender-800 dark:text-lavender-300 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 shadow-card border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-mocha-300 block">
              Active Catalog Treats
            </span>
            <span className="font-display font-bold text-3xl text-berry-950 dark:text-mocha-50 mt-1 block">
              {metrics.activeProducts}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center justify-center">
            <Cake className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 shadow-card border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-mocha-300 block">
              Registered Accounts
            </span>
            <span className="font-display font-bold text-3xl text-berry-950 dark:text-mocha-50 mt-1 block">
              {allUsers.length || metrics.totalUsers}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 flex items-center justify-center">
            <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border border-lavender-200 dark:border-mocha-800 rounded-3xl p-3 flex flex-col lg:w-72 gap-2 shadow-xs bg-white/40 dark:bg-mocha-900/30">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 rounded-xl text-left text-sm font-display font-semibold transition ${
            activeTab === 'orders'
              ? 'border-lavender-600 dark:border-lavender-400 text-lavender-700 dark:text-lavender-300'
              : 'border-transparent text-berry-900/60 dark:text-mocha-400 hover:text-berry-900 dark:hover:text-mocha-200'
          }`}
        >
          Live Order Advancement ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-4 rounded-xl text-left text-sm font-display font-semibold transition ${
            activeTab === 'products'
              ? 'border-lavender-600 dark:border-lavender-400 text-lavender-700 dark:text-lavender-300'
              : 'border-transparent text-berry-900/60 dark:text-mocha-400 hover:text-berry-900 dark:hover:text-mocha-200'
          }`}
        >
          Product Catalog Manager ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`py-3 px-4 rounded-xl text-left text-sm font-display font-semibold transition ${
            activeTab === 'accounts'
              ? 'border-lavender-600 dark:border-lavender-400 text-lavender-700 dark:text-lavender-300'
              : 'border-transparent text-berry-900/60 dark:text-mocha-400 hover:text-berry-900 dark:hover:text-mocha-200'
          }`}
        >
          Account Provisioning (Admin & Storefronts)
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 rounded-xl text-left text-sm font-display font-semibold transition ${
            activeTab === 'users'
              ? 'border-lavender-600 dark:border-lavender-400 text-lavender-700 dark:text-lavender-300'
              : 'border-transparent text-berry-900/60 dark:text-mocha-400 hover:text-berry-900 dark:hover:text-mocha-200'
          }`}
        >
          All Users Directory ({allUsers.length})
        </button>
      </div>

      {/* Tab 1: Live Orders & History */}
      {activeTab === 'orders' && (
        <div className="glass-card rounded-4xl p-6 shadow-soft border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 overflow-x-auto">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {[
              ['all', 'All Orders'],
              ['active', 'Active / In Progress'],
              ['completed', 'Completed / Delivered'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setOrderFilter(value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold ${
                  orderFilter === value
                    ? 'bg-lavender-600 text-white'
                    : 'bg-lavender-100 dark:bg-mocha-800 text-berry-900 dark:text-mocha-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-lavender-100 dark:border-mocha-800 text-lavender-700 dark:text-mocha-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Bakery Partner</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Delivery Window</th>
                <th className="py-3 px-4">Total (INR)</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-center">3D Cake</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lavender-100 dark:divide-mocha-800">
              {visibleOrders.map((o) => (
                <tr key={o._id} className="hover:bg-lavender-50/50 dark:hover:bg-mocha-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-berry-950 dark:text-mocha-100">
                    #{o._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-lavender-100 dark:bg-mocha-800 text-berry-900 dark:text-mocha-200">
                      {o.bakeryName || 'Sweet Treats Studio'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-berry-950 dark:text-mocha-100">{o.userId?.name || 'Guest'}</p>
                    <p className="text-xs text-lavender-700 dark:text-mocha-400">{o.userId?.email || o.shippingAddress}</p>
                  </td>
                  <td className="py-3.5 px-4 text-berry-900/80 dark:text-mocha-300">{o.deliverySlot}</td>
                  <td className="py-3.5 px-4 font-bold text-berry-950 dark:text-mocha-100">₹{o.total?.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`py-1 px-2.5 rounded-full font-bold text-xs ${
                        o.orderStatus === 'DELIVERED'
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
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {o.customCake3DParams ? (
                      <button
                        onClick={() => setInspectingCake(o.customCake3DParams)}
                        className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition inline-flex items-center gap-1 text-xs font-bold"
                        title="View 3D Cake"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>3D View</span>
                      </button>
                    ) : (
                      <span className="text-xs text-berry-900/40 dark:text-mocha-500">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {o.items?.some((item) => item.isGiftBox) && (
                      <span className="mr-2 inline-flex rounded-full bg-lavender-100 dark:bg-mocha-800 px-2 py-1 text-xs font-bold text-lavender-800 dark:text-lavender-300" title="Includes packaging and editable calligraphy note">
                        Gift Box
                      </span>
                    )}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="py-1.5 px-3 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 font-semibold text-xs"
                      >
                        View Full Details &amp; Bill
                      </button>
                      {nextStatusMap[o.orderStatus] ? (
                        <button
                          onClick={() => handleUpdateOrderStatus(o._id, nextStatusMap[o.orderStatus])}
                          className="py-1.5 px-3 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs transition shadow-xs"
                        >
                          ➔ {nextStatusMap[o.orderStatus]}
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Done
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteOrder(o._id)}
                        className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition"
                        title="Delete Order Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Product Inventory Manager with Multi-Bakery & INR */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-display font-bold text-xl text-berry-950 dark:text-mocha-50">
                Marketplace Confection Catalog
              </h3>
              <p className="text-xs text-lavender-700 dark:text-mocha-400">
                Manage treats across all affiliated bakeries with real-time stock and INR pricing.
              </p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="py-2.5 px-5 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white text-xs font-semibold flex items-center gap-2 shadow-soft transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Confection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p._id}
                className="bg-white dark:bg-mocha-900 rounded-3xl p-4 border border-lavender-200 dark:border-mocha-800 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-lavender-50 dark:bg-mocha-800 mb-3">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-xs font-bold uppercase bg-white/90 dark:bg-mocha-900/90 text-berry-950 dark:text-mocha-100 py-0.5 px-2 rounded-full">
                      {p.category}
                    </span>
                    <span className="absolute bottom-2 left-2 text-xs font-semibold bg-lavender-900/80 text-white py-0.5 px-2 rounded-full backdrop-blur-xs">
                      {p.bakeryName || 'Sweet Treats Studio'}
                    </span>
                    {!p.inStock && (
                      <span className="absolute top-2 right-2 text-xs font-bold uppercase bg-red-500 text-white py-0.5 px-2 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-semibold text-base text-berry-950 dark:text-mocha-50 line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-xs text-lavender-700 dark:text-lavender-400 mt-0.5 font-bold">
                    ₹{p.price?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-berry-900/70 dark:text-mocha-300 mt-1 line-clamp-2">{p.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-lavender-100 dark:border-mocha-800 flex items-center justify-between">
                  <div className="flex gap-1.5 text-xs">
                    {p.isEggless && <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Eggless</span>}
                    {p.isVegan && <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">Vegan</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      className="p-2 rounded-xl bg-lavender-100 dark:bg-mocha-800 hover:bg-lavender-200 text-berry-900 dark:text-mocha-100 transition"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Account Provisioning (Both Admin & Storefront) */}
      {activeTab === 'accounts' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-5 border border-lavender-200 dark:border-mocha-800">
              <h3 className="font-display font-semibold text-lg mb-3">Bakery Partners</h3>
              <div className="space-y-2">
                {bakeries.map((bakery) => (
                  <div key={bakery._id} className="flex items-center justify-between rounded-xl bg-lavender-50 dark:bg-mocha-800 p-3 text-sm">
                    <div>
                      <span className="font-semibold block">{bakery.name}</span>
                      <span className="text-xs opacity-70">
                        {storefronts.find((storefront) => storefront.bakeryId?._id === bakery._id)?.email || 'No primary storefront'} · {products.filter((product) => product.bakeryName === bakery.name).length} products
                      </span>
                    </div>
                    {bakery.active ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('accounts');
                            setAccountType('storefront');
                            setAccountForm((current) => ({ ...current, bakeryId: bakery._id, bakeryName: bakery.name }));
                          }}
                          className="text-xs font-bold text-lavender-700"
                        >
                          Provision Sub-Account
                        </button>
                        <button onClick={() => handleDeactivateBakery(bakery)} className="text-xs font-bold text-red-600">Deactivate</button>
                      </div>
                    ) : <span className="text-xs font-bold text-red-600">Inactive</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-3xl p-5 border border-lavender-200 dark:border-mocha-800">
              <h3 className="font-display font-semibold text-lg mb-3">Pending Storefront Requests</h3>
              <div className="space-y-2">
                {accountRequests.filter((request) => request.status === 'PENDING').map((request) => (
                  <div key={request._id} className="rounded-xl bg-lavender-50 dark:bg-mocha-800 p-3 text-sm">
                    <p className="font-semibold">{request.name} · {request.bakeryId?.name}</p>
                    <p className="text-xs opacity-75">{request.email}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleReviewAccountRequest(request, 'approve')} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">Approve</button>
                      <button onClick={() => handleReviewAccountRequest(request, 'reject')} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold">Reject</button>
                    </div>
                  </div>
                ))}
                {!accountRequests.some((request) => request.status === 'PENDING') && <p className="text-sm opacity-60">No pending requests.</p>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Provisioning Form (6 cols) */}
          <form
            onSubmit={handleProvisionAccount}
            className="lg:col-span-6 glass-card rounded-4xl p-6 sm:p-8 shadow-soft border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-lavender-100 dark:border-mocha-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
                <h3 className="font-display font-semibold text-lg text-berry-950 dark:text-mocha-50">
                  Provision Platform Account
                </h3>
              </div>

              {/* Toggle Admin vs Storefront */}
              <div className="flex rounded-xl bg-lavender-100 dark:bg-mocha-800 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setAccountType('storefront')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    accountType === 'storefront'
                      ? 'bg-white dark:bg-mocha-900 text-berry-950 dark:text-mocha-100 shadow-xs'
                      : 'text-berry-900/60 dark:text-mocha-400'
                  }`}
                >
                  Storefront
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('admin')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    accountType === 'admin'
                      ? 'bg-white dark:bg-mocha-900 text-berry-950 dark:text-mocha-100 shadow-xs'
                      : 'text-berry-900/60 dark:text-mocha-400'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {accountSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                {accountSuccess}
              </div>
            )}
            {accountError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
                {accountError}
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-mocha-300 block mb-1">
                {accountType === 'storefront' ? 'Storefront / Bakery Name' : 'Administrator Name'}
              </label>
              <input
                type="text"
                required
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                placeholder={accountType === 'storefront' ? 'e.g. Sweet Treats Studio' : 'e.g. Operations Manager'}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-900 text-berry-950 dark:text-mocha-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-mocha-300 block mb-1">
                Email Address (Login ID)
              </label>
              <input
                type="email"
                required
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                placeholder={accountType === 'storefront' ? 'vendor@bakeverse.com' : 'admin2@bakeverse.com'}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-900 text-berry-950 dark:text-mocha-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-mocha-300 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={accountForm.password}
                onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-900 text-berry-950 dark:text-mocha-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-mocha-300 block mb-1">
                Contact Phone (+91)
              </label>
              <input
                type="text"
                value={accountForm.phone}
                onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-900 text-berry-950 dark:text-mocha-100"
              />
            </div>

            {accountType === 'storefront' && (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-mocha-300 block mb-1">
                    Bakery Entity Affiliation
                  </label>
                  <select
                    value={accountForm.bakeryName}
                    onChange={(e) => {
                      const bakeryName = e.target.value;
                      const bakery = bakeries.find((item) => item.name === bakeryName);
                      setAccountForm({ ...accountForm, bakeryName, bakeryId: bakery?._id || '' });
                    }}
                    className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-900 text-berry-950 dark:text-mocha-100"
                  >
                    <option value="">Create new partner bakery</option>
                    {bakeries.filter((bakery) => bakery.active).map((bakery) => (
                      <option key={bakery._id} value={bakery.name}>{bakery.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-lavender-800 dark:text-mocha-300 block mb-1">
                    Physical Bakery Address
                  </label>
                  <input
                    type="text"
                    value={accountForm.address}
                    onChange={(e) => setAccountForm({ ...accountForm, address: e.target.value })}
                    placeholder="e.g. 104 MG Road, Brigade Junction, Bengaluru"
                    className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-900 text-berry-950 dark:text-mocha-100"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs tracking-wide shadow-soft transition"
            >
              {accountType === 'admin' ? 'Create Administrator Account' : 'Provision Storefront Account'}
            </button>
          </form>

          {/* Active Storefront Vendors Overview (6 cols) */}
          <div className="lg:col-span-6 glass-card rounded-4xl p-6 sm:p-8 shadow-soft border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 space-y-4">
            <h3 className="font-display font-semibold text-lg text-berry-950 dark:text-mocha-50 pb-3 border-b border-lavender-100 dark:border-mocha-800">
              Active Storefront Vendors ({storefronts.length})
            </h3>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {storefronts.map((s) => (
                <div
                  key={s._id}
                  className="p-4 rounded-2xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-berry-950 dark:text-mocha-100">{s.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                        {s.bakeryName || 'Sweet Treats Studio'}
                      </span>
                    </div>
                    <p className="text-sm text-lavender-700 dark:text-mocha-400">{s.email}</p>
                    <p className="text-xs text-berry-900/60 dark:text-mocha-400">{s.phone || '+91 Contact'} • {s.address || 'Bengaluru, India'}</p>
                  </div>
                  <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Tab 4: All Users Directory */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-4xl p-6 shadow-soft border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 overflow-x-auto">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-lavender-100 dark:border-mocha-800">
            <div>
              <h3 className="font-display font-bold text-lg text-berry-950 dark:text-mocha-50">
                Registered Platform Accounts
              </h3>
              <p className="text-xs text-lavender-700 dark:text-mocha-400">
                All registered customers, storefront partners, and super administrators in the system.
              </p>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-lavender-100 dark:border-mocha-800 text-lavender-700 dark:text-mocha-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Bakery Link</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lavender-100 dark:divide-mocha-800">
              {allUsers.map((u) => (
                <tr key={u._id} className="hover:bg-lavender-50/50 dark:hover:bg-mocha-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-berry-950 dark:text-mocha-100">{u.name}</td>
                  <td className="py-3.5 px-4 text-berry-900/80 dark:text-mocha-300">{u.email}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-berry-900/70 dark:text-mocha-400">{u.phone || '—'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                          : u.role === 'storefront'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-lavender-100 dark:bg-mocha-800 text-berry-900 dark:text-mocha-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-berry-900/70 dark:text-mocha-400">
                    {u.bakeryName ? (
                      <span className="font-semibold text-berry-950 dark:text-mocha-200">{u.bakeryName}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-lavender-700 dark:text-mocha-500 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-berry-950/40 backdrop-blur-sm animate-pop-in">
          <div
            className="bg-white dark:bg-mocha-900 rounded-4xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-lavender-200 dark:border-mocha-800 p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-lavender-100 dark:bg-mocha-800 hover:bg-lavender-200 text-berry-900 dark:text-mocha-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-2xl text-berry-950 dark:text-mocha-50 mb-4">
              {editingProduct ? 'Edit Confection' : 'Create New Confection'}
            </h3>

            {productError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium mb-4">
                {productError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-berry-900 dark:text-mocha-200 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Lavender Blossom Cake"
                  className="w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-berry-900 dark:text-mocha-200 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-100"
                  >
                    {['Cakes', 'Pastries', 'Cupcakes', 'Donuts', 'Breads', 'Cookies', 'Beverages'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-berry-900 dark:text-mocha-200 block mb-1">Price (₹ / INR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="450"
                    className="w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-berry-900 dark:text-mocha-200 block mb-1">Bakery Partner</label>
                <select
                  value={productForm.bakeryName}
                  onChange={(e) => setProductForm({ ...productForm, bakeryName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-100"
                >
                  {PREMIER_BAKERIES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-berry-900 dark:text-mocha-200 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-100"
                />
              </div>

              <div>
                <label className="font-bold text-berry-900 dark:text-mocha-200 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Rich artisan sponge with botanicals..."
                  className="w-full p-2.5 rounded-xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-100"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer dark:text-mocha-200">
                  <input
                    type="checkbox"
                    checked={productForm.isEggless}
                    onChange={(e) => setProductForm({ ...productForm, isEggless: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>100% Eggless</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer dark:text-mocha-200">
                  <input
                    type="checkbox"
                    checked={productForm.isVegan}
                    onChange={(e) => setProductForm({ ...productForm, isVegan: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span>Vegan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer dark:text-mocha-200">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="rounded text-lavender-600"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3 px-6 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs tracking-wide shadow-soft transition"
              >
                {editingProduct ? 'Save Changes' : 'Create Confection'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-berry-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-mocha-900 rounded-4xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-lavender-200 dark:border-mocha-800 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-lavender-300">Order inspection</span>
                <h2 className="font-display font-bold text-2xl text-berry-950 dark:text-white">
                  #{selectedOrder._id.slice(-6).toUpperCase()} · {selectedOrder.userId?.name || 'Customer'}
                </h2>
                <p className="text-xs text-lavender-700 dark:text-lavender-300">{selectedOrder.bakeryName} · {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'Date unavailable'}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl bg-lavender-100 dark:bg-mocha-800"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                ['Base subtotal', selectedOrder.subtotal],
                ['Delivery fee', selectedOrder.deliveryFee || 0],
                ['Taxes', selectedOrder.tax],
                ['Total price', selectedOrder.total],
              ].map(([label, amount]) => (
                <div key={label} className="rounded-2xl bg-lavender-50 dark:bg-mocha-800 p-3">
                  <span className="block text-xs font-bold uppercase text-lavender-700 dark:text-mocha-400">{label}</span>
                  <span className="font-display font-bold text-lg">₹{Number(amount || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <p className="mb-6 text-sm font-semibold">
              Payment: <span className={selectedOrder.paymentStatus === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}>{selectedOrder.paymentStatus === 'Completed' ? 'Paid' : selectedOrder.paymentStatus || 'Pending'}</span>
              {' · '}Delivery: {selectedOrder.deliverySlot || 'Not specified'}
            </p>

            <section className="space-y-3 mb-6">
              <h3 className="font-display font-bold text-lg">Item Details</h3>
              {(selectedOrder.items || []).filter((item) => !item.isGiftBox).map((item) => (
                <div key={item._id} className="rounded-2xl border border-lavender-200 dark:border-mocha-700 p-4">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{item.productId?.name || item.customName || 'Custom item'}</span>
                    <span className="font-bold">₹{Number(item.price || 0).toLocaleString('en-IN')} × {item.quantity}</span>
                  </div>
                </div>
              ))}
              {selectedOrder.customCake3DParams && (
                <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/20 p-4 space-y-2">
                  <h4 className="font-bold text-purple-800 dark:text-purple-300">Custom 3D Cake Specs</h4>
                  <p className="text-sm">Tiers: {selectedOrder.customCake3DParams.tiers || 1} · Base: {selectedOrder.customCake3DParams.baseColor || selectedOrder.customCake3DParams.cakeColor || selectedOrder.customCake3DParams.tierColor || '—'}</p>
                  <p className="text-sm">Frosting: {selectedOrder.customCake3DParams.frostingColor || '—'} · Drip: {selectedOrder.customCake3DParams.dripColor || '—'}</p>
                  <p className="text-sm">Topper: {selectedOrder.customCake3DParams.topperStyle || selectedOrder.customCake3DParams.themeName || '—'}</p>
                  <p className="text-sm">Inscription plaque: {selectedOrder.customCake3DParams.inscription || selectedOrder.customCake3DParams.customText || '—'}</p>
                </div>
              )}
              {(selectedOrder.items || []).filter((item) => item.isGiftBox).map((item) => (
                <div key={item._id} className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-2">
                  <h4 className="font-bold text-amber-800 dark:text-amber-300">Custom Gift Box Specs</h4>
                  <p className="text-sm">Theme: {item.giftBox?.themeName || item.giftBox?.boxName || item.customName || 'Curated Gift Box'}</p>
                  <p className="text-sm">Ribbon color: {item.giftBox?.ribbonColor || item.giftBox?.accentColor || '—'}</p>
                  <p className="text-sm">Gift note/card: {item.giftBox?.greetingCardMessage || 'No personal note added'}</p>
                  <ul className="list-disc pl-5 text-sm">
                    {(item.giftBox?.products || getGiftBoxProducts(selectedOrder)).map((product, index) => (
                      <li key={product._id || index}>{product.name} · ₹{Number(product.price || 0).toLocaleString('en-IN')}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
            {selectedOrder.customMessage && (
              <div className="rounded-2xl bg-lavender-50 dark:bg-mocha-800 p-4 text-sm">
                <strong>Customer notes:</strong> {selectedOrder.customMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Blueprint Inspection Modal */}
      {inspectingCake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-berry-950/70 backdrop-blur-md animate-pop-in">
          <div
            className="bg-white dark:bg-mocha-900 rounded-4xl max-w-2xl w-full p-6 sm:p-8 border border-lavender-200 dark:border-mocha-800 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setInspectingCake(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-lavender-100 dark:bg-mocha-800 hover:bg-lavender-200 text-berry-900 dark:text-mocha-100 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300">
                Custom 3D Cake Spec
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-berry-950 dark:text-mocha-50 mb-3">
              {inspectingCake.cakeName || 'Artisan Custom Confection'}
            </h3>

            <div className="h-72 w-full rounded-3xl overflow-hidden bg-radial from-lavender-100 to-lavender-300/40 dark:from-mocha-800 dark:to-mocha-950 border border-lavender-200 dark:border-mocha-800 shadow-inner">
              <Cake3D
                tiers={inspectingCake.tiers || 1}
                cakeColor={inspectingCake.cakeColor || '#FDFBF7'}
                frostingColor={inspectingCake.frostingColor || '#FDE8E9'}
                dripColor={inspectingCake.dripColor || '#7B3F00'}
                hasCandle={!!inspectingCake.hasCandle}
                hasCherries={!!inspectingCake.hasCherries}
                hasBerries={!!inspectingCake.hasBerries}
                hasSprinkles={!!inspectingCake.hasSprinkles}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-2.5 rounded-2xl bg-lavender-50 dark:bg-mocha-800 text-center">
                <span className="text-xs uppercase text-lavender-700 dark:text-mocha-400 block font-bold">Tiers</span>
                <span className="font-bold text-berry-950 dark:text-mocha-100">{inspectingCake.tiers || 1} Layer</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-lavender-50 dark:bg-mocha-800 text-center">
                <span className="text-xs uppercase text-lavender-700 dark:text-mocha-400 block font-bold">Base</span>
                <span className="font-mono font-bold text-berry-950 dark:text-mocha-100">{inspectingCake.cakeColor}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-lavender-50 dark:bg-mocha-800 text-center">
                <span className="text-xs uppercase text-lavender-700 dark:text-mocha-400 block font-bold">Frosting</span>
                <span className="font-mono font-bold text-berry-950 dark:text-mocha-100">{inspectingCake.frostingColor}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-lavender-50 dark:bg-mocha-800 text-center">
                <span className="text-xs uppercase text-lavender-700 dark:text-mocha-400 block font-bold">Drip</span>
                <span className="font-mono font-bold text-berry-950 dark:text-mocha-100">{inspectingCake.dripColor}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
