import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Store from '@/models/Store';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: any = { isActive: true };

    if (storeId) {
      query.store = storeId;
    }

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('store', 'name subdomain')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { storeId, ...productData } = body;

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check product limit
    const productCount = await Product.countDocuments({ store: storeId });
    if (productCount >= store.productLimit) {
      return NextResponse.json(
        { error: `Product limit reached. Maximum ${store.productLimit} products allowed for your plan.` },
        { status: 403 }
      );
    }

    // Create product
    const product = await Product.create({
      ...productData,
      store: storeId
    });

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}