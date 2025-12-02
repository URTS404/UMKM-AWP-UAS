import { useState, useEffect } from 'react';
import { ordersAPI } from '../../utils/api';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  User, 
  Phone, 
  Calendar,
  Filter,
  Eye
} from 'lucide-react';

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shipping_method: 'standard' | 'express';
  shipping_fee: number;
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      if (response.success) {
        fetchOrders(); // Refresh the orders list
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status.');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('An error occurred while updating the order status.');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-4">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="bg-white rounded-xl p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 mb-4 py-4 border-b">
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { status: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-100 text-yellow-800' },
            { status: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: 'bg-blue-100 text-blue-800' },
            { status: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length, color: 'bg-green-100 text-green-800' },
            { status: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-100 text-red-800' }
          ].map((stat) => (
            <div key={stat.status} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
              <div className={`text-sm font-medium ${stat.color} inline-flex items-center px-2 py-1 rounded-full mt-1`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      <div className="text-xs text-gray-500">
                        {order.shipping_method === 'express' ? 'Express' : 'Standard'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {order.customer_phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found for the selected filter.</p>
          </div>
        )}

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Order Details #{selectedOrder.id}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedOrder.customer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {(selectedOrder.total_amount - selectedOrder.shipping_fee).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping ({selectedOrder.shipping_method})</span>
                      <span>Rp {selectedOrder.shipping_fee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>Rp {selectedOrder.total_amount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                  <div className="flex space-x-2">
                    {(['pending', 'processing', 'completed', 'cancelled'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedOrder.status === status
                            ? getStatusColor(status)
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Notes:</p>
                    <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Order Date */}
                <div className="text-sm text-gray-500">
                  <p>Order placed on: {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}