'use client';

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import {
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

interface Store {
  id: string
  name: string
  description?: string | null
  logo?: string | null
  whatsappNumber?: string
  email?: string | null
  city?: string | null
  state?: string | null
  currency?: string
  products?: Product[]
}

interface Product {
  id: string
  name: string
  description: string
  price: any // Handle Decimal, number, and string types from Prisma
  stock: number
  slug: string
  images?: any[] | string
}

interface StorePageClientProps {
  store: Store
  subdomain: string
}

export default function StorePageClient({ store, subdomain }: StorePageClientProps) {
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(new Set())

  const toggleWishlist = (productId: string) => {
    const newWishlisted = new Set(wishlistedItems)
    if (newWishlisted.has(productId)) {
      newWishlisted.delete(productId)
    } else {
      newWishlisted.add(productId)
    }
    setWishlistedItems(newWishlisted)
  }

  const getProductImage = (product: Product) => {
    if (product.images) {
      // If images is a string array
      if (Array.isArray(product.images) && typeof product.images[0] === 'string') {
        return product.images[0];
      }
      // If images is an object array with url property
      if (Array.isArray(product.images) && product.images[0] && typeof product.images[0] === 'object') {
        return (product.images[0] as any).url || (product.images[0] as any).src;
      }
      // If images is a single string
      if (typeof product.images === 'string') {
        return product.images;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      {/* Enhanced Store Header */}
      <div className="relative bg-white/70 backdrop-blur-xl shadow-2xl shadow-black/5 border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-6"
            >
              {store.logo && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="h-20 w-20 rounded-2xl shadow-xl ring-4 ring-white/50"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20" />
                </motion.div>
              )}
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
                >
                  {store.name}
                </motion.h1>
                {store.description && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-gray-600 mt-2 text-lg leading-relaxed"
                  >
                    {store.description}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Enhanced Store Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {store.whatsappNumber && (
                <motion.a
                  whileHover={{ scale: 1.02, y: -2 }}
                  href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl hover:bg-green-100/80 transition-all duration-300 group"
                >
                  <div className="p-2 bg-green-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">WhatsApp</p>
                    <p className="text-sm text-green-600">{store.whatsappNumber}</p>
                  </div>
                </motion.a>
              )}
              {store.email && (
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-center gap-3 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl"
                >
                  <div className="p-2 bg-blue-500 rounded-xl text-white">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Email</p>
                    <p className="text-sm text-blue-600">{store.email}</p>
                  </div>
                </motion.div>
              )}
              {(store.city || store.state) && (
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-center gap-3 p-4 bg-purple-50/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl"
                >
                  <div className="p-2 bg-purple-500 rounded-xl text-white">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-800">Lokasi</p>
                    <p className="text-sm text-purple-600">
                      {[store.city, store.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Produk Kami
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
        </motion.div>

        {store.products && store.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {store.products.map((product, index) => {
              const productImage = getProductImage(product);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden border border-white/20">
                    <Link href={`/store/${subdomain}/product/${product.slug}`}>
                      <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden">
                        {productImage ? (
                          <>
                            <img
                              src={productImage}
                              alt={product.name}
                              className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}

                        {/* Action Buttons Overlay */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            variant="glass"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(product.id);
                            }}
                            className="h-8 w-8"
                          >
                            <HeartIcon
                              className={`h-4 w-4 ${
                                wishlistedItems.has(product.id) ? 'fill-red-500 text-red-500' : ''
                              }`}
                            />
                          </Button>
                          <Button
                            size="icon"
                            variant="glass"
                            onClick={(e) => {
                              e.preventDefault();
                              if (navigator.share) {
                                navigator.share({
                                  title: product.name,
                                  url: window.location.href + '/product/' + product.slug
                                });
                              }
                            }}
                            className="h-8 w-8"
                          >
                            <ShareIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Link>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <StarIcon className="h-4 w-4 fill-gray-300 text-gray-300" />
                          <span className="text-xs text-gray-500 ml-1">(4.0)</span>
                        </div>
                        {product.stock > 0 ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Stok: {product.stock}
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                            Habis
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: store.currency || 'IDR'
                          }).format(Number(product.price))}
                        </span>

                        <Button
                          size="sm"
                          variant="whatsapp"
                          onClick={() => {
                            const message = `Halo, saya tertarik dengan produk ${product.name} dari toko ${store.name}. Apakah masih tersedia?`;
                            window.open(`https://wa.me/${store.whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          leftIcon={<ShoppingCartIcon className="h-4 w-4" />}
                        >
                          Beli
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 mx-auto max-w-md border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada produk</h3>
              <p className="text-gray-600 leading-relaxed">Produk akan segera ditambahkan. Silakan kembali lagi nanti!</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced WhatsApp Float Button */}
      <AnimatePresence>
        {store.whatsappNumber && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", duration: 0.6, delay: 1 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.a
              href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=Halo, saya tertarik dengan produk di toko ${store.name}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-2xl shadow-green-500/40 hover:shadow-3xl hover:shadow-green-500/60 transition-all duration-300 group overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              {/* WhatsApp Icon */}
              <svg className="h-8 w-8 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>

              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-2xl animate-ping bg-green-400 opacity-20" />

              {/* Tooltip */}
              <div className="absolute right-full mr-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Chat via WhatsApp
                <div className="absolute top-1/2 left-full w-0 h-0 border-l-4 border-l-gray-900 border-y-4 border-y-transparent transform -translate-y-1/2" />
              </div>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}