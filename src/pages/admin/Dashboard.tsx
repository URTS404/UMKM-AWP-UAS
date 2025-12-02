import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, ordersAPI, financeAPI } from '../../utils/api';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: any[];
  lowStockProducts: any[];
  monthlyRevenue: number;
  monthlyOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    lowStockProducts: [],
    monthlyRevenue: 0,
    monthlyOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsRes, ordersRes, financeRes] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        financeAPI.getAll()
      ]);

      if (productsRes.success && ordersRes.success && financeRes.success) {
        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const finances = financeRes.data || [];

        // Calculate stats
        const totalRevenue = orders
          .filter((order: any) => order.status === 'completed')
          .reduce((sum: number, order: any) => sum + order.total_amount, 0);

        const pendingOrders = orders.filter((order: any) => 
          order.status === 'pending' || order.status === 'processing'
        ).length;

        const lowStockProducts = products.filter((product: any) => product.stock <= 5);

        // Get current month data
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });

        const monthlyRevenue = monthlyOrders
          .filter((order: any) => order.status === 'completed')
          .reduce((sum: number, order: any) => sum + order.total_amount, 0);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
          recentOrders: orders.slice(0, 5), // Last 5 orders
          lowStockProducts: lowStockProducts.slice(0, 5), // Top 5 low stock
          monthlyRevenue,
          monthlyOrders: monthlyOrders.length
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-4">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded mb-3"></div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded mb-3"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-4">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your K-pop store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="text-purple-600"
            trend="+12% this month"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="text-blue-600"
            trend="+8% this month"
          />
          <StatCard
            title="Total Revenue"
            value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}
            icon={DollarSign}
            color="text-green-600"
            trend={`Rp ${stats.monthlyRevenue.toLocaleString('id-ID')} this month`}
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Clock}
            color="text-orange-600"
            trend={`${stats.monthlyOrders} orders this month`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Low Stock Alert</h2>
              <Link to="/admin/products" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Manage Products →
              </Link>
            </div>
            <div className="space-y-3">
              {stats.lowStockProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">All products are well stocked</p>
              ) : (
                stats.lowStockProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.type} Stock</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{product.stock} left</p>
                      <AlertCircle className="w-4 h-4 text-red-500 ml-auto" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
            >
              <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Product</p>
            </Link>
            <Link
              to="/admin/orders"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
            >
              <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">View Orders</p>
            </Link>
            <Link
              to="/admin/finance"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center"
            >
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Finance Report</p>
            </Link>
            <Link
              to="/admin/invoices"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-center"
            >
              <CheckCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Generate Invoice</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}