import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/store/templates - Get available store templates
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication (optional for template browsing, but we'll verify for user-specific features)
    const authHeader = request.headers.get('authorization');
    let userPlan = 'FREE';

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded) {
        // Get user's subscription plan to determine template access
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            subscription: {
              select: {
                plan: true,
                status: true
              }
            }
          }
        });

        if (user?.subscription?.status === 'ACTIVE') {
          userPlan = user.subscription.plan;
        }
      }
    }

    // Template definitions (in a real app, these might come from a database)
    const templates = [
      {
        id: 'modern-1',
        name: 'Modern Marketplace',
        description: 'Clean and contemporary design perfect for modern businesses',
        category: 'modern',
        isPremium: false,
        isFree: true,
        preview: '/templates/modern-1.jpg',
        thumbnail: '/templates/thumbs/modern-1.jpg',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        fontFamily: 'Inter',
        layout: 'GRID',
        features: [
          'Responsive Design',
          'Product Grid Layout',
          'Advanced Search Filter',
          'Category Navigation',
          'Mobile Optimized',
          'Fast Loading'
        ],
        isActive: true,
        requiredPlan: 'FREE',
        tags: ['modern', 'clean', 'responsive', 'ecommerce']
      },
      {
        id: 'classic-1',
        name: 'Classic Boutique',
        description: 'Traditional elegant design for luxury and boutique stores',
        category: 'classic',
        isPremium: true,
        isFree: false,
        preview: '/templates/classic-1.jpg',
        thumbnail: '/templates/thumbs/classic-1.jpg',
        primaryColor: '#8b5a3c',
        secondaryColor: '#6b7280',
        fontFamily: 'Playfair Display',
        layout: 'LIST',
        features: [
          'Elegant Typography',
          'Product Showcase',
          'Wishlist Functionality',
          'Advanced Filters',
          'Customer Reviews',
          'Social Media Integration'
        ],
        isActive: true,
        requiredPlan: 'STARTER',
        tags: ['classic', 'elegant', 'boutique', 'luxury']
      },
      {
        id: 'minimal-1',
        name: 'Minimal Clean',
        description: 'Minimalist design focusing on products and simplicity',
        category: 'minimal',
        isPremium: false,
        isFree: true,
        preview: '/templates/minimal-1.jpg',
        thumbnail: '/templates/thumbs/minimal-1.jpg',
        primaryColor: '#000000',
        secondaryColor: '#9ca3af',
        fontFamily: 'Roboto',
        layout: 'MASONRY',
        features: [
          'Clean Layout',
          'Focus on Products',
          'Fast Loading',
          'Mobile First',
          'Minimal Interface',
          'Easy Navigation'
        ],
        isActive: true,
        requiredPlan: 'FREE',
        tags: ['minimal', 'clean', 'simple', 'fast']
      },
      {
        id: 'bold-1',
        name: 'Bold Impact',
        description: 'Vibrant and energetic design for lifestyle and fashion brands',
        category: 'bold',
        isPremium: true,
        isFree: false,
        preview: '/templates/bold-1.jpg',
        thumbnail: '/templates/thumbs/bold-1.jpg',
        primaryColor: '#f59e0b',
        secondaryColor: '#ef4444',
        fontFamily: 'Poppins',
        layout: 'GRID',
        features: [
          'Vibrant Colors',
          'Hero Sections',
          'Social Integration',
          'Video Support',
          'Animation Effects',
          'Interactive Elements'
        ],
        isActive: true,
        requiredPlan: 'PROFESSIONAL',
        tags: ['bold', 'vibrant', 'fashion', 'lifestyle']
      },
      {
        id: 'elegant-1',
        name: 'Elegant Essence',
        description: 'Sophisticated design for premium and luxury products',
        category: 'elegant',
        isPremium: true,
        isFree: false,
        preview: '/templates/elegant-1.jpg',
        thumbnail: '/templates/thumbs/elegant-1.jpg',
        primaryColor: '#7c3aed',
        secondaryColor: '#a78bfa',
        fontFamily: 'Montserrat',
        layout: 'GRID',
        features: [
          'Premium Look',
          'Smooth Animations',
          'Product Zoom',
          'Rich Media Support',
          'Advanced Gallery',
          'Luxury Aesthetics'
        ],
        isActive: true,
        requiredPlan: 'PROFESSIONAL',
        tags: ['elegant', 'premium', 'luxury', 'sophisticated']
      },
      {
        id: 'tech-1',
        name: 'Tech Store',
        description: 'Modern tech-focused design for electronics and gadgets',
        category: 'modern',
        isPremium: true,
        isFree: false,
        preview: '/templates/tech-1.jpg',
        thumbnail: '/templates/thumbs/tech-1.jpg',
        primaryColor: '#1f2937',
        secondaryColor: '#60a5fa',
        fontFamily: 'Inter',
        layout: 'GRID',
        features: [
          'Dark Theme Support',
          'Product Comparison',
          'Specification Tables',
          'Tech Reviews',
          'Advanced Search',
          'Filter by Specs'
        ],
        isActive: true,
        requiredPlan: 'STARTER',
        tags: ['tech', 'electronics', 'modern', 'dark']
      },
      {
        id: 'handmade-1',
        name: 'Handmade Craft',
        description: 'Warm and artistic design for handmade and craft products',
        category: 'elegant',
        isPremium: false,
        isFree: true,
        preview: '/templates/handmade-1.jpg',
        thumbnail: '/templates/thumbs/handmade-1.jpg',
        primaryColor: '#d97706',
        secondaryColor: '#92400e',
        fontFamily: 'Georgia',
        layout: 'MASONRY',
        features: [
          'Artistic Layout',
          'Story Telling',
          'Craft Focus',
          'Portfolio Style',
          'Artisan Profile',
          'Custom Colors'
        ],
        isActive: true,
        requiredPlan: 'FREE',
        tags: ['handmade', 'craft', 'artistic', 'warm']
      }
    ];

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('premium');
    const search = searchParams.get('search');
    const planFilter = searchParams.get('plan');

    // Filter templates based on query parameters
    let filteredTemplates = templates.filter(template => template.isActive);

    // Filter by category
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    // Filter by premium status
    if (isPremium === 'true') {
      filteredTemplates = filteredTemplates.filter(template => template.isPremium);
    } else if (isPremium === 'false') {
      filteredTemplates = filteredTemplates.filter(template => !template.isPremium);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by plan requirement
    if (planFilter) {
      filteredTemplates = filteredTemplates.filter(template =>
        template.requiredPlan === planFilter
      );
    }

    // Add access information based on user's plan
    const templatesWithAccess = filteredTemplates.map(template => ({
      ...template,
      hasAccess: hasTemplateAccess(userPlan, template.requiredPlan),
      userPlan: userPlan
    }));

    // Get categories and their counts
    const categories = [
      {
        id: 'all',
        name: 'All Templates',
        count: templates.filter(t => t.isActive).length
      },
      {
        id: 'modern',
        name: 'Modern',
        count: templates.filter(t => t.isActive && t.category === 'modern').length
      },
      {
        id: 'classic',
        name: 'Classic',
        count: templates.filter(t => t.isActive && t.category === 'classic').length
      },
      {
        id: 'minimal',
        name: 'Minimal',
        count: templates.filter(t => t.isActive && t.category === 'minimal').length
      },
      {
        id: 'bold',
        name: 'Bold',
        count: templates.filter(t => t.isActive && t.category === 'bold').length
      },
      {
        id: 'elegant',
        name: 'Elegant',
        count: templates.filter(t => t.isActive && t.category === 'elegant').length
      }
    ];

    return NextResponse.json({
      templates: templatesWithAccess,
      categories,
      userPlan,
      totalCount: filteredTemplates.length,
      filters: {
        category: category || 'all',
        isPremium: isPremium || 'all',
        search: search || '',
        plan: planFilter || 'all'
      }
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if user has access to a template based on their plan
 */
function hasTemplateAccess(userPlan: string, requiredPlan: string): boolean {
  const planHierarchy: { [key: string]: number } = {
    'FREE': 0,
    'STARTER': 1,
    'PROFESSIONAL': 2,
    'ENTERPRISE': 3
  };

  const userLevel = planHierarchy[userPlan] || 0;
  const requiredLevel = planHierarchy[requiredPlan] || 0;

  return userLevel >= requiredLevel;
}

/**
 * POST /api/store/templates - Create a new custom template (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      isPremium,
      primaryColor,
      secondaryColor,
      fontFamily,
      layout,
      features,
      requiredPlan,
      tags
    } = body;

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json({
        error: 'Name, description, and category are required'
      }, { status: 400 });
    }

    // In a real implementation, you would save this to a database
    // For now, we'll return a success response
    return NextResponse.json({
      message: 'Template created successfully',
      template: {
        id: `custom-${Date.now()}`,
        name,
        description,
        category,
        isPremium: isPremium || false,
        isFree: !isPremium,
        primaryColor: primaryColor || '#007bff',
        secondaryColor: secondaryColor || '#6c757d',
        fontFamily: fontFamily || 'Inter',
        layout: layout || 'GRID',
        features: features || [],
        requiredPlan: requiredPlan || 'FREE',
        tags: tags || [],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}