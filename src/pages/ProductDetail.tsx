import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { productsAPI } from '../utils/api';
import { ShoppingCart, ArrowLeft, Star, Clock, Package, Plus, Minus } from 'lucide-react';

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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, getItemCount } = useCartStore();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(parseInt(id!));
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      // Show success feedback
      const button = document.querySelector('.add-to-cart-btn');
      if (button) {
        button.classList.add('bg-green-600');
        button.innerHTML = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Added!';
        setTimeout(() => {
          button.classList.remove('bg-green-600');
          button.innerHTML = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path></svg>Add to Cart';
        }, 1500);
      }
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getProductImages = () => {
    // For demo purposes, generate multiple images based on product type
    const baseImage = product?.image_url || `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`K-pop ${product?.name} merchandise, high quality product photography, studio lighting, professional`)}&image_size=square`;
    
    return [
      baseImage,
      `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`K-pop ${product?.name} merchandise close-up detail shot, high quality`)}&image_size=square`,
      `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`K-pop ${product?.name} merchandise lifestyle shot, styled with other K-pop items`)}&image_size=square`
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-lg h-96"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const images = getProductImages();
  const cartItemCount = getItemCount(product.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors inline-flex items-center shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`K-pop merchandise placeholder, ${product.name}`)}&image_size=square`;
                }}
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.type === 'PO' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-4 h-4 mr-1" />
                    Pre-Order
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Package className="w-4 h-4 mr-1" />
                    Ready Stock
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">(4.8/5)</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-purple-600">
              Rp {product.price.toLocaleString('id-ID')}
            </div>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Stock:</span>
                <span className={`font-semibold ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock} pieces` : 'Out of Stock'}
                </span>
              </div>
              {cartItemCount > 0 && (
                <div className="mt-2 text-sm text-purple-600">
                  {cartItemCount} in your cart
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="add-to-cart-btn w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              </div>
            )}

            {/* Product Details */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Product Type:</span>
                  <span className="font-medium">{product.type === 'PO' ? 'Pre-Order' : 'Ready Stock'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Added Date:</span>
                  <span className="font-medium">{new Date(product.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>SKU:</span>
                  <span className="font-medium">KRP-{product.id.toString().padStart(4, '0')}</span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Shipping Information</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Free shipping for orders above Rp 500,000</li>
                <li>• Estimated delivery: {product.type === 'PO' ? '14-21 days' : '3-7 days'}</li>
                <li>• Secure packaging for all K-pop merchandise</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 mb-1">Related Product {item}</h3>
                  <p className="text-purple-600 font-semibold text-sm">Rp 150,000</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}