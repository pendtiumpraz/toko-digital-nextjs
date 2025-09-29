import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const updateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required').optional(),
  whatsappNumber: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
  tags: z.array(z.string()).optional(),
});

interface Params {
  id: string;
}

// GET /api/customers/[id] - Get single customer with detailed information
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const includeOrders = searchParams.get('include') === 'orders';

    const customer = await prisma.customer.findUnique({
      where: {
        id: params.id,
        storeId: user.store.id,
      },
      include: {
        orders: includeOrders ? {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                name: true,
                price: true,
                quantity: true,
                subtotal: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        } : false,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate analytics
    if (includeOrders && customer.orders) {
      const orders = customer.orders;
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;
      const firstOrderDate = orders.length > 0 ? orders[orders.length - 1].createdAt : null;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // Get order status breakdown
      const orderStatusBreakdown = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get monthly order trends (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const monthlyTrends = await prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*)::int as orders,
          SUM("total")::float as revenue
        FROM "Order"
        WHERE "customerId" = ${params.id}
          AND "createdAt" >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `;

      return NextResponse.json({
        ...customer,
        analytics: {
          totalSpent,
          totalOrders,
          lastOrderDate,
          firstOrderDate,
          averageOrderValue,
          orderStatusBreakdown,
          monthlyTrends,
        },
      });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateCustomerSchema.parse(body);

    // Check if customer exists and belongs to the store
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: params.id,
        storeId: user.store.id,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if phone number is being changed and if it conflicts
    if (validatedData.phone && validatedData.phone !== existingCustomer.phone) {
      const phoneConflict = await prisma.customer.findUnique({
        where: {
          storeId_phone: {
            storeId: user.store.id,
            phone: validatedData.phone,
          },
        },
      });

      if (phoneConflict) {
        return NextResponse.json(
          { error: 'Another customer with this phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it conflicts
    if (validatedData.email && validatedData.email !== existingCustomer.email) {
      const emailConflict = await prisma.customer.findFirst({
        where: {
          storeId: user.store.id,
          email: validatedData.email,
          id: { not: params.id },
        },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'Another customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...validatedData,
      email: validatedData.email || null,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: params.id,
        storeId: user.store.id,
      },
      data: updateData,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if customer exists and belongs to the store
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: params.id,
        storeId: user.store.id,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Update orders to remove customer reference
    await prisma.order.updateMany({
      where: {
        customerId: params.id,
        storeId: user.store.id,
      },
      data: {
        customerId: null,
      },
    });

    // Delete the customer
    await prisma.customer.delete({
      where: {
        id: params.id,
        storeId: user.store.id,
      },
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}