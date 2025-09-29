import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  whatsappNumber: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).default('ACTIVE'),
  tags: z.array(z.string()).default([]),
});

const updateCustomerSchema = createCustomerSchema.partial();

// GET /api/customers - List customers with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'newest';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      storeId: user.store.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'totalSpent':
        orderBy = { totalSpent: 'desc' };
        break;
      case 'totalOrders':
        orderBy = { totalOrders: 'desc' };
        break;
      case 'lastOrder':
        orderBy = { lastOrderDate: 'desc' };
        break;
    }

    // Get customers with order data
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          orders: {
            select: {
              id: true,
              total: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    // Calculate analytics for each customer
    const customersWithAnalytics = customers.map(customer => {
      const orders = customer.orders;
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;
      const firstOrderDate = orders.length > 0 ? orders[orders.length - 1].createdAt : null;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        ...customer,
        orders: undefined, // Remove orders from response for cleaner data
        totalSpent,
        totalOrders,
        lastOrderDate,
        firstOrderDate,
        averageOrderValue,
      };
    });

    return NextResponse.json({
      customers: customersWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createCustomerSchema.parse(body);

    // Check if customer with same phone already exists in this store
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        storeId_phone: {
          storeId: user.store.id,
          phone: validatedData.phone,
        },
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists' },
        { status: 400 }
      );
    }

    // Check if email is already used by another customer in this store
    if (validatedData.email) {
      const existingEmailCustomer = await prisma.customer.findFirst({
        where: {
          storeId: user.store.id,
          email: validatedData.email,
        },
      });

      if (existingEmailCustomer) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Convert empty email to null
    const customerData = {
      ...validatedData,
      email: validatedData.email || null,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
      storeId: user.store.id,
    };

    const customer = await prisma.customer.create({
      data: customerData,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers - Bulk update customers
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'bulk-update') {
      const { customerIds, updates } = await request.json();

      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        return NextResponse.json(
          { error: 'Customer IDs are required' },
          { status: 400 }
        );
      }

      const validatedUpdates = updateCustomerSchema.parse(updates);

      const updatedCustomers = await prisma.customer.updateMany({
        where: {
          id: { in: customerIds },
          storeId: user.store.id,
        },
        data: validatedUpdates,
      });

      return NextResponse.json({
        message: `Updated ${updatedCustomers.count} customers`,
        count: updatedCustomers.count,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating customers:', error);
    return NextResponse.json(
      { error: 'Failed to update customers' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers - Bulk delete customers
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { customerIds } = await request.json();

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs are required' },
        { status: 400 }
      );
    }

    // First, update any orders to remove customer references
    await prisma.order.updateMany({
      where: {
        customerId: { in: customerIds },
        storeId: user.store.id,
      },
      data: {
        customerId: null,
      },
    });

    // Then delete the customers
    const deletedCustomers = await prisma.customer.deleteMany({
      where: {
        id: { in: customerIds },
        storeId: user.store.id,
      },
    });

    return NextResponse.json({
      message: `Deleted ${deletedCustomers.count} customers`,
      count: deletedCustomers.count,
    });
  } catch (error) {
    console.error('Error deleting customers:', error);
    return NextResponse.json(
      { error: 'Failed to delete customers' },
      { status: 500 }
    );
  }
}