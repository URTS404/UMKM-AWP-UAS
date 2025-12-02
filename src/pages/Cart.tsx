import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { ordersAPI } from '../utils/api';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Package, Clock } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<'standard' | 'express'>('standard');

  const shippingFee = selectedShipping === 'express' ? 50000 : 0;
  const subtotal = getTotal();
  const grandTotal = subtotal + shippingFee;

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: grandTotal,
        shipping_method: selectedShipping,
        shipping_fee: shippingFee,
        notes: ''
      };

      const response = await ordersAPI.create(orderData);
      
      if (response.success) {
        clearCart();
        alert('Order placed successfully! You will receive a WhatsApp message with your order details.');
        navigate('/');
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <ShoppingCart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Start shopping for your favorite K-pop merchandise!</p>
              <button
                onClick={() => navigate('/')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={() => navigate('/')}
              className="text-purple-600 hover:text-purple-700 inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`K-pop ${item.name} merchandise thumbnail`)}&image_size=square`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=K-pop+merchandise+placeholder&image_size=square';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-purple-600 font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                      <p className="text-sm text-gray-500">Subtotal: Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Summary Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? 'Free' : `Rp ${shippingFee.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    
                    {/* Shipping Options */}
                    <div className="space-y-2 mb-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={selectedShipping === 'standard'}
                          onChange={(e) => setSelectedShipping(e.target.value as 'standard' | 'express')}
                          className="text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2 text-green-600" />
                            <span className="font-medium">Standard Shipping</span>
                          </div>
                          <p className="text-sm text-gray-500 ml-6">Free (3-7 business days)</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={selectedShipping === 'express'}
                          onChange={(e) => setSelectedShipping(e.target.value as 'standard' | 'express')}
                          className="text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium">Express Shipping</span>
                          </div>
                          <p className="text-sm text-gray-500 ml-6">Rp 50,000 (1-2 business days)</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-purple-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full mt-6 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </button>

                {/* WhatsApp Info */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 text-center">
                    📱 You'll receive order details via WhatsApp
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Bank Transfer (BCA, Mandiri, BNI)</p>
                  <p>• E-Wallet (OVO, GoPay, ShopeePay)</p>
                  <p>• Cash on Delivery (COD)</p>
                  <p>• QRIS Payment</p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Payment instructions will be sent via WhatsApp after order confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}