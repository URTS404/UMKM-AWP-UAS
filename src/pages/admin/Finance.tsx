import { useState, useEffect } from 'react';
import { financeAPI } from '../../utils/api';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar, 
  Filter,
  BarChart3,
  Download
} from 'lucide-react';

interface FinanceRecord {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  reference_id?: number;
}

const categories = {
  income: ['Product Sales', 'Shipping Fees', 'Other Income'],
  expense: ['Product Cost', 'Shipping Cost', 'Marketing', 'Utilities', 'Rent', 'Salaries', 'Other Expense']
};

export default function AdminFinance() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchFinanceRecords();
  }, []);

  const fetchFinanceRecords = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getAll();
      if (response.success && response.data) {
        setRecords(response.data);
      }
    } catch (error) {
      console.error('Error fetching finance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recordData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      const response = await financeAPI.create(recordData);
      
      if (response.success) {
        setShowModal(false);
        setFormData({
          type: 'income',
          amount: '',
          description: '',
          category: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchFinanceRecords();
        alert('Finance record added successfully!');
      } else {
        alert('Failed to add finance record. Please try again.');
      }
    } catch (error) {
      console.error('Error adding finance record:', error);
      alert('An error occurred while adding the finance record.');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount'],
      ...filteredRecords.map(record => [
        record.date,
        record.type,
        record.category,
        record.description,
        record.amount.toLocaleString('id-ID')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredRecords = records.filter(record => {
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const totalIncome = records
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalExpense = records
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const monthlyData = records.reduce((acc, record) => {
    const month = new Date(record.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    acc[month][record.type] += record.amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-4">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="flex space-x-2">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
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
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </button>
          </div>
        </div>

        {/* Finance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expense</p>
                <p className="text-2xl font-bold text-red-600">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${
                  netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  Rp {netProfit.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.income.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                {categories.expense.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.type === 'income' ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        Rp {record.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No finance records found for the selected filters.</p>
          </div>
        )}

        {/* Add Record Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add Finance Record</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Plus className="w-6 h-6 transform rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories[formData.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}