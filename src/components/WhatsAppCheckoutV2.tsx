'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Input, Badge, Modal } from '@/components/ui';
import { formatPrice } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  variant?: string;
  notes?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

interface WhatsAppCheckoutV2Props {
  storePhone?: string;
  storeName?: string;
  storeAddress?: string;
  paymentMethods?: string[];
  shippingOptions?: { name: string; price: number; duration: string }[];
  minimumOrder?: number;
  freeShippingThreshold?: number;
}

export default function WhatsAppCheckoutV2({
  storePhone = '6281234567890',
  storeName = 'Toko Digital',
  storeAddress = 'Jl. Digital No. 123, Jakarta',
  paymentMethods = ['Transfer Bank', 'E-Wallet', 'COD'],
  shippingOptions = [
    { name: 'Regular', price: 10000, duration: '3-5 hari' },
    { name: 'Express', price: 20000, duration: '1-2 hari' },
    { name: 'Same Day', price: 35000, duration: 'Hari ini' },
  ],
  minimumOrder = 50000,
  freeShippingThreshold = 200000,
}: WhatsAppCheckoutV2Props) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'review'>('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 299000,
      originalPrice: 399000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      variant: 'Black'
    },
    {
      id: '2',
      name: 'Smart Watch Series 8',
      price: 3500000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      variant: 'Space Gray'
    }
  ]);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : selectedShipping.price;
  const total = subtotal - discount + shippingCost;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const applyCoupon = () => {
    // Mock coupon validation
    if (couponCode.toLowerCase() === 'welcome10') {
      setAppliedCoupon({ code: couponCode, discount: subtotal * 0.1 });
      setCouponCode('');
    }
  };

  const generateWhatsAppMessage = () => {
    let message = `🛒 *Pesanan Baru dari ${storeName}*\\n\\n`;

    message += `👤 *Informasi Pelanggan:*\\n`;
    message += `Nama: ${customerInfo.name}\\n`;
    message += `No. HP: ${customerInfo.phone}\\n`;
    if (customerInfo.email) message += `Email: ${customerInfo.email}\\n`;
    message += `Alamat: ${customerInfo.address}\\n`;
    message += `Kota: ${customerInfo.city}\\n`;
    message += `Kode Pos: ${customerInfo.postalCode}\\n`;
    if (customerInfo.notes) message += `Catatan: ${customerInfo.notes}\\n`;

    message += `\\n📦 *Detail Pesanan:*\\n`;
    message += `================================\\n`;

    cartItems.forEach(item => {
      message += `*${item.name}*\\n`;
      if (item.variant) message += `Varian: ${item.variant}\\n`;
      message += `${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\\n`;
      if (item.notes) message += `Catatan: ${item.notes}\\n`;
      message += `\\n`;
    });

    message += `================================\\n`;
    message += `Subtotal: ${formatPrice(subtotal)}\\n`;

    if (appliedCoupon) {
      message += `Diskon (${appliedCoupon.code}): -${formatPrice(appliedCoupon.discount)}\\n`;
    }

    message += `Ongkir (${selectedShipping.name}): ${shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}\\n`;
    message += `*TOTAL: ${formatPrice(total)}*\\n\\n`;

    message += `🚚 *Pengiriman:* ${selectedShipping.name} (${selectedShipping.duration})\\n`;
    message += `💳 *Pembayaran:* ${selectedPayment}\\n\\n`;

    message += `Terima kasih telah berbelanja! Tim kami akan segera menghubungi Anda untuk konfirmasi pesanan. 🙏`;

    return message;
  };

  const handleCheckout = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${storePhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Reset everything
    setIsCartOpen(false);
    setCheckoutStep('cart');
    setCartItems([]);
    setCustomerInfo({
      name: '', phone: '', email: '', address: '', city: '', postalCode: '', notes: ''
    });
  };

  const CartStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold">Keranjang Belanja</h2>
        <button
          onClick={() => setIsCartOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Keranjang Anda kosong</p>
            <p className="text-gray-400 text-sm">Tambahkan produk untuk melanjutkan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-50 rounded-xl p-4"
              >
                <div className="flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600">Varian: {item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Coupon Section */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Kode kupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={applyCoupon}
                  variant="outline"
                  disabled={!couponCode}
                >
                  Gunakan
                </Button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="success">
                    {appliedCoupon.code} - {formatPrice(appliedCoupon.discount)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="border-t p-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            {total < minimumOrder && (
              <p className="text-orange-600 text-sm">
                Minimum pembelian {formatPrice(minimumOrder)}
              </p>
            )}
            {subtotal >= freeShippingThreshold && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircleIcon className="h-4 w-4" />
                Gratis ongkir!
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => setCheckoutStep('shipping')}
            disabled={total < minimumOrder}
            variant="whatsapp"
            rightIcon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
          >
            Lanjut ke Checkout
          </Button>
        </div>
      )}
    </div>
  );

  const ShippingStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCheckoutStep('cart')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <h2 className="text-xl font-bold">Informasi Pengiriman</h2>
        </div>
        <button
          onClick={() => setIsCartOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Customer Info */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Informasi Pembeli
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Nama Lengkap *"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              placeholder="Masukkan nama lengkap"
            />
            <Input
              label="No. WhatsApp *"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              placeholder="08123456789"
              leftIcon={<PhoneIcon className="h-4 w-4" />}
            />
            <Input
              label="Email (Opsional)"
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              placeholder="email@example.com"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5" />
            Alamat Pengiriman
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Alamat Lengkap *"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              placeholder="Jl. Contoh No. 123, RT/RW"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Kota *"
                value={customerInfo.city}
                onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                placeholder="Jakarta"
              />
              <Input
                label="Kode Pos *"
                value={customerInfo.postalCode}
                onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                placeholder="12345"
              />
            </div>
            <Input
              label="Catatan (Opsional)"
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
              placeholder="Catatan untuk pengiriman"
            />
          </div>
        </div>

        {/* Shipping Options */}
        <div>
          <h3 className="font-semibold mb-4">Pilih Pengiriman</h3>
          <div className="space-y-3">
            {shippingOptions.map((option) => (
              <div
                key={option.name}
                onClick={() => setSelectedShipping(option)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedShipping.name === option.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{option.name}</p>
                    <p className="text-sm text-gray-600">{option.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {subtotal >= freeShippingThreshold && option.name === 'Regular'
                        ? 'GRATIS'
                        : formatPrice(option.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t p-6">
        <Button
          className="w-full"
          onClick={() => setCheckoutStep('payment')}
          disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city || !customerInfo.postalCode}
        >
          Lanjut ke Pembayaran
        </Button>
      </div>
    </div>
  );

  const PaymentStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCheckoutStep('shipping')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <h2 className="text-xl font-bold">Metode Pembayaran</h2>
        </div>
        <button
          onClick={() => setIsCartOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Pilih Metode Pembayaran
          </h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method}
                onClick={() => setSelectedPayment(method)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPayment === method
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">{method}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t p-6">
        <Button
          className="w-full"
          onClick={() => setCheckoutStep('review')}
        >
          Review Pesanan
        </Button>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCheckoutStep('payment')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <h2 className="text-xl font-bold">Review Pesanan</h2>
        </div>
        <button
          onClick={() => setIsCartOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Order Summary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Ringkasan Pesanan</h3>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.quantity} x {formatPrice(item.price)}</p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Diskon ({appliedCoupon.code}):</span>
                <span>-{formatPrice(appliedCoupon.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Ongkir ({selectedShipping.name}):</span>
              <span>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </Card>

        {/* Customer & Shipping Info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Informasi Pengiriman</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Nama:</strong> {customerInfo.name}</p>
            <p><strong>No. HP:</strong> {customerInfo.phone}</p>
            {customerInfo.email && <p><strong>Email:</strong> {customerInfo.email}</p>}
            <p><strong>Alamat:</strong> {customerInfo.address}, {customerInfo.city} {customerInfo.postalCode}</p>
            <p><strong>Pengiriman:</strong> {selectedShipping.name} ({selectedShipping.duration})</p>
            <p><strong>Pembayaran:</strong> {selectedPayment}</p>
          </div>
        </Card>
      </div>

      <div className="border-t p-6">
        <Button
          className="w-full"
          onClick={handleCheckout}
          variant="whatsapp"
          size="lg"
          leftIcon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
        >
          Kirim Pesanan via WhatsApp
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl z-40 flex items-center justify-center transition-all duration-300"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {cartItems.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
          >
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          </motion.span>
        )}
      </motion.button>

      {/* Enhanced Cart Sidebar */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        size="lg"
        showCloseButton={false}
      >
        <div className="h-[80vh]">
          <AnimatePresence mode="wait">
            {checkoutStep === 'cart' && <CartStep />}
            {checkoutStep === 'shipping' && <ShippingStep />}
            {checkoutStep === 'payment' && <PaymentStep />}
            {checkoutStep === 'review' && <ReviewStep />}
          </AnimatePresence>
        </div>
      </Modal>
    </>
  );
}