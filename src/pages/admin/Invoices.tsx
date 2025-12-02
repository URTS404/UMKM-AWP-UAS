import { useState, useEffect } from 'react';
import { invoicesAPI, ordersAPI } from '../../utils/api';
import { 
  FileText, 
  Download, 
  Send, 
  Plus, 
  Search, 
  Calendar,
  Phone,
  DollarSign,
  Eye,
  X
} from 'lucide-react';

interface Invoice {
  id: number;
  order_id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  invoice_number: string;
  status: 'pending' | 'sent' | 'paid';
  created_at: string;
  sent_at?: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
}

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoicesAPI.getAll();
      if (response.success && response.data) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      if (response.success && response.data) {
        // Filter orders that don't have invoices yet
        const ordersWithoutInvoices = response.data.filter((order: any) => 
          order.status === 'completed' && !invoices.some(inv => inv.order_id === order.id)
        );
        setOrders(ordersWithoutInvoices);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const generateInvoice = async (orderId: number, customerPhone: string) => {
    try {
      const response = await invoicesAPI.generate(orderId, customerPhone);
      if (response.success) {
        fetchInvoices(); // Refresh the list
        alert('Invoice generated and sent successfully via WhatsApp!');
      } else {
        alert('Failed to generate invoice. Please try again.');
      }
    } catch (error) {
      console.error('Generate invoice error:', error);
      alert('An error occurred while generating the invoice.');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedOrder) return;
    
    await generateInvoice(selectedOrder.id, selectedOrder.customer_phone);
    setShowGenerateModal(false);
    setSelectedOrder(null);
  };

  const handleResendInvoice = async (invoice: Invoice) => {
    await generateInvoice(invoice.order_id, invoice.customer_phone);
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'pending':
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer_phone.includes(searchTerm) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-4">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="flex space-x-2">
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Invoice
            </button>
          </div>
        </div>

        {/* Invoice Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { status: 'pending', label: 'Pending', count: invoices.filter(inv => inv.status === 'pending').length, color: 'bg-yellow-100 text-yellow-800' },
            { status: 'sent', label: 'Sent', count: invoices.filter(inv => inv.status === 'sent').length, color: 'bg-blue-100 text-blue-800' },
            { status: 'paid', label: 'Paid', count: invoices.filter(inv => inv.status === 'paid').length, color: 'bg-green-100 text-green-800' },
            { status: 'all', label: 'Total', count: invoices.length, color: 'bg-purple-100 text-purple-800' }
          ].map((stat) => (
            <div key={stat.status} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
              <div className={`text-sm font-medium ${stat.color} inline-flex items-center px-2 py-1 rounded-full mt-1`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                      <div className="text-xs text-gray-500">Order #{invoice.order_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.customer_name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {invoice.customer_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        Rp {invoice.total_amount.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleResendInvoice(invoice)}
                            className="text-green-600 hover:text-green-900 p-1"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found for the selected filters.</p>
          </div>
        )}

        {/* Generate Invoice Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Generate Invoice</h2>
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Order *
                  </label>
                  <select
                    required
                    value={selectedOrder?.id || ''}
                    onChange={(e) => {
                      const order = orders.find(o => o.id === parseInt(e.target.value));
                      setSelectedOrder(order || null);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose an order...</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        #{order.id} - {order.customer_name} (Rp {order.total_amount.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedOrder && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Customer:</span> {selectedOrder.customer_name}</p>
                      <p><span className="text-gray-600">Phone:</span> {selectedOrder.customer_phone}</p>
                      <p><span className="text-gray-600">Total:</span> Rp {selectedOrder.total_amount.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGenerateModal(false);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateInvoice}
                    disabled={!selectedOrder}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Generate & Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Detail Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Invoice Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Invoice Number</p>
                      <p className="font-medium">{selectedInvoice.invoice_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium">#{selectedInvoice.order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium">{selectedInvoice.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedInvoice.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium">Rp {selectedInvoice.total_amount.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                        {getStatusIcon(selectedInvoice.status)}
                        <span className="ml-1 capitalize">{selectedInvoice.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Invoice Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium">Invoice Created</p>
                        <p className="text-xs text-gray-500">{new Date(selectedInvoice.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    {selectedInvoice.sent_at && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium">Invoice Sent</p>
                          <p className="text-xs text-gray-500">{new Date(selectedInvoice.sent_at).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  {selectedInvoice.status !== 'paid' && (
                    <button
                      onClick={() => handleResendInvoice(selectedInvoice)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Resend Invoice
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Download invoice logic would go here
                      alert('Invoice download functionality would be implemented here');
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}