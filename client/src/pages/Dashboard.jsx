import { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { formatCurrency } from '../utils/nigeriaStates';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Top Variant',
      value: analytics?.topVariants?.[0]
        ? `${analytics.topVariants[0]._id.size} - ${analytics.topVariants[0]._id.color}`
        : 'N/A',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Low Stock Items',
      value: analytics?.lowStockProducts?.length || 0,
      icon: Package,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Selling Variants */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Top Selling Variants</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Size</th>
                <th className="text-left py-3 px-4">Color</th>
                <th className="text-right py-3 px-4">Units Sold</th>
                <th className="text-right py-3 px-4">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topVariants?.map((variant, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{variant._id.size}</td>
                  <td className="py-3 px-4">{variant._id.color}</td>
                  <td className="text-right py-3 px-4">{variant.totalSold}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(variant.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {analytics?.lowStockProducts?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Low Stock Alert</h2>
          <div className="space-y-3">
            {analytics.lowStockProducts.map((product) => (
              <div key={product._id} className="flex justify-between items-center p-3 bg-orange-50 rounded">
                <span className="font-medium">{product.name}</span>
                <span className="text-orange-600 font-bold">{product.totalStock} units left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

