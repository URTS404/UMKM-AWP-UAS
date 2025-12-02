import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { productsAPI } from '../utils/api';
import { ShoppingCart, Search, Star, Clock, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'PO' | 'Ready';
  stock: number;
  image_url?: string;
  created_at: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'PO' | 'Ready'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { addItem, getItemCount } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(response.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.type === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to K-Pop Store 💜</h1>
        <p className="text-xl mb-6">Discover authentic K-Pop merchandise and albums</p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">✨ Authentic Products</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">🚚 Fast Shipping</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium">💯 Customer Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            {(['all', 'PO', 'Ready'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Products' : category === 'PO' ? 'Pre-Order' : 'Ready Stock'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-6xl">💜</div>
              )}
              
              {/* Product Type Badge */}
              <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                product.type === 'PO' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {product.type === 'PO' ? (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    Pre-Order
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Package size={12} />
                    Ready Stock
                  </div>
                )}
              </div>

              {/* Stock Badge */}
              {product.type === 'Ready' && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Stock: {product.stock}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-purple-600">
                  {formatPrice(product.price)}
                </span>
                
                <div className="flex gap-2">
                  <Link
                    to={`/product/${product.id}`}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
                  >
                    <ShoppingCart size={16} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Products Found */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💜</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="text-purple-600" size={32} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Authentic Products</h3>
            <p className="text-gray-600">100% genuine K-Pop merchandise directly from Korea</p>
          </div>
          <div className="text-center">
            <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="text-pink-600" size={32} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Fast Shipping</h3>
            <p className="text-gray-600">Quick and secure delivery to your doorstep</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="text-yellow-600" size={32} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Pre-Order Available</h3>
            <p className="text-gray-600">Reserve the latest releases before they sell out</p>
          </div>
        </div>
      </div>
    </div>
  );
}