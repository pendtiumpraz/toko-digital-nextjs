'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  PlayIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

import {
  ThemeProvider,
  ThemeSwitcher,
  ThemedHero,
  ProductCard,
  FloatingWhatsApp,
  WhatsAppCheckoutV2,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  VideoEmbed,
  Modal,
} from '@/components';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  videoUrl?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stockCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

// Sample products data
const sampleProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation.',
    price: 299000,
    originalPrice: 399000,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Electronics',
    rating: 4.8,
    reviewCount: 324,
    inStock: true,
    stockCount: 15,
    isNew: true,
    isFeatured: false,
    tags: ['Bluetooth', 'Noise Canceling', 'Premium'],
  },
  {
    id: '2',
    name: 'Smart Watch Series 8',
    description: 'Stay connected and track your health with the latest smart watch technology.',
    price: 3500000,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=400&fit=crop',
    ],
    videoUrl: 'https://vimeo.com/76979871',
    category: 'Wearables',
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    stockCount: 8,
    isNew: false,
    isFeatured: true,
    tags: ['Health', 'Fitness', 'Smart'],
  },
  {
    id: '3',
    name: 'Gaming Mechanical Keyboard',
    description: 'Professional gaming keyboard with RGB lighting and mechanical switches.',
    price: 1250000,
    originalPrice: 1500000,
    images: [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop',
    ],
    category: 'Gaming',
    rating: 4.7,
    reviewCount: 89,
    inStock: false,
    stockCount: 0,
    isNew: false,
    isFeatured: false,
    tags: ['Gaming', 'RGB', 'Mechanical'],
  },
];

export default function DemoPage() {
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const toggleWishlist = (product: Product) => {
    const newWishlisted = new Set(wishlistedItems);
    if (newWishlisted.has(product.id)) {
      newWishlisted.delete(product.id);
    } else {
      newWishlisted.add(product.id);
    }
    setWishlistedItems(newWishlisted);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Added to cart:', product);
    // In a real app, this would add to cart state
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <ThemeProvider defaultTheme="modern">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  dibeli.my.id Demo
                </h1>
                <Badge variant="gradient" className="ml-3">
                  UI/UX Showcase
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <ThemeSwitcher variant="inline" />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <ThemedHero
          title="Beautiful E-commerce UI"
          subtitle="Modern Design System"
          description="Experience the power of modern UI/UX design with our comprehensive component library. Built with React, TypeScript, Tailwind CSS, and Framer Motion for stunning user experiences."
          primaryCTA={{
            text: "Explore Components",
            href: "#components"
          }}
          secondaryCTA={{
            text: "Watch Demo",
            href: "#video"
          }}
          features={[
            "🎨 3 Beautiful Themes",
            "📱 Mobile-First Design",
            "🚀 Smooth Animations"
          ]}
        />

        {/* Theme Switcher Demo */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">
                Choose Your Theme
              </h2>
              <p className="body-text max-w-3xl mx-auto">
                Switch between three carefully crafted themes to match your brand identity.
                Each theme offers unique colors, typography, and visual styles.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ThemeSwitcher variant="cards" showPreview={true} />
            </div>
          </div>
        </section>

        {/* Components Showcase */}
        <section id="components" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">
                UI Components Gallery
              </h2>
              <p className="body-text max-w-3xl mx-auto">
                Explore our comprehensive collection of modern UI components designed
                for e-commerce excellence.
              </p>
            </div>

            {/* Buttons Demo */}
            <Card className="mb-8 p-6">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="whatsapp" leftIcon={<ShoppingCartIcon className="w-4 h-4" />}>
                    WhatsApp
                  </Button>
                  <Button variant="gradient" rightIcon={<SparklesIcon className="w-4 h-4" />}>
                    Gradient
                  </Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Cards Demo */}
            <Card className="mb-8 p-6">
              <CardHeader>
                <CardTitle>Product Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mobile-first-grid">
                  {sampleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="detailed"
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={toggleWishlist}
                      onQuickView={handleQuickView}
                      isWishlisted={wishlistedItems.has(product.id)}
                    />
                  ))}
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold mb-4">Compact Variant</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sampleProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={`compact-${product.id}`}
                        product={product}
                        variant="compact"
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={toggleWishlist}
                        isWishlisted={wishlistedItems.has(product.id)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Embed Demo */}
            <Card className="mb-8 p-6">
              <CardHeader>
                <CardTitle>Video Embedding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">YouTube Video</h4>
                    <VideoEmbed
                      url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="aspect-video"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Vimeo Video</h4>
                    <VideoEmbed
                      url="https://vimeo.com/76979871"
                      className="aspect-video"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Demo */}
            <Card className="mb-8 p-6">
              <CardHeader>
                <CardTitle>Interactive Elements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Button
                    onClick={() => setShowVideoModal(true)}
                    leftIcon={<PlayIcon className="w-4 h-4" />}
                  >
                    Open Video Modal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => alert('Button clicked!')}
                    rightIcon={<HeartIcon className="w-4 h-4" />}
                  >
                    Interactive Button
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <StarIcon className="w-5 h-5" />
                      <span className="font-semibold">Hover Effect</span>
                    </div>
                    <p className="text-sm opacity-90">
                      This card responds to hover and tap interactions
                    </p>
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon className="w-5 h-5" />
                      <span className="font-semibold">Floating Animation</span>
                    </div>
                    <p className="text-sm opacity-90">
                      Smooth floating animation with Framer Motion
                    </p>
                  </motion.div>

                  <div className="p-4 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartIcon className="w-5 h-5" />
                      <span className="font-semibold">Gradient Card</span>
                    </div>
                    <p className="text-sm opacity-90">
                      Beautiful gradient backgrounds for visual appeal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">
                Modern E-commerce Features
              </h2>
              <p className="body-text max-w-3xl mx-auto">
                Everything you need to create a professional online store with
                exceptional user experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">WhatsApp Integration</h3>
                <p className="text-gray-600">
                  Seamless checkout flow that directs customers to WhatsApp for easy ordering
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Support</h3>
                <p className="text-gray-600">
                  Embed YouTube and Vimeo videos in product cards for rich media experiences
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Theme Customization</h3>
                <p className="text-gray-600">
                  Three professionally designed themes to match any brand identity
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Store?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start building beautiful e-commerce experiences with our modern UI components
              and theme system. Professional, responsive, and user-friendly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="gradient">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300">
                View Documentation
              </Button>
            </div>
          </div>
        </footer>

        {/* Floating Components */}
        <FloatingWhatsApp
          phoneNumber="6281234567890"
          storeName="dibeli.my.id Demo"
          position="bottom-right"
          theme="green"
          size="md"
        />

        <WhatsAppCheckoutV2
          storeName="dibeli.my.id Demo Store"
          storePhone="6281234567890"
        />

        {/* Modals */}
        <Modal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          title="Demo Video"
          size="xl"
        >
          <VideoEmbed
            url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            className="aspect-video"
            autoplay={true}
          />
        </Modal>

        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title="Product Quick View"
          size="xl"
        >
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-green-600">
                    Rp {selectedProduct.price.toLocaleString('id-ID')}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      Rp {selectedProduct.originalPrice.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(selectedProduct)}
                  leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ThemeProvider>
  );
}