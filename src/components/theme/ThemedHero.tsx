'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui';

interface ThemedHeroProps {
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  videoUrl?: string;
  backgroundImage?: string;
  features?: string[];
}

export default function ThemedHero({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  videoUrl,
  backgroundImage,
  features = []
}: ThemedHeroProps) {
  const { theme, themeConfig } = useTheme();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Modern Minimalist Theme
  if (theme === 'modern') {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 60%), radial-gradient(circle at 50% 50%, #06b6d4 0%, transparent 40%)' }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.p
              variants={itemVariants}
              className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-4"
            >
              {subtitle}
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: themeConfig.fonts.heading }}
            >
              {title}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: themeConfig.fonts.body }}
            >
              {description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                rightIcon={<ArrowRightIcon className="w-5 h-5" />}
              >
                {primaryCTA.text}
              </Button>

              {secondaryCTA && (
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                  leftIcon={<PlayIcon className="w-5 h-5" />}
                >
                  {secondaryCTA.text}
                </Button>
              )}
            </motion.div>

            {features.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-2xl shadow-blue-500/10 border border-white/30 hover:border-white/50 transition-all duration-300"
                  >
                    <p className="text-gray-700 font-medium">{feature}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // Colorful Playful Theme
  if (theme === 'colorful') {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full opacity-20 blur-xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-4"
            >
              <p className="text-sm font-bold tracking-wide uppercase">
                {subtitle}
              </p>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{
                fontFamily: themeConfig.fonts.heading,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: themeConfig.fonts.body }}
            >
              {description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 text-lg rounded-2xl"
                rightIcon={<ArrowRightIcon className="w-5 h-5" />}
              >
                {primaryCTA.text}
              </Button>

              {secondaryCTA && (
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg rounded-2xl border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                  leftIcon={<PlayIcon className="w-5 h-5" />}
                >
                  {secondaryCTA.text}
                </Button>
              )}
            </motion.div>

            {features.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-pink-100"
                  >
                    <p className="text-gray-700 font-medium">{feature}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // Professional Corporate Theme
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.p
            variants={itemVariants}
            className="text-sm font-semibold text-blue-400 tracking-wide uppercase mb-4 opacity-80"
          >
            {subtitle}
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: themeConfig.fonts.heading }}
          >
            {title}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: themeConfig.fonts.body }}
          >
            {description}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg border border-blue-500"
              rightIcon={<ArrowRightIcon className="w-5 h-5" />}
            >
              {primaryCTA.text}
            </Button>

            {secondaryCTA && (
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-gray-400 text-gray-300 hover:bg-gray-800 hover:border-gray-300"
                leftIcon={<PlayIcon className="w-5 h-5" />}
              >
                {secondaryCTA.text}
              </Button>
            )}
          </motion.div>

          {features.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-2xl border border-gray-700"
                >
                  <p className="text-gray-300 font-medium">{feature}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}