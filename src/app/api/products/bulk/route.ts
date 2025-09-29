import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, storeId, productIds, updateData, csvData } = body;

    if (!action || !storeId) {
      return NextResponse.json(
        { error: 'Action and store ID are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'update_status': {
        if (!productIds || !updateData) {
          return NextResponse.json(
            { error: 'Product IDs and update data are required' },
            { status: 400 }
          );
        }

        const result = await prisma.product.updateMany({
          where: {
            id: { in: productIds },
            storeId
          },
          data: updateData
        });

        return NextResponse.json({
          success: true,
          message: `${result.count} products updated successfully`,
          count: result.count
        });
      }

      case 'update_category': {
        if (!productIds || !updateData.category) {
          return NextResponse.json(
            { error: 'Product IDs and category are required' },
            { status: 400 }
          );
        }

        const result = await prisma.product.updateMany({
          where: {
            id: { in: productIds },
            storeId
          },
          data: { category: updateData.category }
        });

        return NextResponse.json({
          success: true,
          message: `${result.count} products category updated successfully`,
          count: result.count
        });
      }

      case 'update_pricing': {
        if (!productIds || (!updateData.priceIncrease && !updateData.priceDecrease && !updateData.newPrice)) {
          return NextResponse.json(
            { error: 'Product IDs and pricing data are required' },
            { status: 400 }
          );
        }

        // Get current products to calculate new prices
        const products = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            storeId
          },
          select: { id: true, price: true, cost: true }
        });

        // Update each product individually for price calculations
        const updatePromises = products.map(async (product) => {
          let newPrice = product.price.toNumber();

          if (updateData.newPrice) {
            newPrice = updateData.newPrice;
          } else if (updateData.priceIncrease) {
            if (updateData.priceIncrease.type === 'percentage') {
              newPrice = newPrice * (1 + updateData.priceIncrease.value / 100);
            } else {
              newPrice = newPrice + updateData.priceIncrease.value;
            }
          } else if (updateData.priceDecrease) {
            if (updateData.priceDecrease.type === 'percentage') {
              newPrice = newPrice * (1 - updateData.priceDecrease.value / 100);
            } else {
              newPrice = newPrice - updateData.priceDecrease.value;
            }
          }

          const cost = product.cost.toNumber();
          const profitMargin = newPrice > 0 ? ((newPrice - cost) / newPrice) * 100 : 0;

          return prisma.product.update({
            where: { id: product.id },
            data: {
              price: newPrice,
              profitMargin
            }
          });
        });

        await Promise.all(updatePromises);

        return NextResponse.json({
          success: true,
          message: `${products.length} products pricing updated successfully`,
          count: products.length
        });
      }

      case 'update_inventory': {
        if (!productIds || updateData.stockAdjustment === undefined) {
          return NextResponse.json(
            { error: 'Product IDs and stock adjustment are required' },
            { status: 400 }
          );
        }

        // Get current products to calculate new stock
        const products = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            storeId
          },
          select: { id: true, stock: true }
        });

        const updatePromises = products.map(async (product) => {
          let newStock = product.stock;

          if (updateData.stockAdjustment.type === 'set') {
            newStock = updateData.stockAdjustment.value;
          } else if (updateData.stockAdjustment.type === 'increase') {
            newStock = newStock + updateData.stockAdjustment.value;
          } else if (updateData.stockAdjustment.type === 'decrease') {
            newStock = Math.max(0, newStock - updateData.stockAdjustment.value);
          }

          return prisma.product.update({
            where: { id: product.id },
            data: { stock: newStock }
          });
        });

        await Promise.all(updatePromises);

        return NextResponse.json({
          success: true,
          message: `${products.length} products inventory updated successfully`,
          count: products.length
        });
      }

      case 'delete': {
        if (!productIds) {
          return NextResponse.json(
            { error: 'Product IDs are required' },
            { status: 400 }
          );
        }

        const result = await prisma.product.deleteMany({
          where: {
            id: { in: productIds },
            storeId
          }
        });

        return NextResponse.json({
          success: true,
          message: `${result.count} products deleted successfully`,
          count: result.count
        });
      }

      case 'duplicate': {
        if (!productIds) {
          return NextResponse.json(
            { error: 'Product IDs are required' },
            { status: 400 }
          );
        }

        const originalProducts = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            storeId
          },
          include: {
            images: true,
            videos: true,
            tags: true
          }
        });

        const duplicatedProducts = [];

        for (const original of originalProducts) {
          const { id, createdAt, updatedAt, images, videos, tags, ...productData } = original;

          // Create duplicate with modified name and slug
          const duplicateData = {
            ...productData,
            name: `${original.name} (Copy)`,
            slug: `${original.slug}-copy-${Date.now()}`,
            sku: original.sku ? `${original.sku}-copy` : null
          };

          const duplicate = await prisma.product.create({
            data: duplicateData,
            include: {
              images: true,
              videos: true,
              tags: true
            }
          });

          // Duplicate images
          if (images.length > 0) {
            await prisma.productImage.createMany({
              data: images.map(img => ({
                productId: duplicate.id,
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
                source: img.source
              }))
            });
          }

          // Duplicate videos
          if (videos.length > 0) {
            await prisma.productVideo.createMany({
              data: videos.map(vid => ({
                productId: duplicate.id,
                url: vid.url,
                title: vid.title,
                source: vid.source,
                thumbnail: vid.thumbnail
              }))
            });
          }

          // Duplicate tags
          if (tags.length > 0) {
            await prisma.productTag.createMany({
              data: tags.map(tag => ({
                productId: duplicate.id,
                name: tag.name
              }))
            });
          }

          duplicatedProducts.push(duplicate);
        }

        return NextResponse.json({
          success: true,
          message: `${duplicatedProducts.length} products duplicated successfully`,
          count: duplicatedProducts.length,
          products: duplicatedProducts
        });
      }

      case 'import_csv': {
        if (!csvData || !Array.isArray(csvData)) {
          return NextResponse.json(
            { error: 'CSV data is required' },
            { status: 400 }
          );
        }

        const createdProducts = [];
        const errors = [];

        for (let i = 0; i < csvData.length; i++) {
          const row = csvData[i];
          try {
            const slug = row.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `product-${Date.now()}-${i}`;
            const profitMargin = row.price && row.cost ? ((row.price - row.cost) / row.price) * 100 : 0;

            const product = await prisma.product.create({
              data: {
                storeId,
                name: row.name || `Product ${i + 1}`,
                description: row.description || '',
                category: row.category || 'OTHER',
                subCategory: row.subCategory || null,
                price: parseFloat(row.price) || 0,
                comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : null,
                cost: parseFloat(row.cost) || 0,
                profitMargin,
                sku: row.sku || null,
                barcode: row.barcode || null,
                stock: parseInt(row.stock) || 0,
                trackInventory: row.trackInventory !== 'false',
                lowStockAlert: parseInt(row.lowStockAlert) || 5,
                weight: row.weight ? parseFloat(row.weight) : null,
                weightUnit: row.weightUnit || 'KG',
                slug,
                visibility: row.visibility || 'VISIBLE',
                featured: row.featured === 'true',
                isActive: row.isActive !== 'false'
              }
            });

            createdProducts.push(product);
          } catch (error) {
            errors.push({
              row: i + 1,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: `${createdProducts.length} products imported successfully`,
          count: createdProducts.length,
          errors: errors.length > 0 ? errors : undefined,
          products: createdProducts
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const action = searchParams.get('action');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'export_csv': {
        const products = await prisma.product.findMany({
          where: { storeId },
          include: {
            images: true,
            videos: true,
            tags: true
          }
        });

        const csvData = products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          subCategory: product.subCategory,
          price: product.price.toNumber(),
          comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
          cost: product.cost.toNumber(),
          profitMargin: product.profitMargin,
          sku: product.sku,
          barcode: product.barcode,
          stock: product.stock,
          trackInventory: product.trackInventory,
          lowStockAlert: product.lowStockAlert,
          weight: product.weight,
          weightUnit: product.weightUnit,
          length: product.length,
          width: product.width,
          height: product.height,
          dimensionUnit: product.dimensionUnit,
          slug: product.slug,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          visibility: product.visibility,
          featured: product.featured,
          isActive: product.isActive,
          views: product.views,
          sold: product.sold,
          ratingAverage: product.ratingAverage,
          ratingCount: product.ratingCount,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          images: product.images.map(img => img.url).join(';'),
          videos: product.videos.map(vid => vid.url).join(';'),
          tags: product.tags.map(tag => tag.name).join(';')
        }));

        return NextResponse.json({
          success: true,
          data: csvData,
          count: csvData.length
        });
      }

      case 'export_template': {
        const template = [{
          name: 'Sample Product Name',
          description: 'Sample product description',
          category: 'ELECTRONICS',
          subCategory: 'Laptops',
          price: 1000000,
          comparePrice: 1200000,
          cost: 800000,
          sku: 'SKU-001',
          barcode: '1234567890',
          stock: 10,
          trackInventory: true,
          lowStockAlert: 5,
          weight: 2.5,
          weightUnit: 'KG',
          visibility: 'VISIBLE',
          featured: false,
          isActive: true
        }];

        return NextResponse.json({
          success: true,
          template,
          headers: Object.keys(template[0])
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}