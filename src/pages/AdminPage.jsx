import React, { useEffect, useMemo, useState } from 'react';
import { Building2, ClipboardList, Edit2, Eye, Package, Plus, Search, Trash2, Users, X, Truck, UserRound, IndianRupee, LayoutDashboard } from 'lucide-react';
import api from '../services/api';
import Cake3D from '../components/3d/Cake3D';

const STATUS_OPTIONS = [
  ['PENDING', 'Pending'],
  ['IN_PREPARATION', 'In Preparation'],
  ['OUT_FOR_DELIVERY', 'Out for Delivery'],
  ['COMPLETED', 'Completed'],
  ['READY_FOR_PICKUP', 'Ready for Pickup'],
  ['CANCELLED', 'Cancelled'],
];

const statusLabel = (status) => STATUS_OPTIONS.find(([value]) => value === status)?.[1] || status || 'Pending';
const unwrap = (response, key) => response?.data?.[key] || response?.data?.data || [];

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [bakeryFilter, setBakeryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedBakery, setSelectedBakery] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pickupResponses, setPickupResponses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showBakeryForm, setShowBakeryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notice, setNotice] = useState('');
  const [bakeryForm, setBakeryForm] = useState({ name: '', email: '', phone: '', logo: '', primaryName: '', primaryEmail: '', primaryPassword: '' });

  const loadData = async () => {
    const results = await Promise.allSettled([
      api.get('/admin/orders'),
      api.get('/admin/bakeries'),
      api.get('/admin/products'),
      api.get('/orders/pickup-responses'),
      api.get('/admin/customers'),
    ]);
    const [orderResult, bakeryResult, productResult, responseResult, customerResult] = results;
    const failures = [];
    if (orderResult.status === 'fulfilled') setOrders(unwrap(orderResult.value, 'orders'));
    else failures.push('orders');
    if (bakeryResult.status === 'fulfilled') setBakeries(unwrap(bakeryResult.value, 'bakeries'));
    else failures.push('bakeries');
    if (productResult.status === 'fulfilled') setProducts(unwrap(productResult.value, 'products'));
    else failures.push('products');
    if (responseResult.status === 'fulfilled') setPickupResponses(unwrap(responseResult.value, 'responses'));
    else failures.push('pickup responses');
    if (customerResult.status === 'fulfilled') setCustomers(unwrap(customerResult.value, 'customers'));
    else failures.push('customers');
    if (failures.length) {
      setNotice(`Could not load: ${failures.join(', ')}. Refresh after confirming your admin session.`);
    } else {
      setNotice('');
    }
  };

  useEffect(() => {
    loadData().catch((error) => setNotice(error.response?.data?.message || 'Could not load admin data.'));
    const interval = setInterval(() => {
      loadData().catch((error) => setNotice(error.response?.data?.message || 'Could not refresh admin data.'));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => orders
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .filter((order) => {
      const customer = order.userId?.name || order.customer?.name || order.customerName || '';
      const haystack = `${order._id} ${customer}`.toLowerCase();
      const itemStatuses = (order.items || []).map((item) => item.itemStatus || 'PENDING');
      return (!search || haystack.includes(search.toLowerCase()))
        && (!bakeryFilter || (order.bakeryName || order.bakery?.name) === bakeryFilter)
        && (!statusFilter || order.orderStatus === statusFilter || order.status === statusFilter ||
          (statusFilter === 'READY_FOR_PICKUP' && itemStatuses.includes('READY_FOR_PICKUP')));
    }), [orders, search, bakeryFilter, statusFilter]);

  const overviewMetrics = useMemo(() => {
    const cancelledStatuses = new Set(['CANCELLED', 'CANCELED']);
    const revenue = orders.reduce((total, order) => {
      const status = String(order.status || order.orderStatus || '').toUpperCase();
      return total + (cancelledStatuses.has(status) ? 0 : Number(order.total || 0));
    }, 0);
    return {
      totalOrders: orders.length,
      totalRevenue: revenue,
      totalBakeries: bakeries.filter((bakery) => bakery.active !== false && bakery.status !== 'INACTIVE').length,
      totalCustomers: customers.length,
      totalProducts: products.length,
    };
  }, [orders, bakeries, customers, products]);

  const createBakery = async (event) => {
    event.preventDefault();
    try {
      await api.post('/admin/bakeries', {
        name: bakeryForm.name,
        email: bakeryForm.email,
        phone: bakeryForm.phone,
        logo: bakeryForm.logo,
        account: {
          name: bakeryForm.primaryName,
          email: bakeryForm.primaryEmail,
          password: bakeryForm.primaryPassword,
        },
      });
      setShowBakeryForm(false);
      setBakeryForm({ name: '', email: '', phone: '', logo: '', primaryName: '', primaryEmail: '', primaryPassword: '' });
      setNotice('Partner bakery and primary storefront created.');
      await loadData();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Could not create bakery.');
    }
  };

  const reviewRequest = async (request, decision) => {
    const password = decision === 'approve' ? window.prompt('Set a password for this storefront account (minimum 6 characters):') : '';
    if (decision === 'approve' && !password) return;
    await api.put(`/auth/storefront-account-requests/${request._id}`, { decision, password });
    setRequests((current) => current.map((item) => item._id === request._id ? { ...item, status: decision === 'approve' ? 'APPROVED' : 'REJECTED' } : item));
  };

  const deleteAccount = async (account) => {
    if (!window.confirm(`Delete ${account.name}'s storefront account?`)) return;
    await api.delete(`/admin/accounts/${account._id}`);
    setAccounts((current) => current.filter((item) => item._id !== account._id));
  };

  const openAccounts = async (bakery) => {
    setSelectedBakery(bakery);
    try {
      const response = await api.get(`/admin/bakeries/${bakery._id}/accounts`);
      setAccounts(unwrap(response, 'accounts'));
      setRequests(response.data.requests || []);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Could not load bakery accounts.');
    }
  };

  const updateOrderStatus = async (order, status) => {
    try {
      const response = await api.put(`/admin/orders/${order._id}`, { status });
      const updated = response.data.order || response.data.data;
      setOrders((current) => current.map((item) => item._id === order._id ? { ...item, ...updated, status, orderStatus: status } : item));
      setSelectedOrder((current) => current ? { ...current, ...updated, status, orderStatus: status } : current);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Could not update order status.');
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Remove ${product.name} from the global catalog?`)) return;
    await api.delete(`/admin/products/${product._id}`);
    setProducts((current) => current.filter((item) => item._id !== product._id));
  };

  const updateProduct = async (event) => {
    event.preventDefault();
    const response = await api.put(`/admin/products/${editingProduct._id}`, editingProduct);
    setProducts((current) => current.map((item) => item._id === editingProduct._id ? (response.data.product || editingProduct) : item));
    setEditingProduct(null);
  };

  const saveCustomer = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put(`/admin/customers/${editingCustomer._id}`, editingCustomer);
      setCustomers((current) => current.map((customer) => customer._id === editingCustomer._id ? response.data.customer : customer));
      setEditingCustomer(null);
      setNotice('Customer account updated.');
    } catch (error) {
      setNotice(error.response?.data?.message || 'Could not update customer.');
    }
  };

  const deleteCustomer = async (customer) => {
    if (!window.confirm(`Delete ${customer.name}'s customer account? Historical orders will be retained.`)) return;
    try {
      await api.delete(`/admin/customers/${customer._id}`);
      setCustomers((current) => current.filter((item) => item._id !== customer._id));
      setNotice('Customer account deleted. Historical orders were retained.');
    } catch (error) {
      setNotice(error.response?.data?.message || 'Could not delete customer.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 shrink-0 rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-3 h-fit lg:sticky lg:top-24">
          <div className="px-3 py-4 border-b border-lavender-100 dark:border-mocha-800 mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-lavender-700">Super Admin</p>
            <h1 className="font-display font-bold text-xl">Control Center</h1>
          </div>
          {[
            ['overview', LayoutDashboard, 'Overview'],
            ['orders', ClipboardList, 'Orders'],
            ['bakeries', Building2, 'Partner Bakeries'],
            ['products', Package, 'Products'],
            ['responses', Truck, 'Pickup Responses'],
            ['customers', UserRound, 'Customers'],
          ].map(([value, Icon, label]) => (
            <button key={value} onClick={() => setActiveSection(value)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-left ${activeSection === value ? 'bg-lavender-600 text-white' : 'hover:bg-lavender-100 dark:hover:bg-mocha-800'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
          {notice && <p className="mt-4 p-3 rounded-xl bg-lavender-50 dark:bg-mocha-800 text-xs">{notice}</p>}
        </aside>

        <main className="flex-1 min-w-0">
          {activeSection === 'overview' && (
            <section className="space-y-6">
              <header className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-3xl">Overview</h2>
                  <p className="text-sm opacity-70">Monitor marketplace activity, revenue, customers, and partner growth.</p>
                </div>
                <button onClick={() => loadData()} className="rounded-xl border border-lavender-300 px-3 py-2 text-sm font-bold">Refresh</button>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  ['Total Orders', overviewMetrics.totalOrders, ClipboardList, 'bg-lavender-100 text-lavender-700'],
                  ['Total Revenue', `₹${overviewMetrics.totalRevenue.toLocaleString('en-IN')}`, IndianRupee, 'bg-emerald-100 text-emerald-700'],
                  ['Partner Bakeries', overviewMetrics.totalBakeries, Building2, 'bg-amber-100 text-amber-700'],
                  ['Total Customers', overviewMetrics.totalCustomers, Users, 'bg-sky-100 text-sky-700'],
                ].map(([label, value, Icon, color]) => (
                  <div key={label} className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-5 shadow-sm">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
                    <p className="text-sm opacity-70 mt-4">{label}</p>
                    <p className="font-display font-bold text-3xl mt-1">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-5">
                  <p className="text-sm opacity-70">Products in catalog</p>
                  <p className="font-display font-bold text-2xl mt-1">{overviewMetrics.totalProducts}</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-5">
                  <p className="text-sm opacity-70">Pending orders</p>
                  <p className="font-display font-bold text-2xl mt-1">{orders.filter((order) => String(order.status || order.orderStatus || '').toUpperCase() === 'PENDING').length}</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-5">
                  <p className="text-sm opacity-70">Ready for pickup</p>
                  <p className="font-display font-bold text-2xl mt-1">{orders.filter((order) => {
                    const status = String(order.status || order.orderStatus || '').toUpperCase();
                    if (['COMPLETED', 'DELIVERED', 'CANCELLED', 'CANCELED'].includes(status)) return false;
                    return status === 'READY_FOR_PICKUP' || (order.items || []).some((item) => item.itemStatus === 'READY_FOR_PICKUP');
                  }).length}</p>
                </div>
              </div>
            </section>
          )}
          {activeSection === 'orders' && (
            <section className="space-y-5">
              <header className="flex items-center justify-between gap-3"><div><h2 className="font-display font-bold text-3xl">Orders</h2><p className="text-sm opacity-70">Search, filter, inspect, and update every marketplace order.</p></div><button onClick={() => loadData()} className="rounded-xl border border-lavender-300 px-3 py-2 text-sm font-bold">Refresh</button></header>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 flex-1 min-w-[220px] rounded-2xl bg-white dark:bg-mocha-900 border border-lavender-200 px-3"><Search className="w-4 h-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Order ID or customer name" className="w-full p-3 bg-transparent outline-none text-sm" /></label>
                <select value={bakeryFilter} onChange={(event) => setBakeryFilter(event.target.value)} className="rounded-2xl border border-lavender-200 dark:border-mocha-700 bg-white dark:bg-mocha-900 px-3 text-sm"><option value="">All Bakeries</option>{bakeries.map((bakery) => <option key={bakery._id} value={bakery.name}>{bakery.name}</option>)}</select>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-lavender-200 dark:border-mocha-700 bg-white dark:bg-mocha-900 px-3 text-sm"><option value="">All Statuses</option>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </div>
              <div className="space-y-3">
                {filteredOrders.map((order) => <div key={order._id} className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-4 flex flex-col xl:flex-row xl:items-center gap-4">
                  <div className="flex-1"><p className="font-bold">#{String(order._id).slice(-8).toUpperCase()}</p><p className="text-sm">{order.userId?.name || order.customerSnapshot?.name || order.customer?.name || order.customerName || 'Customer'} · {new Set((order.items || []).flatMap((item) => [item.bakeryName || item.productId?.bakeryName, ...(item.giftBox?.products || []).map((product) => product.bakeryName)]).filter(Boolean)).size > 1 ? `Multi-Bakery Order (${order.items.length} Items)` : (order.bakeryName || order.bakery?.name || 'Unassigned bakery')}</p><div className="flex flex-wrap gap-1.5 mt-2">{(order.items || []).map((item) => <span key={item._id} className={`rounded-full px-2 py-1 text-[11px] font-bold ${(item.itemStatus || 'PENDING') === 'READY_FOR_PICKUP' ? 'bg-emerald-100 text-emerald-800' : (item.itemStatus || 'PENDING') === 'IN_PREPARATION' ? 'bg-amber-100 text-amber-800' : 'bg-lavender-100 text-lavender-800'}`}>{item.bakeryName || item.productId?.bakeryName || 'Bakery'}: {item.itemStatus || 'PENDING'}</span>)}</div><p className="text-xs opacity-60 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'Date unavailable'}</p></div>
                  <strong>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong>
                  <span className="rounded-full px-3 py-1 text-xs font-bold bg-lavender-100 dark:bg-mocha-800">{statusLabel(order.status || order.orderStatus)}</span>
                  <button onClick={() => setSelectedOrder(order)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-lavender-600 text-white px-3 py-2 text-xs font-bold"><Eye className="w-4 h-4" /> Inspect Full Order &amp; 3D Model</button>
                </div>)}
                {!filteredOrders.length && <div className="p-10 text-center rounded-3xl border border-dashed border-lavender-300 text-sm opacity-70">No matching orders.</div>}
              </div>
            </section>
          )}
          {activeSection === 'responses' && (
            <section className="space-y-5">
              <header className="flex items-center justify-between gap-3"><div><h2 className="font-display font-bold text-3xl">Bakery Pickup Responses</h2><p className="text-sm opacity-70">Bakeries notify you here when their items are ready. Pick up and deliver the order, then mark it delivered from Orders.</p></div><button onClick={() => loadData()} className="rounded-xl border border-lavender-300 px-3 py-2 text-sm font-bold">Refresh</button></header>
              <div className="space-y-3">
                {pickupResponses.map((response) => (
                  <div key={`${response.orderId}-${response.bakeryId}`} className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0"><p className="font-bold">Order #{response.orderNumber} · {response.bakeryName}</p><p className="text-sm opacity-70">{response.customer?.name || 'Customer'} · {response.shippingAddress}</p><p className="text-xs text-emerald-700 font-semibold mt-1">READY FOR PICKUP {response.note ? `· ${response.note}` : ''}</p>{response.items?.length > 0 && <div className="mt-2 text-xs space-y-1"><p className="font-bold opacity-80">Items ready from this bakery:</p>{response.items.map((item, index) => <p key={index}>• {item.quantity}x {item.name} · ₹{Number(item.price || 0).toLocaleString('en-IN')}</p>)}</div>}</div>
                    <button onClick={() => { setActiveSection('orders'); setSearch(response.orderNumber); }} className="rounded-xl bg-lavender-600 text-white px-4 py-2 text-sm font-bold">Open Order</button>
                  </div>
                ))}
                {!pickupResponses.length && <div className="p-10 text-center rounded-3xl border border-dashed border-lavender-300 text-sm opacity-70">No bakery pickup responses yet.</div>}
              </div>
            </section>
          )}
          {activeSection === 'customers' && (
            <section className="space-y-5">
              <header><h2 className="font-display font-bold text-3xl">Customer Accounts</h2><p className="text-sm opacity-70">Update customer contact details, reset passwords, deactivate, or remove accounts. Orders remain preserved.</p></header>
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div key={customer._id} className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><p className="font-bold">{customer.name}</p><p className="text-sm opacity-70">{customer.email}</p><p className="text-xs opacity-60">{customer.phone || 'No phone'} · {customer.active === false ? 'Inactive' : 'Active'}</p></div>
                    <div className="flex gap-2"><button onClick={() => setEditingCustomer({ ...customer, password: '' })} className="rounded-xl border border-lavender-300 px-3 py-2 text-xs font-bold">Edit</button><button onClick={() => deleteCustomer(customer)} className="rounded-xl bg-red-50 text-red-700 px-3 py-2 text-xs font-bold">Delete</button></div>
                  </div>
                ))}
                {!customers.length && <div className="p-10 text-center rounded-3xl border border-dashed border-lavender-300 text-sm opacity-70">No customer accounts found.</div>}
              </div>
            </section>
          )}

          {activeSection === 'bakeries' && (
            <section className="space-y-5">
              <div className="flex items-center justify-between"><div><h2 className="font-display font-bold text-3xl">Partner Bakeries</h2><p className="text-sm opacity-70">Manage bakery entities and storefront staff.</p></div><button onClick={() => setShowBakeryForm(true)} className="inline-flex items-center gap-2 rounded-2xl bg-lavender-600 text-white px-4 py-3 text-sm font-bold"><Plus className="w-4 h-4" /> Add New Partner Bakery</button></div>
              <div className="grid md:grid-cols-2 gap-4">{bakeries.map((bakery) => <div key={bakery._id} className="rounded-3xl bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800 p-5"><div className="flex items-start justify-between"><div><h3 className="font-bold text-lg">{bakery.name}</h3><p className="text-sm opacity-70">{bakery.email || 'No email'} · {bakery.phone || 'No phone'}</p></div><span className="text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 px-2 py-1">{bakery.active === false ? 'Inactive' : 'Active'}</span></div><div className="grid grid-cols-2 gap-3 my-4 text-sm"><div className="rounded-xl bg-lavender-50 dark:bg-mocha-800 p-3"><b>{bakery.activeProducts ?? products.filter((product) => product.bakeryName === bakery.name).length}</b><span className="block text-xs opacity-60">Active products</span></div><div className="rounded-xl bg-lavender-50 dark:bg-mocha-800 p-3"><b>{bakery.storefrontAccounts?.length || bakery.accountCount || 0}</b><span className="block text-xs opacity-60">Staff accounts</span></div></div><button onClick={() => openAccounts(bakery)} className="w-full rounded-xl border border-lavender-300 py-2 text-sm font-bold"><Users className="inline w-4 h-4 mr-2" /> View Accounts</button></div>)}</div>
            </section>
          )}

          {activeSection === 'products' && (
            <section className="space-y-5">
              <div><h2 className="font-display font-bold text-3xl">Global Products Catalog</h2><p className="text-sm opacity-70">Edit and remove products across every partner bakery.</p></div>
              <div className="flex gap-3"><select onChange={(event) => setBakeryFilter(event.target.value)} className="rounded-2xl border border-lavender-200 dark:border-mocha-700 bg-white dark:bg-mocha-900 px-3 py-2 text-sm"><option value="">All Bakeries</option>{bakeries.map((bakery) => <option key={bakery._id} value={bakery.name}>{bakery.name}</option>)}</select></div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{products.filter((product) => !bakeryFilter || product.bakeryName === bakeryFilter).map((product) => <div key={product._id} className="rounded-3xl overflow-hidden bg-white dark:bg-mocha-900 border border-lavender-200 dark:border-mocha-800"><img src={product.image} alt={product.name} className="w-full h-40 object-cover" /><div className="p-4"><h3 className="font-bold">{product.name}</h3><p className="text-xs opacity-60">{product.category} · Provided by: {product.bakeryName || 'Unknown bakery'}</p><div className="flex justify-between items-center mt-3"><strong>₹{Number(product.price || 0).toLocaleString('en-IN')}</strong><span className={`text-xs font-bold ${product.inStock ? 'text-emerald-600' : 'text-red-600'}`}>{product.inStock ? 'In stock' : 'Out of stock'}</span></div><div className="flex gap-2 mt-3"><button onClick={() => setEditingProduct({ ...product })} className="flex-1 rounded-xl bg-lavender-100 dark:bg-mocha-800 py-2 text-xs font-bold"><Edit2 className="inline w-3 h-3 mr-1" /> Edit</button><button onClick={() => deleteProduct(product)} className="rounded-xl bg-red-100 text-red-700 px-3"><Trash2 className="w-4 h-4" /></button></div></div></div>)}</div>
            </section>
          )}
        </main>
      </div>

      {showBakeryForm && <Modal title="Add New Partner Bakery" onClose={() => setShowBakeryForm(false)}><form onSubmit={createBakery} className="space-y-3">{[['name', 'Bakery name'], ['email', 'Bakery email'], ['phone', 'Phone'], ['logo', 'Logo URL'], ['primaryName', 'Primary account name'], ['primaryEmail', 'Primary account email'], ['primaryPassword', 'Primary account password']].map(([key, label]) => <input key={key} required={['name', 'primaryName', 'primaryEmail', 'primaryPassword'].includes(key)} type={key.toLowerCase().includes('email') ? 'email' : key.toLowerCase().includes('password') ? 'password' : 'text'} placeholder={label} value={bakeryForm[key]} onChange={(event) => setBakeryForm({ ...bakeryForm, [key]: event.target.value })} className="w-full rounded-xl border border-lavender-200 p-3 text-sm bg-transparent" />)}<button className="w-full rounded-xl bg-lavender-600 text-white py-3 font-bold">Create Bakery &amp; Primary Storefront</button></form></Modal>}
      {editingProduct && <Modal title="Edit Product" onClose={() => setEditingProduct(null)}><form onSubmit={updateProduct} className="space-y-3">{['name', 'price', 'category', 'image', 'description'].map((key) => <input key={key} required={key !== 'description'} type={key === 'price' ? 'number' : 'text'} placeholder={key} value={editingProduct[key] || ''} onChange={(event) => setEditingProduct({ ...editingProduct, [key]: event.target.value })} className="w-full rounded-xl border border-lavender-200 p-3 text-sm bg-transparent" />)}<button className="w-full rounded-xl bg-lavender-600 text-white py-3 font-bold">Save Product</button></form></Modal>}
      {editingCustomer && <Modal title="Edit Customer Account" onClose={() => setEditingCustomer(null)}><form onSubmit={saveCustomer} className="space-y-3">{[['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Address'], ['password', 'New password (optional)']].map(([key, label]) => <input key={key} required={['name', 'email'].includes(key)} type={key === 'email' ? 'email' : key === 'password' ? 'password' : 'text'} placeholder={label} value={editingCustomer[key] || ''} onChange={(event) => setEditingCustomer({ ...editingCustomer, [key]: event.target.value })} className="w-full rounded-xl border border-lavender-200 p-3 text-sm bg-transparent" />)}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingCustomer.active !== false} onChange={(event) => setEditingCustomer({ ...editingCustomer, active: event.target.checked })} /> Account active</label><button className="w-full rounded-xl bg-lavender-600 text-white py-3 font-bold">Save Customer</button></form></Modal>}
      {selectedBakery && <Modal title={`${selectedBakery.name} · Storefront Accounts`} onClose={() => setSelectedBakery(null)}><div className="space-y-3">{accounts.map((account) => <div key={account._id} className="flex justify-between items-center rounded-xl bg-lavender-50 dark:bg-mocha-800 p-3 text-sm"><span><b>{account.name}</b><br /><span className="opacity-70">{account.email}</span></span><span className="flex items-center gap-2 text-xs font-bold">{account.isPrimaryStorefront || account.isPrimary ? 'PRIMARY' : <button onClick={() => deleteAccount(account)} className="text-red-600">Delete</button>}</span></div>)}<h4 className="font-bold pt-3">Pending Approvals</h4>{requests.filter((request) => request.status === 'PENDING').map((request) => <div key={request._id} className="flex items-center justify-between rounded-xl border border-amber-200 p-3 text-sm"><span>{request.name} · {request.email}</span><span className="flex gap-2"><button onClick={() => reviewRequest(request, 'approve')} className="text-emerald-600 font-bold">Approve</button><button onClick={() => reviewRequest(request, 'reject')} className="text-red-600 font-bold">Reject</button></span></div>)}{!accounts.length && !requests.length && <p className="text-sm opacity-60">No linked accounts or pending requests.</p>}</div></Modal>}
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={updateOrderStatus} />}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-mocha-900 p-6"><div className="flex justify-between items-center mb-5"><h2 className="font-display font-bold text-xl">{title}</h2><button onClick={onClose}><X /></button></div>{children}</div></div>;

const OrderModal = ({ order, onClose, onStatusChange }) => {
  const cakeItem = (order.items || []).find((item) => item.is3DCake || item.isCustom || item.cakeConfig || item.customCake3DParams);
  const params = cakeItem?.cakeConfig || cakeItem?.customCake3DParams || order.customCake3DParams || order.cake3DParams;
  const giftItems = (order.items || []).filter((item) => item.isGiftBox);
  const participatingBakeries = [...new Set((order.items || []).flatMap((item) => [
    ...(item.bakeryName || '').split(',').map((name) => name.trim()),
    ...(item.giftBox?.products || []).map((product) => product.bakeryName),
    item.productId?.bakeryName,
  ]).filter(Boolean))];
  return <Modal title={`Order #${String(order._id).slice(-8).toUpperCase()}`} onClose={onClose}>
    <div className="grid grid-cols-2 gap-3 text-sm mb-5">{[['Customer', order.userId?.name || order.customerSnapshot?.name || order.customer?.name || order.customerName], ['Email', order.userId?.email || order.customerSnapshot?.email || order.customer?.email], ['Participating Bakeries', participatingBakeries.length ? `${participatingBakeries.length}: ${participatingBakeries.join(', ')}` : 'Multi-Bakery Order'], ['Payment', order.paymentStatus || 'Pending'], ['Subtotal', `₹${order.subtotal || 0}`], ['Tax', `₹${order.tax || 0}`], ['Delivery fee', `₹${order.deliveryFee || 0}`], ['Total', `₹${order.total || 0}`]].map(([label, value]) => <div key={label} className={`rounded-xl p-3 ${label === 'Participating Bakeries' ? 'bg-purple-50 dark:bg-purple-950/30' : 'bg-lavender-50 dark:bg-mocha-800'}`}><span className="block text-xs opacity-60">{label}</span><b className={label === 'Participating Bakeries' ? 'text-purple-900 dark:text-purple-200' : ''}>{value || '—'}</b></div>)}</div>
    <label className="block text-sm font-bold mb-5">Order status<select value={order.status || order.orderStatus || 'PENDING'} onChange={(event) => onStatusChange(order, event.target.value)} className="mt-1 w-full rounded-xl border border-lavender-200 p-3 bg-transparent">{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <h3 className="font-bold mb-2">Ordered products &amp; gift boxes</h3>
    <div className="space-y-3 text-sm">
      {(order.items || []).map((item, index) => item.isGiftBox ? (
        <div key={item._id || index} className="rounded-xl border border-lavender-200 p-3">
          <div className="flex justify-between gap-2"><p className="font-bold">{item.giftBox?.boxName || item.customName || 'Custom gift box'} · Qty {item.quantity} · ₹{item.price}</p><span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold">🏪 Provided by: {item.bakeryName || 'Multiple bakeries'}</span></div>
          <p className="mt-1 text-xs opacity-70">Presentation: {item.giftBox?.presentation || 'Boutique packaging'}</p>
          <p className="text-xs opacity-70">Tagline: {item.giftBox?.tagline || '—'}</p>
          <p className="text-xs opacity-70">Gift note/card: {item.giftBox?.greetingCardMessage || 'No personal note added'}</p>
          <div className="mt-2 space-y-1">
            {(item.giftBox?.products || []).map((product, productIndex) => (
              <p key={product._id || product.productId || productIndex} className="text-xs">
              {product.name || 'Product'} · Qty {product.quantity || 1} · ₹{product.price || 0} · 🏪 Provided by: {product.bakeryName || 'Bakery unavailable'}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div key={item._id || index} className="rounded-xl border border-lavender-200 p-3">
          <div className="flex justify-between gap-2"><p className="font-bold">{item.productId?.name || item.customName || 'Product'} · Qty {item.quantity} · ₹{item.price}</p><span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold">🏪 Provided by: {item.bakeryName || item.productId?.bakeryName || 'Bakery unavailable'}</span></div>
          {(item.is3DCake || item.isCustom || item.cakeConfig || item.customCake3DParams) && (() => {
            const config = item.cakeConfig || item.customCake3DParams || {};
            const notes = config.blueprintNotes || config.spatialAnnotations || [];
            const palette = [
              ['Base', config.baseColor || config.palette?.baseColor],
              ['Drip', config.dripColor || config.palette?.dripColor],
              ['Frosting', config.frostingColor || config.palette?.frostingColor],
              ['Accent', config.accentColor || config.palette?.accentColor],
            ];
            const activeToppings = Object.entries(config.toppings || {})
              .filter(([, active]) => active)
              .map(([name]) => name);
            return <div className="mt-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 p-3">
              <p className="font-bold text-purple-900 dark:text-purple-200">3D Architectural Blueprint</p>
              <p className="text-xs mt-1">Tiers: {config.tiers || '—'} · Topper: {config.topperStyle || config.topperType || '—'} · Target bakery: {item.bakeryName || config.bakeryName || '—'}</p>
              <p className="text-xs mt-2"><b>Plaque:</b> {config.inscription || config.plaqueText || config.customText || '—'} <span className="ml-2 inline-flex items-center gap-1"><i className="w-3 h-3 rounded-full inline-block border" style={{ backgroundColor: config.inscriptionColor || config.textColor || '#FFFFFF' }} /> {config.inscriptionColor || config.textColor || '—'}</span></p>
              <div className="flex flex-wrap gap-2 mt-2">{palette.map(([label, color]) => color && <span key={label} className="inline-flex items-center gap-1 text-xs"><i className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />{label}: {color}</span>)}</div>
              {activeToppings.length > 0 && <p className="text-xs mt-2"><b>Toppings active:</b> {activeToppings.map((name) => <span key={name} className="inline-block rounded-full bg-white/70 px-2 py-1 ml-1">{name}: ON</span>)}</p>}
              {notes.length > 0 && <div className="mt-2 text-xs"><b>Baker placement notes:</b><ul className="list-disc ml-4">{notes.map((note, noteIndex) => <li key={note.id || noteIndex}>{note.label || note.title || 'Placement guide'}{note.detail ? `: ${note.detail}` : ''}</li>)}</ul></div>}
            </div>;
          })()}
        </div>
      ))}
      {!order.items?.length && <p className="rounded-xl border border-dashed border-lavender-300 p-3 opacity-70">No item details were stored for this order.</p>}
    </div>
    {params && <div className="mt-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 p-4"><h3 className="font-bold mb-3">3D Cake Blueprint</h3><div className="h-80 rounded-xl overflow-hidden bg-white/40"><Cake3D
      tiers={params.tiers || 1}
      palette={params.palette || { baseColor: params.baseColor || params.cakeColor || params.tierColor || '#FDFBF7', frostingColor: params.frostingColor || '#FDE8E9', dripColor: params.dripColor || '#7B3F00', accentColor: params.accentColor || '#FFD700' }}
      cakeColor={params.baseColor || params.cakeColor || params.tierColor || '#FDFBF7'}
      frostingColor={params.frostingColor || '#FDE8E9'}
      dripColor={params.dripColor || '#7B3F00'}
      toppings={params.toppings}
      topperType={params.topperType || params.topperStyle}
      customText={params.inscription || params.plaqueText || params.customText || params.inscriptionText || ''}
      textColor={params.inscriptionColor || params.textColor || '#FFFFFF'}
      themeName={params.themeName || ''}
      spatialAnnotations={params.spatialAnnotations || params.blueprintNotes || []}
      showSpatialGuides
      interactive
    /></div><p className="text-xs mt-3">Base {params.baseColor || params.cakeColor || '—'} · Frosting {params.frostingColor || '—'} · Drip {params.dripColor || '—'} · Topper {params.topperStyle || params.topperType || '—'} · Inscription {params.inscription || params.inscriptionText || params.customText || '—'}</p></div>}
    {order.customMessage && <p className="mt-4 rounded-xl bg-lavender-50 dark:bg-mocha-800 p-3 text-sm"><b>Customer notes:</b> {order.customMessage}</p>}
  </Modal>;
};

export default AdminPage;
