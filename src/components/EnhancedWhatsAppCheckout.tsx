'use client';

import { useState, useEffect } from 'react';
import { ShoppingCartIcon, XMarkIcon, PlusIcon, MinusIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

interface StoreInfo {
  id: string;
  name: string;
  whatsappNumber: string;
  currency: string;
}

interface EnhancedWhatsAppCheckoutProps {
  storeInfo: StoreInfo;
  initialItems?: CartItem[];
}

export default function EnhancedWhatsAppCheckout({
  storeInfo,
  initialItems = []
}: EnhancedWhatsAppCheckoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(initialItems);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: storeInfo.currency || 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + quantity);
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerInfo({ name: '', phone: '', address: '', notes: '' });
  };

  const generateWhatsAppUrl = async () => {
    try {
      setIsLoading(true);

      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        variant: item.variant
      }));

      const response = await fetch('/api/whatsapp/generate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'bulk',
          storeId: storeInfo.id,
          items,
          customerInfo: {
            name: customerInfo.name || undefined,
            phone: customerInfo.phone || undefined,
            address: customerInfo.address || undefined,
            notes: customerInfo.notes || undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate WhatsApp URL');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error generating WhatsApp URL:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const whatsappUrl = await generateWhatsAppUrl();
      window.open(whatsappUrl, '_blank');

      // Reset form after successful checkout
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      clearCart();
    } catch (error) {
      alert('Failed to generate WhatsApp message. Please try again.');
    }
  };

  const handleQuickInquiry = async (productId: string, customMessage?: string) => {
    try {
      const response = await fetch('/api/whatsapp/generate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'inquiry',
          productId,
          customMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate inquiry URL');
      }

      const data = await response.json();
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error generating inquiry URL:', error);
      alert('Failed to open WhatsApp. Please try again.');
    }
  };

  // Save cart to localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(`cart_${storeInfo.id}`, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(`cart_${storeInfo.id}`);
    }
  }, [cartItems, storeInfo.id]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${storeInfo.id}`);
    if (savedCart && initialItems.length === 0) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading saved cart:', error);
      }
    }
  }, [storeInfo.id, initialItems.length]);

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 z-40 flex items-center justify-center transition-all duration-200 hover:scale-110"
        disabled={isLoading}
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {getCartItemCount() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {getCartItemCount()}
          </span>
        )}
      </button>

      {/* Quick WhatsApp Inquiry Button */}
      <button
        onClick={() => handleQuickInquiry('general', `Hello ${storeInfo.name}! I'm interested in your products.`)}
        className="fixed bottom-6 right-24 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40 flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
      </button>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div>
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                  <p className="text-sm text-gray-600">{storeInfo.name}</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={`${item.id}-${item.variant || ''}`} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{item.name}</h3>
                            {item.variant && (
                              <p className="text-xs text-gray-500">Variant: {item.variant}</p>
                            )}
                          </div>
                          <button
                            onClick={() => updateQuantity(item.id, 0)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{formatPrice(item.price)}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-green-600">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={clearCart}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="flex-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                          Checkout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Form Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCheckoutOpen(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Complete Your Order</h2>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="08123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder="Enter your complete address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="Special instructions for your order"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg text-green-600">{formatPrice(getCartTotal())}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  You will be redirected to WhatsApp to complete your order. Payment instructions will be provided via chat.
                </p>
                <button
                  onClick={handleWhatsAppCheckout}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      Send Order via WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}