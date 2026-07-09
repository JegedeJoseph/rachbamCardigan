import { db, admin } from '../services/firebase.js';

const ordersRef = db.collection('orders');
const productsRef = db.collection('products');

const formatDoc = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return { id: doc.id, _id: doc.id, ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate() };
};

// Helper to simulate populate
const populateItems = async (items) => {
  if (!items || !items.length) return items;
  
  const populatedItems = [];
  for (const item of items) {
    let productData = null;
    if (item.product) {
      const productDoc = await productsRef.doc(item.product).get();
      if (productDoc.exists) {
        const pd = productDoc.data();
        productData = {
          _id: productDoc.id,
          name: pd.name,
          images: pd.images,
          price: pd.price
        };
      }
    }
    populatedItems.push({ ...item, product: productData });
  }
  return populatedItems;
};

export const orderRepository = {
  async findWithPaginationAndFilters({ page = 1, limit = 20, paymentStatus, orderStatus, search, sortBy = 'createdAt', sortOrder = 'desc' }) {
    // Firestore lacks complex $or and aggregation, so we fetch and filter in memory for simplicity here.
    // In production with large data, this should use a search service or denormalized search fields.
    
    let query = ordersRef.orderBy(sortBy, sortOrder);
    
    // We can do exact match filters at database level
    if (paymentStatus) {
      query = query.where('paymentStatus', '==', paymentStatus);
    }
    if (orderStatus) {
      query = query.where('orderStatus', '==', orderStatus);
    }
    
    const snapshot = await query.get();
    let allOrders = snapshot.docs.map(formatDoc);
    
    if (search) {
      const searchLower = search.toLowerCase();
      allOrders = allOrders.filter(o => 
        (o.orderNumber && o.orderNumber.toLowerCase().includes(searchLower)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(searchLower)) ||
        (o.customer?.email && o.customer.email.toLowerCase().includes(searchLower)) ||
        (o.customer?.phone && o.customer.phone.toLowerCase().includes(searchLower))
      );
    }
    
    const total = allOrders.length;
    const skip = (page - 1) * limit;
    let paginatedOrders = allOrders.slice(skip, skip + limit);
    
    // Populate products
    for (let i = 0; i < paginatedOrders.length; i++) {
      paginatedOrders[i].items = await populateItems(paginatedOrders[i].items);
    }
    
    return { orders: paginatedOrders, total };
  },

  async findById(id) {
    const doc = await ordersRef.doc(id).get();
    const order = formatDoc(doc);
    if (order) {
      order.items = await populateItems(order.items);
    }
    return order;
  },

  async findOneByOrderNumber(orderNumber) {
    const snapshot = await ordersRef.where('orderNumber', '==', orderNumber).limit(1).get();
    if (snapshot.empty) return null;
    const order = formatDoc(snapshot.docs[0]);
    if (order) {
      order.items = await populateItems(order.items);
    }
    return order;
  },

  async findOneByPaystackReference(reference) {
    const snapshot = await ordersRef.where('paystackReference', '==', reference).limit(1).get();
    if (snapshot.empty) return null;
    const order = formatDoc(snapshot.docs[0]);
    if (order) {
      order.items = await populateItems(order.items);
    }
    return order;
  },

  async create(data) {
    const docRef = ordersRef.doc();
    const orderData = {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await docRef.set(orderData);
    const doc = await docRef.get();
    return formatDoc(doc);
  },

  async findByIdAndUpdate(id, data) {
    const docRef = ordersRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    
    await docRef.update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updatedDoc = await docRef.get();
    const order = formatDoc(updatedDoc);
    if (order) {
      order.items = await populateItems(order.items);
    }
    return order;
  },

  async getStatsSummary() {
    const snapshot = await ordersRef.get();
    const stats = {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      verifiedPayments: 0,
      pendingPayments: 0
    };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      stats.totalOrders++;
      
      if (data.orderStatus === 'pending') stats.pendingOrders++;
      if (data.orderStatus === 'processing') stats.processingOrders++;
      if (data.orderStatus === 'shipped') stats.shippedOrders++;
      if (data.orderStatus === 'delivered') stats.deliveredOrders++;
      if (data.orderStatus === 'cancelled') stats.cancelledOrders++;
      
      if (data.paymentStatus === 'verified') stats.verifiedPayments++;
      if (data.paymentStatus === 'pending') stats.pendingPayments++;
    });
    
    return stats;
  },

  async getAnalyticsDashboard() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const snapshot = await ordersRef.where('paymentStatus', '==', 'verified').get();
    const orders = snapshot.docs.map(formatDoc);

    let totalOrders = orders.length;
    let totalRevenue = 0;
    
    // For top variants
    const variantSales = {};
    
    // For monthly revenue trend
    const monthlyRevenueMap = {};

    orders.forEach(order => {
      totalRevenue += order.total || 0;
      
      // Monthly trend
      if (order.createdAt >= sixMonthsAgo) {
        const d = order.createdAt;
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`; // "YYYY-M"
        if (!monthlyRevenueMap[key]) {
          monthlyRevenueMap[key] = { year: d.getFullYear(), month: d.getMonth() + 1, revenue: 0, orders: 0 };
        }
        monthlyRevenueMap[key].revenue += order.total || 0;
        monthlyRevenueMap[key].orders++;
      }

      // Top variants
      if (order.items) {
        order.items.forEach(item => {
          const key = `${item.size}-${item.color}`;
          if (!variantSales[key]) {
            variantSales[key] = {
              _id: { size: item.size, color: item.color },
              totalSold: 0,
              revenue: 0
            };
          }
          variantSales[key].totalSold += item.quantity;
          variantSales[key].revenue += item.quantity * item.price;
        });
      }
    });

    const topVariants = Object.values(variantSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    const monthlyRevenue = Object.values(monthlyRevenueMap)
      .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year))
      .map(item => ({
        _id: { year: item.year, month: item.month },
        revenue: item.revenue,
        orders: item.orders
      }));

    orders.sort((a, b) => b.createdAt - a.createdAt);
    const recentOrdersSubset = orders.slice(0, 10);
    const recentOrders = await populateItems(recentOrdersSubset);

    return {
      totalOrders,
      totalRevenue,
      topVariants,
      recentOrders,
      monthlyRevenue
    };
  },

  async getSalesByPeriod(startDate) {
    const snapshot = await ordersRef
      .where('paymentStatus', '==', 'verified')
      .where('createdAt', '>=', startDate)
      .get();
      
    let totalSales = 0;
    let orderCount = snapshot.size;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalSales += data.total || 0;
    });

    return { totalSales, orderCount };
  }
};
