'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  ChevronUpIcon
} from '@heroicons/react/24/solid';
import {
  ShoppingCartIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  GlobeAltIcon,
  CreditCardIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  PresentationChartLineIcon,
  Bars3Icon,
  XMarkIcon as XIcon
} from '@heroicons/react/24/outline';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    name: 'Katalog Digital Premium',
    description: 'Upload unlimited produk dengan gambar HD, video YouTube, dan integrasi Google Drive.',
    icon: ShoppingCartIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'WhatsApp Direct Sales',
    description: 'Konversi pengunjung jadi pembeli dengan checkout langsung ke WhatsApp tanpa ribet.',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Financial Dashboard',
    description: 'Analisa bisnis real-time dengan grafik interaktif, laporan keuangan, dan export Excel.',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'AI-Powered Features',
    description: 'Generate deskripsi produk, landing page, dan konten marketing dengan AI terbaru.',
    icon: SparklesIcon,
    color: 'bg-pink-500',
  },
  {
    name: 'Multi-Store Management',
    description: 'Kelola multiple toko dengan satu dashboard. Perfect untuk reseller dan dropshipper.',
    icon: GlobeAltIcon,
    color: 'bg-indigo-500',
  },
  {
    name: 'Smart Inventory',
    description: 'Stock tracking otomatis, low stock alert, dan prediksi kebutuhan inventory.',
    icon: CreditCardIcon,
    color: 'bg-yellow-500',
  },
];

const stats = [
  { id: 1, name: 'Active Stores', value: '5,000+' },
  { id: 2, name: 'Total Transactions', value: '2M+' },
  { id: 3, name: 'GMV Processed', value: '50B+' },
  { id: 4, name: 'Happy Merchants', value: '99%' },
];

