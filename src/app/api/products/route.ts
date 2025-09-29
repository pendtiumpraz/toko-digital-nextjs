import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Category, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: Prisma.ProductWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (category) {
      where.category = category as Category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      switch (status) {
        case 'active':
          where.isActive = true;
          break;
        case 'inactive':
          where.isActive = false;
          break;
        case 'out_of_stock':
          where.stock = 0;
          break;
        case 'low_stock':
          where.stock = { gt: 0, lte: 5 };
          break;
      }
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder as 'asc' | 'desc' };
        break;
      case 'price':
        orderBy = { price: sortOrder as 'asc' | 'desc' };
        break;
      case 'stock':
        orderBy = { stock: sortOrder as 'asc' | 'desc' };
        break;
      case 'sold':
        orderBy = { sold: sortOrder as 'asc' | 'desc' };
        break;
      case 'views':
        orderBy = { views: sortOrder as 'asc' | 'desc' };
        break;
      default:
        orderBy = { createdAt: sortOrder as 'asc' | 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              subdomain: true
            }
          },
          images: true,
          videos: true,
          tags: true
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    // Convert Decimal types to numbers
    const serializedProducts = products.map(product => ({
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
      cost: product.cost.toNumber(),
      profit: product.profit.toNumber(),
      tags: product.tags.map(tag => tag.name)
    }));

    return NextResponse.json({
      products: serializedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      storeId,
      name,
      description,
      category,
      subCategory,
      price,
      comparePrice,
      cost,
      sku,
      barcode,
      stock = 0,
      trackInventory = true,
      lowStockAlert = 5,
      weight,
      weightUnit = 'KG',
      length,
      width,
      height,
      dimensionUnit = 'CM',
      slug,
      metaTitle,
      metaDescription,
      visibility = 'VISIBLE',
      publishDate,
      featured = false,
      isActive = true,
      images = [],
      videos = [],
      tags = [],
      // Bulk operations
      products,
      productIds
    } = body;

    // Handle bulk operations
    if (action === 'bulk_create' && products) {
      const createdProducts = [];
      for (const productData of products) {
        const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const product = await prisma.product.create({
          data: {
            storeId,
            ...productData,
            slug,
            profitMargin: productData.price && productData.cost ?
              ((productData.price - productData.cost) / productData.price) * 100 : 0
          },
          include: {
            images: true,
            videos: true,
            tags: true
          }
        });

        // Handle images
        if (productData.images?.length > 0) {
          await prisma.productImage.createMany({
            data: productData.images.map((img: any) => ({
              productId: product.id,
              ...img
            }))
          });
        }

        // Handle videos
        if (productData.videos?.length > 0) {
          await prisma.productVideo.createMany({
            data: productData.videos.map((vid: any) => ({
              productId: product.id,
              ...vid
            }))
          });
        }

        // Handle tags
        if (productData.tags?.length > 0) {
          await prisma.productTag.createMany({
            data: productData.tags.map((tag: string) => ({
              productId: product.id,
              name: tag
            }))
          });
        }

        createdProducts.push(product);
      }

      return NextResponse.json({
        message: `${createdProducts.length} products created successfully`,
        products: createdProducts
      }, { status: 201 });
    }

    if (action === 'bulk_update' && productIds) {
      const updateData: any = {};
      if (category) updateData.category = category;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      if (typeof featured === 'boolean') updateData.featured = featured;
      if (visibility) updateData.visibility = visibility;

      const updatedProducts = await prisma.product.updateMany({
        where: {
          id: { in: productIds },
          storeId
        },
        data: updateData
      });

      return NextResponse.json({
        message: `${updatedProducts.count} products updated successfully`,
        count: updatedProducts.count
      });
    }

    if (action === 'bulk_delete' && productIds) {
      const deletedProducts = await prisma.product.deleteMany({
        where: {
          id: { in: productIds },
          storeId
        }
      });

      return NextResponse.json({
        message: `${deletedProducts.count} products deleted successfully`,
        count: deletedProducts.count
      });
    }

    // Single product creation
    if (!storeId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Store ID, name, and price are required' },
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

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Calculate profit margin
    const profitMargin = price && cost ? ((price - cost) / price) * 100 : 0;

    const product = await prisma.product.create({
      data: {
        storeId,
        name,
        description: description || '',
        category: category || 'OTHER',
        subCategory,
        price,
        comparePrice,
        cost: cost || 0,
        profitMargin,
        sku,
        barcode,
        stock,
        trackInventory,
        lowStockAlert,
        weight,
        weightUnit,
        length,
        width,
        height,
        dimensionUnit,
        slug: finalSlug,
        metaTitle,
        metaDescription,
        visibility,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        featured,
        isActive
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        images: true,
        videos: true,
        tags: true
      }
    });

    // Handle images
    if (images?.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img: any) => ({
          productId: product.id,
          ...img
        }))
      });
    }

    // Handle videos
    if (videos?.length > 0) {
      await prisma.productVideo.createMany({
        data: videos.map((vid: any) => ({
          productId: product.id,
          ...vid
        }))
      });
    }

    // Handle tags
    if (tags?.length > 0) {
      await prisma.productTag.createMany({
        data: tags.map((tag: string) => ({
          productId: product.id,
          name: tag
        }))
      });
    }

    // Fetch the complete product with relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        images: true,
        videos: true,
        tags: true
      }
    });

    // Convert Decimal types to numbers
    const serializedProduct = {
      ...completeProduct!,
      price: completeProduct!.price.toNumber(),
      comparePrice: completeProduct!.comparePrice ? completeProduct!.comparePrice.toNumber() : null,
      cost: completeProduct!.cost.toNumber(),
      profit: completeProduct!.profit.toNumber(),
      tags: completeProduct!.tags.map(tag => tag.name)
    };

    return NextResponse.json(serializedProduct, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, images, videos, tags, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Calculate profit margin if price and cost are provided
    if (updateData.price !== undefined && updateData.cost !== undefined) {
      updateData.profitMargin = updateData.price > 0 ? ((updateData.price - updateData.cost) / updateData.price) * 100 : 0;
    }

    // Update slug if name changed
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        images: true,
        videos: true,
        tags: true
      }
    });

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id }
      });

      // Create new images
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: any) => ({
            productId: id,
            ...img
          }))
        });
      }
    }

    // Update videos if provided
    if (videos !== undefined) {
      // Delete existing videos
      await prisma.productVideo.deleteMany({
        where: { productId: id }
      });

      // Create new videos
      if (videos.length > 0) {
        await prisma.productVideo.createMany({
          data: videos.map((vid: any) => ({
            productId: id,
            ...vid
          }))
        });
      }
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await prisma.productTag.deleteMany({
        where: { productId: id }
      });

      // Create new tags
      if (tags.length > 0) {
        await prisma.productTag.createMany({
          data: tags.map((tag: string) => ({
            productId: id,
            name: tag
          }))
        });
      }
    }

    // Fetch updated product with all relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        images: true,
        videos: true,
        tags: true
      }
    });

    // Convert Decimal types to numbers
    const serializedProduct = {
      ...updatedProduct!,
      price: updatedProduct!.price.toNumber(),
      comparePrice: updatedProduct!.comparePrice ? updatedProduct!.comparePrice.toNumber() : null,
      cost: updatedProduct!.cost.toNumber(),
      profit: updatedProduct!.profit.toNumber(),
      tags: updatedProduct!.tags.map(tag => tag.name)
    };

    return NextResponse.json(serializedProduct);
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
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
        { error: 'Product ID or IDs are required' },
        { status: 400 }
      );
    }

    if (ids) {
      // Bulk delete
      const productIds = ids.split(',');
      const deletedProducts = await prisma.product.deleteMany({
        where: {
          id: { in: productIds }
        }
      });

      return NextResponse.json({
        success: true,
        message: `${deletedProducts.count} products deleted successfully`,
        count: deletedProducts.count
      });
    } else {
      // Single delete
      await prisma.product.delete({
        where: { id: id! }
      });

      return NextResponse.json({
        success: true,
        message: 'Product deleted successfully'
      });
    }
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}