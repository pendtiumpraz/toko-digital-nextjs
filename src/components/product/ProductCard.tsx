'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon,
  PlayIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Card, Badge, Button, VideoEmbed } from '@/components/ui';
import { formatPrice, truncateText } from '@/lib/utils';

export interface Product {
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

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'detailed';
  showVideo?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isWishlisted?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  variant = 'default',
  showVideo = true,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isWishlisted = false,
  className = '',
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const CompactCard = () => (
    <motion.div
      className={`group relative bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 ${className}`}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <img
          src={product.images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && <Badge variant="success">New</Badge>}
          {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
          {!product.inStock && <Badge variant="secondary">Out of Stock</Badge>}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleWishlist?.(product)}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => onQuickView?.(product)}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
          >
            <EyeIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 mb-1">
          {truncateText(product.name, 40)}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onAddToCart?.(product)}
            disabled={!product.inStock}
            className="text-xs"
          >
            <ShoppingCartIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const DetailedCard = () => (
    <Card
      className={`group relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Image Gallery */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Image Navigation */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={() => handleImageNavigation('prev')}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleImageNavigation('next')}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Video Play Button */}
          {product.videoUrl && showVideo && (
            <button
              onClick={() => setShowVideoModal(true)}
              className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <PlayIcon className="w-4 h-4" />
            </button>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && <Badge variant="success">New</Badge>}
            {product.isFeatured && <Badge variant="gradient">Featured</Badge>}
            {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
            {!product.inStock && <Badge variant="secondary">Out of Stock</Badge>}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleWishlist?.(product)}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
            >
              {isWishlisted ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickView?.(product)}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
            >
              <EyeIcon className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Image Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {product.category && (
            <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
              {product.category}
            </span>
          )}

          <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-600 mb-3">
              {truncateText(product.description, 100)}
            </p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">{renderStars(product.rating)}</div>
              <span className="text-sm text-gray-600">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.stockCount && product.stockCount < 10 && (
              <span className="text-xs text-orange-600 font-medium">
                Only {product.stockCount} left
              </span>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            className="w-full"
            onClick={() => onAddToCart?.(product)}
            disabled={!product.inStock}
            variant={product.inStock ? 'default' : 'secondary'}
            leftIcon={<ShoppingCartIcon className="h-4 w-4" />}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && product.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-4xl aspect-video">
            <VideoEmbed
              url={product.videoUrl}
              className="w-full h-full"
              autoplay={true}
            />
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/80 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Card>
  );

  if (variant === 'compact') return <CompactCard />;

  return <DetailedCard />;
}