const testimonials = [
  {
    content: "dibeli.my.id mengubah bisnis saya! Dari jualan manual di WA jadi punya toko online profesional. Sales naik 300% dalam 3 bulan!",
    author: "Siti Nurhaliza",
    role: "Owner @BajuAnakLucu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    content: "Fitur AI untuk bikin deskripsi produk sangat membantu. Hemat waktu banget! Financial tracking-nya juga detail, gak perlu excel lagi.",
    author: "Ahmad Fauzi",
    role: "CEO @GadgetStore.id",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    content: "Sebagai dropshipper, fitur multi-store sangat membantu manage semua toko dalam satu dashboard. Super efisien!",
    author: "Dewi Kartika",
    role: "Dropshipper Pro",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
  },
];

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    priceMonthly: 99000,
    priceYearly: 990000,
    description: 'Perfect untuk UMKM yang baru mulai online.',
    features: [
      '100 Produk',
      '1 GB Storage',
      'Subdomain Gratis',
      'WhatsApp Integration',
      'Basic Analytics',
      'Email Support',
      '1 Staff Account',
      'Mobile Responsive',
    ],
    notIncluded: [
      'Custom Domain',
      'AI Features',
      'API Access',
      'Priority Support',
    ],
    cta: 'Start Free Trial',
    mostPopular: false,
  },
  {
    name: 'Professional',
    id: 'tier-professional',
    priceMonthly: 299000,
    priceYearly: 2990000,
    description: 'Untuk bisnis yang sedang scaling up.',
    features: [
      '1000 Produk',
      '10 GB Storage',
      'Custom Domain',
      'WhatsApp Business API',
      'Advanced Analytics',
      'Priority Support 24/7',
      '10 Staff Accounts',
      'Email Marketing',
      'Abandoned Cart Recovery',
      'Multi-Currency',
      'API Access',
      'Custom Theme',
    ],
    notIncluded: [
      'AI Features',
      'Unlimited Products',
    ],
    cta: 'Start Free Trial',
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    priceMonthly: 999000,
    priceYearly: 9990000,
    description: 'Solusi lengkap untuk bisnis besar.',
    features: [
      'Unlimited Products',
      'Unlimited Storage',
      'Multiple Custom Domains',
      'WhatsApp Business API',
      'AI-Powered Everything',
      'Dedicated Support',
      'Unlimited Staff',
      'Custom Integration',
      'White Label Option',
      'Advanced Security',
      'Custom Development',
      'Training & Onboarding',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    mostPopular: false,
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Animation controls
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Navbar */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}>
        <nav className="flex items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                dibeli.my.id
              </span>
            </Link>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-8">
            {['Features', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-semibold leading-6 transition-colors ${
                  scrolled ? 'text-gray-900 hover:text-blue-600' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4">
            <Link
              href="/login"
              className={`text-sm font-semibold leading-6 transition-colors ${
                scrolled ? 'text-gray-900 hover:text-blue-600' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <RocketLaunchIcon className="w-4 h-4" />
              Start Free Trial
            </Link>
          </div>
        </nav>

        {/* Mobile menu */}
        <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  dibeli.my.id
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {['Features', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
                    <Link
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="mt-2 block rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-center text-base font-semibold text-white shadow-lg"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/20">
                <SparklesIcon className="w-4 h-4" />
                Powered by AI Technology
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
            >
              Platform Toko Online
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                #1 di Indonesia
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl"
            >
              Bangun toko online profesional dalam 5 menit. Kelola produk, inventory, keuangan, dan customer dalam satu platform. Dilengkapi AI untuk otomasi marketing dan penjualan.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <RocketLaunchIcon className="w-5 h-5" />
                Mulai Gratis 14 Hari
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <PlayIcon className="w-5 h-5 text-blue-600" />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex items-center justify-center gap-8 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-500" />
                Setup in 5 minutes
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-500" />
                Cancel anytime
              </div>
            </motion.div>
          </motion.div>

          {/* Hero image/mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 sm:mt-24"
          >
            <div className="relative mx-auto max-w-6xl">
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-1">
                <div className="rounded-xl bg-white p-4">
                  <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <DevicePhoneMobileIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 font-semibold">Dashboard Preview</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.dl
              ref={ref}
              initial="hidden"
              animate={controls}
              variants={staggerContainer}
              className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4"
            >
              {stats.map((stat) => (
                <motion.div key={stat.id} variants={fadeInUp}>
                  <dt className="text-base leading-7 text-blue-100">{stat.name}</dt>
                  <dd className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{stat.value}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-base font-semibold leading-7 text-blue-600">Everything You Need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Fitur Lengkap untuk Sukses Online
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Platform all-in-one dengan teknologi terkini. Dari AI-powered marketing hingga analisa bisnis real-time.
              </p>
            </motion.div>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl transform scale-95 group-hover:scale-100 transition-transform duration-300" />
                  <div className="relative bg-white rounded-2xl p-8 shadow-lg ring-1 ring-gray-200/50 hover:shadow-2xl transition-shadow duration-300">
                    <div className={`inline-flex rounded-lg p-3 ${feature.color} text-white ring-4 ring-white`}>
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-600">{feature.description}</p>
                    <div className="mt-4">
                      <Link href="/register" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        Learn more <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Dipercaya 5,000+ Merchant
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="flex-1">
                  <p className="text-gray-700">"{testimonial.content}"</p>
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.avatar}
                    alt={testimonial.author}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Investasi Terbaik untuk Bisnis Anda
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative flex rounded-full bg-gray-100 p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`relative rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`relative rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Yearly
                <span className="ml-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier, tierIdx) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: tierIdx * 0.1 }}
                className={`relative rounded-3xl p-8 xl:p-10 ${
                  tier.mostPopular
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105 z-10'
                    : 'bg-white ring-1 ring-gray-200 shadow-lg'
                }`}
              >
                {tier.mostPopular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32">
                    <div className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1 text-center text-sm font-semibold text-white shadow-lg">
                      BEST VALUE
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-x-4">
                  <h3 className={`text-xl font-bold ${tier.mostPopular ? 'text-white' : 'text-gray-900'}`}>
                    {tier.name}
                  </h3>
                </div>
                <p className={`mt-4 text-sm leading-6 ${tier.mostPopular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className={`text-4xl font-bold tracking-tight ${tier.mostPopular ? 'text-white' : 'text-gray-900'}`}>
                    {formatPrice(billingPeriod === 'monthly' ? tier.priceMonthly : tier.priceYearly / 12)}
                  </span>
                  <span className={`text-sm font-semibold leading-6 ${tier.mostPopular ? 'text-blue-100' : 'text-gray-600'}`}>
                    /month
                  </span>
                </p>
                {billingPeriod === 'yearly' && (
                  <p className={`text-sm ${tier.mostPopular ? 'text-blue-100' : 'text-gray-500'}`}>
                    Billed {formatPrice(tier.priceYearly)} yearly
                  </p>
                )}

                <ul role="list" className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className={`h-6 w-5 flex-none ${tier.mostPopular ? 'text-white' : 'text-blue-600'}`}
                        aria-hidden="true"
                      />
                      <span className={`text-sm ${tier.mostPopular ? 'text-white' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {tier.notIncluded.map((feature) => (
                    <li key={feature} className="flex gap-x-3 opacity-50">
                      <XMarkIcon
                        className={`h-6 w-5 flex-none ${tier.mostPopular ? 'text-blue-200' : 'text-gray-400'}`}
                        aria-hidden="true"
                      />
                      <span className={`text-sm line-through ${tier.mostPopular ? 'text-blue-100' : 'text-gray-400'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-8 block w-full rounded-full px-4 py-3 text-center text-sm font-semibold transition-all ${
                    tier.mostPopular
                      ? 'bg-white text-blue-600 hover:bg-gray-50 shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Siap Membawa Bisnis Anda ke Level Berikutnya?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Bergabung dengan 5,000+ merchant yang telah meningkatkan penjualan mereka dengan dibeli.my.id
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link href="/demo" className="text-lg font-semibold leading-6 text-white hover:text-blue-100">
                Request Demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
          <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
            {[
              { name: 'About', href: '#' },
              { name: 'Blog', href: '#' },
              { name: 'Features', href: '#features' },
              { name: 'Pricing', href: '#pricing' },
              { name: 'Contact', href: '#' },
              { name: 'Privacy', href: '/privacy' },
              { name: 'Terms', href: '/terms' },
            ].map((item) => (
              <div key={item.name} className="pb-6">
                <Link href={item.href} className="text-sm leading-6 text-gray-400 hover:text-white">
                  {item.name}
                </Link>
              </div>
            ))}
          </nav>
          <div className="mt-10 flex justify-center space-x-10">
            {[
              { name: 'Facebook', icon: '📘' },
              { name: 'Instagram', icon: '📷' },
              { name: 'Twitter', icon: '🐦' },
              { name: 'LinkedIn', icon: '💼' },
            ].map((item) => (
              <Link key={item.name} href="#" className="text-gray-400 hover:text-white">
                <span className="text-2xl">{item.icon}</span>
              </Link>
            ))}
          </div>
          <p className="mt-10 text-center text-xs leading-5 text-gray-400">
            &copy; 2025 dibeli.my.id. All rights reserved. Built with ❤️ in Indonesia.
          </p>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <ChevronUpIcon className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
}