import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus, PaymentMethod, OrderSource, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    const where: Prisma.OrderWhereInput = {
      storeId
    };

    // Apply filters
    if (status) {
      where.status = status as OrderStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Build orderBy clause
    let orderBy: Prisma.OrderOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'orderNumber':
        orderBy = { orderNumber: sortOrder as 'asc' | 'desc' };
        break;
      case 'customerName':
        orderBy = { customerName: sortOrder as 'asc' | 'desc' };
        break;
      case 'total':
        orderBy = { total: sortOrder as 'asc' | 'desc' };
        break;
      case 'status':
        orderBy = { status: sortOrder as 'asc' | 'desc' };
        break;
      case 'paymentStatus':
        orderBy = { paymentStatus: sortOrder as 'asc' | 'desc' };
        break;
      default:
        orderBy = { createdAt: sortOrder as 'asc' | 'desc' };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1
                  }
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              whatsappNumber: true
            }
          }
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy
      }),
      prisma.order.count({ where })
    ]);

    // Convert Decimal types to numbers for JSON serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      subtotal: order.subtotal.toNumber(),
      shipping: order.shipping.toNumber(),
      tax: order.tax.toNumber(),
      discount: order.discount.toNumber(),
      total: order.total.toNumber(),
      totalCost: order.totalCost.toNumber(),
      totalProfit: order.totalProfit.toNumber(),
      items: order.items.map(item => ({
        ...item,
        price: item.price.toNumber(),
        cost: item.cost.toNumber(),
        subtotal: item.subtotal.toNumber(),
        profit: item.profit.toNumber()
      }))
    }));

    return NextResponse.json({
      orders: serializedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsapp,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingCountry,
      shippingPostalCode,
      shippingNotes,
      items,
      subtotal,
      shipping = 0,
      tax = 0,
      discount = 0,
      total,
      paymentMethod = PaymentMethod.WHATSAPP,
      paymentStatus = PaymentStatus.PENDING,
      status = OrderStatus.PENDING,
      notes,
      source = OrderSource.MANUAL
    } = body;

    // Validate required fields
    if (!storeId || !customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Store ID, customer name, phone, and items are required' },
        { status: 400 }
      );
    }

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Generate unique order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Calculate totals if not provided
    let calculatedSubtotal = subtotal;
    let calculatedTotal = total;
    let totalCost = 0;

    if (!calculatedSubtotal || !calculatedTotal) {
      calculatedSubtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      calculatedTotal = calculatedSubtotal + shipping + tax - discount;
    }

    // Calculate total cost for profit tracking
    totalCost = items.reduce((sum: number, item: any) => sum + ((item.cost || 0) * item.quantity), 0);
    const totalProfit = calculatedTotal - totalCost - shipping;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          storeId,
          orderNumber,
          customerId,
          customerName,
          customerEmail,
          customerPhone,
          customerWhatsapp,
          shippingStreet,
          shippingCity,
          shippingState,
          shippingCountry,
          shippingPostalCode,
          shippingNotes,
          subtotal: calculatedSubtotal,
          shipping,
          tax,
          discount,
          total: calculatedTotal,
          totalCost,
          totalProfit,
          paymentMethod,
          paymentStatus,
          status,
          notes,
          source
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      // Create order items
      for (const item of items) {
        // Verify product exists
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const itemSubtotal = item.price * item.quantity;
        const itemProfit = itemSubtotal - ((item.cost || product.cost.toNumber()) * item.quantity);

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            name: item.name || product.name,
            price: item.price,
            cost: item.cost || product.cost.toNumber(),
            quantity: item.quantity,
            subtotal: itemSubtotal,
            profit: itemProfit,
            variant: item.variant
          }
        });

        // Update product stock if track inventory is enabled
        if (product.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              },
              sold: {
                increment: item.quantity
              }
            }
          });
        }
      }

      return newOrder;
    });

    // Create financial transaction for income tracking
    if (paymentStatus === PaymentStatus.PAID) {
      await prisma.financialTransaction.create({
        data: {
          storeId,
          type: 'INCOME',
          category: 'PRODUCT_SALES',
          amount: calculatedTotal,
          description: `Order payment - ${orderNumber}`,
          reference: orderNumber,
          transactionDate: new Date()
        }
      });
    }

    // Fetch complete order with all relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsappNumber: true
          }
        }
      }
    });

    // Serialize Decimal values
    const serializedOrder = {
      ...completeOrder!,
      subtotal: completeOrder!.subtotal.toNumber(),
      shipping: completeOrder!.shipping.toNumber(),
      tax: completeOrder!.tax.toNumber(),
      discount: completeOrder!.discount.toNumber(),
      total: completeOrder!.total.toNumber(),
      totalCost: completeOrder!.totalCost.toNumber(),
      totalProfit: completeOrder!.totalProfit.toNumber(),
      items: completeOrder!.items.map(item => ({
        ...item,
        price: item.price.toNumber(),
        cost: item.cost.toNumber(),
        subtotal: item.subtotal.toNumber(),
        profit: item.profit.toNumber()
      }))
    };

    return NextResponse.json(serializedOrder, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paymentStatus, paymentMethod, notes, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updates: any = { ...updateData };

    // Handle status updates
    if (status && status !== existingOrder.status) {
      updates.status = status;

      // If order is being cancelled, restore product stock
      if (status === OrderStatus.CANCELLED) {
        await prisma.$transaction(async (tx) => {
          for (const item of existingOrder.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                },
                sold: {
                  decrement: item.quantity
                }
              }
            });
          }
        });
      }
    }

    // Handle payment status updates
    if (paymentStatus && paymentStatus !== existingOrder.paymentStatus) {
      updates.paymentStatus = paymentStatus;

      if (paymentStatus === PaymentStatus.PAID && existingOrder.paymentStatus !== PaymentStatus.PAID) {
        updates.paidAt = new Date();

        // Create financial transaction for payment
        await prisma.financialTransaction.create({
          data: {
            storeId: existingOrder.storeId,
            type: 'INCOME',
            category: 'PRODUCT_SALES',
            amount: existingOrder.total,
            description: `Order payment - ${existingOrder.orderNumber}`,
            reference: existingOrder.orderNumber,
            transactionDate: new Date()
          }
        });
      }
    }

    if (paymentMethod) {
      updates.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }


    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updates,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsappNumber: true
          }
        }
      }
    });

    // Serialize Decimal values
    const serializedOrder = {
      ...updatedOrder,
      subtotal: updatedOrder.subtotal.toNumber(),
      shipping: updatedOrder.shipping.toNumber(),
      tax: updatedOrder.tax.toNumber(),
      discount: updatedOrder.discount.toNumber(),
      total: updatedOrder.total.toNumber(),
      totalCost: updatedOrder.totalCost.toNumber(),
      totalProfit: updatedOrder.totalProfit.toNumber(),
      items: updatedOrder.items.map(item => ({
        ...item,
        price: item.price.toNumber(),
        cost: item.cost.toNumber(),
        subtotal: item.subtotal.toNumber(),
        profit: item.profit.toNumber()
      }))
    };

    return NextResponse.json(serializedOrder);
  } catch (error: unknown) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids'); // For bulk delete

    if (!id && !ids) {
      return NextResponse.json(
        { error: 'Order ID or IDs are required' },
        { status: 400 }
      );
    }

    if (ids) {
      // Bulk delete
      const orderIds = ids.split(',');

      // Get orders with items to restore stock
      const orders = await prisma.order.findMany({
        where: {
          id: { in: orderIds }
        },
        include: {
          items: true
        }
      });

      // Restore stock for all orders and delete
      await prisma.$transaction(async (tx) => {
        for (const order of orders) {
          // Restore product stock if order was not cancelled
          if (order.status !== OrderStatus.CANCELLED) {
            for (const item of order.items) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    increment: item.quantity
                  },
                  sold: {
                    decrement: item.quantity
                  }
                }
              });
            }
          }
        }

        // Delete all orders
        await tx.order.deleteMany({
          where: {
            id: { in: orderIds }
          }
        });
      });

      return NextResponse.json({
        success: true,
        message: `${orders.length} orders deleted successfully`,
        count: orders.length
      });
    } else {
      // Single delete
      const order = await prisma.order.findUnique({
        where: { id: id! },
        include: {
          items: true
        }
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Restore stock and delete order
      await prisma.$transaction(async (tx) => {
        // Restore product stock if order was not cancelled
        if (order.status !== OrderStatus.CANCELLED) {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                },
                sold: {
                  decrement: item.quantity
                }
              }
            });
          }
        }

        // Delete the order
        await tx.order.delete({
          where: { id: id! }
        });
      });

      return NextResponse.json({
        success: true,
        message: 'Order deleted successfully'
      });
    }
  } catch (error: unknown) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}