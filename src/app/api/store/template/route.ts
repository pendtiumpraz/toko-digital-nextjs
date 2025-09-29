import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { logAdminActivity } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/store/template - Get current store template settings
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's store
    const store = await prisma.store.findUnique({
      where: { ownerId: decoded.userId },
      select: {
        id: true,
        name: true,
        primaryColor: true,
        secondaryColor: true,
        fontFamily: true,
        layout: true,
        // Add template-related fields to your schema if they don't exist
        templateId: true, // You may need to add this field to your Store model
        templateSettings: true // JSON field for additional template settings
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Default template settings
    const defaultSettings = {
      currentTemplate: store.templateId || 'modern-1',
      primaryColor: store.primaryColor || '#007bff',
      secondaryColor: store.secondaryColor || '#6c757d',
      fontFamily: store.fontFamily || 'Inter',
      layout: store.layout || 'GRID',
      logoPosition: 'left',
      showSearch: true,
      showCategories: true,
      showFeatured: true,
      showReviews: true,
      darkMode: false,
      // Merge any custom settings from database
      ...(store.templateSettings as object || {})
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Error getting template settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/store/template - Update store template settings
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      currentTemplate,
      primaryColor,
      secondaryColor,
      fontFamily,
      layout,
      logoPosition,
      showSearch,
      showCategories,
      showFeatured,
      showReviews,
      darkMode,
      ...additionalSettings
    } = body;

    // Validate required fields
    if (!currentTemplate) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Get user's store
    const store = await prisma.store.findUnique({
      where: { ownerId: decoded.userId },
      select: { id: true, name: true }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Prepare template settings for JSON storage
    const templateSettings = {
      logoPosition: logoPosition || 'left',
      showSearch: showSearch !== undefined ? showSearch : true,
      showCategories: showCategories !== undefined ? showCategories : true,
      showFeatured: showFeatured !== undefined ? showFeatured : true,
      showReviews: showReviews !== undefined ? showReviews : true,
      darkMode: darkMode || false,
      lastUpdated: new Date().toISOString(),
      ...additionalSettings
    };

    // Update store with new template settings
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        templateId: currentTemplate,
        primaryColor: primaryColor || '#007bff',
        secondaryColor: secondaryColor || '#6c757d',
        fontFamily: fontFamily || 'Inter',
        layout: layout || 'GRID',
        templateSettings: templateSettings,
        updatedAt: new Date()
      }
    });

    // Log the activity if admin is performing the action
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      const ipAddress = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await logAdminActivity(
        decoded.userId,
        'STORE_TEMPLATE_UPDATED',
        'store',
        store.id,
        `Updated template settings for store: ${store.name}`,
        {
          storeId: store.id,
          storeName: store.name,
          templateId: currentTemplate,
          primaryColor,
          secondaryColor,
          fontFamily,
          layout
        },
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json({
      message: 'Template settings updated successfully',
      settings: {
        currentTemplate,
        primaryColor: updatedStore.primaryColor,
        secondaryColor: updatedStore.secondaryColor,
        fontFamily: updatedStore.fontFamily,
        layout: updatedStore.layout,
        ...templateSettings
      }
    });
  } catch (error) {
    console.error('Error updating template settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/store/template - Reset template settings to default
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's store
    const store = await prisma.store.findUnique({
      where: { ownerId: decoded.userId },
      select: { id: true, name: true }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Default template settings
    const defaultSettings = {
      logoPosition: 'left',
      showSearch: true,
      showCategories: true,
      showFeatured: true,
      showReviews: true,
      darkMode: false,
      lastUpdated: new Date().toISOString()
    };

    // Reset to default template
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        templateId: 'modern-1',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Inter',
        layout: 'GRID',
        templateSettings: defaultSettings,
        updatedAt: new Date()
      }
    });

    // Log the activity
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      const ipAddress = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await logAdminActivity(
        decoded.userId,
        'STORE_TEMPLATE_RESET',
        'store',
        store.id,
        `Reset template settings to default for store: ${store.name}`,
        {
          storeId: store.id,
          storeName: store.name,
          templateId: 'modern-1'
        },
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json({
      message: 'Template settings reset to default successfully',
      settings: {
        currentTemplate: 'modern-1',
        primaryColor: updatedStore.primaryColor,
        secondaryColor: updatedStore.secondaryColor,
        fontFamily: updatedStore.fontFamily,
        layout: updatedStore.layout,
        ...defaultSettings
      }
    });
  } catch (error) {
    console.error('Error resetting template settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}