import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/customers/export - Export customers to CSV or JSON
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const includeOrders = searchParams.get('includeOrders') === 'true';

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

    // Get customers
    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: includeOrders ? {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        } : false,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Calculate analytics for each customer
    const customersWithAnalytics = customers.map(customer => {
      const orders = customer.orders || [];
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;
      const firstOrderDate = orders.length > 0 ? orders[orders.length - 1].createdAt : null;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        whatsappNumber: customer.whatsappNumber || '',
        street: customer.street || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || '',
        postalCode: customer.postalCode || '',
        birthDate: customer.birthDate ? customer.birthDate.toISOString().split('T')[0] : '',
        gender: customer.gender || '',
        notes: customer.notes || '',
        status: customer.status,
        tags: Array.isArray(customer.tags) ? customer.tags.join(', ') : '',
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate: lastOrderDate ? lastOrderDate.toISOString().split('T')[0] : '',
        firstOrderDate: firstOrderDate ? firstOrderDate.toISOString().split('T')[0] : '',
        createdAt: customer.createdAt.toISOString().split('T')[0],
        updatedAt: customer.updatedAt.toISOString().split('T')[0],
        ...(includeOrders && {
          orderHistory: orders.map(order => ({
            orderNumber: order.orderNumber,
            total: Number(order.total),
            status: order.status,
            date: order.createdAt.toISOString().split('T')[0],
          })),
        }),
      };
    });

    if (format === 'json') {
      // Return JSON format
      return NextResponse.json({
        customers: customersWithAnalytics,
        exportDate: new Date().toISOString(),
        totalCount: customersWithAnalytics.length,
      });
    } else {
      // Return CSV format
      const headers = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'WhatsApp Number',
        'Street',
        'City',
        'State',
        'Country',
        'Postal Code',
        'Birth Date',
        'Gender',
        'Notes',
        'Status',
        'Tags',
        'Total Orders',
        'Total Spent',
        'Average Order Value',
        'Last Order Date',
        'First Order Date',
        'Created At',
        'Updated At',
      ];

      const csvRows = [
        headers.join(','),
        ...customersWithAnalytics.map(customer =>
          [
            customer.id,
            `"${customer.name.replace(/"/g, '""')}"`,
            `"${customer.email}"`,
            `"${customer.phone}"`,
            `"${customer.whatsappNumber}"`,
            `"${customer.street}"`,
            `"${customer.city}"`,
            `"${customer.state}"`,
            `"${customer.country}"`,
            `"${customer.postalCode}"`,
            customer.birthDate,
            customer.gender,
            `"${customer.notes.replace(/"/g, '""')}"`,
            customer.status,
            `"${customer.tags}"`,
            customer.totalOrders,
            customer.totalSpent,
            customer.averageOrderValue.toFixed(2),
            customer.lastOrderDate,
            customer.firstOrderDate,
            customer.createdAt,
            customer.updatedAt,
          ].join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');

      // Return CSV with proper headers
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting customers:', error);
    return NextResponse.json(
      { error: 'Failed to export customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers/export - Export selected customers
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { customerIds, format = 'csv', includeOrders = false } = await request.json();

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs are required' },
        { status: 400 }
      );
    }

    // Get selected customers
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        storeId: user.store.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: includeOrders ? {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        } : false,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Calculate analytics for each customer
    const customersWithAnalytics = customers.map(customer => {
      const orders = customer.orders || [];
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;
      const firstOrderDate = orders.length > 0 ? orders[orders.length - 1].createdAt : null;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        whatsappNumber: customer.whatsappNumber || '',
        street: customer.street || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || '',
        postalCode: customer.postalCode || '',
        birthDate: customer.birthDate ? customer.birthDate.toISOString().split('T')[0] : '',
        gender: customer.gender || '',
        notes: customer.notes || '',
        status: customer.status,
        tags: Array.isArray(customer.tags) ? customer.tags.join(', ') : '',
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate: lastOrderDate ? lastOrderDate.toISOString().split('T')[0] : '',
        firstOrderDate: firstOrderDate ? firstOrderDate.toISOString().split('T')[0] : '',
        createdAt: customer.createdAt.toISOString().split('T')[0],
        updatedAt: customer.updatedAt.toISOString().split('T')[0],
        ...(includeOrders && {
          orderHistory: orders.map(order => ({
            orderNumber: order.orderNumber,
            total: Number(order.total),
            status: order.status,
            date: order.createdAt.toISOString().split('T')[0],
          })),
        }),
      };
    });

    if (format === 'json') {
      // Return JSON format
      return NextResponse.json({
        customers: customersWithAnalytics,
        exportDate: new Date().toISOString(),
        totalCount: customersWithAnalytics.length,
      });
    } else {
      // Return CSV format
      const headers = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'WhatsApp Number',
        'Street',
        'City',
        'State',
        'Country',
        'Postal Code',
        'Birth Date',
        'Gender',
        'Notes',
        'Status',
        'Tags',
        'Total Orders',
        'Total Spent',
        'Average Order Value',
        'Last Order Date',
        'First Order Date',
        'Created At',
        'Updated At',
      ];

      const csvRows = [
        headers.join(','),
        ...customersWithAnalytics.map(customer =>
          [
            customer.id,
            `"${customer.name.replace(/"/g, '""')}"`,
            `"${customer.email}"`,
            `"${customer.phone}"`,
            `"${customer.whatsappNumber}"`,
            `"${customer.street}"`,
            `"${customer.city}"`,
            `"${customer.state}"`,
            `"${customer.country}"`,
            `"${customer.postalCode}"`,
            customer.birthDate,
            customer.gender,
            `"${customer.notes.replace(/"/g, '""')}"`,
            customer.status,
            `"${customer.tags}"`,
            customer.totalOrders,
            customer.totalSpent,
            customer.averageOrderValue.toFixed(2),
            customer.lastOrderDate,
            customer.firstOrderDate,
            customer.createdAt,
            customer.updatedAt,
          ].join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');

      // Return CSV with proper headers
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="customers-selected-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting selected customers:', error);
    return NextResponse.json(
      { error: 'Failed to export selected customers' },
      { status: 500 }
    );
  }
}