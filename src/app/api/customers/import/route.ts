import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for import data
const importCustomerSchema = z.object({
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
  tags: z.string().optional(), // Will be split by commas
});

// POST /api/customers/import - Import customers from CSV/JSON
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json();
    const { customers, options = {} } = body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        { error: 'Customers array is required and cannot be empty' },
        { status: 400 }
      );
    }

    const {
      skipDuplicates = true,
      updateExisting = false,
      validateOnly = false
    } = options;

    const results = {
      total: customers.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; error: string; data: unknown }>,
    };

    const validCustomers = [];
    const duplicatePhones = new Set();
    const duplicateEmails = new Set();

    // Validate all customers first
    for (let i = 0; i < customers.length; i++) {
      try {
        const customerData = customers[i];

        // Parse and validate customer data
        const validatedData = importCustomerSchema.parse(customerData);

        // Process tags
        const tags = validatedData.tags
          ? validatedData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : [];

        const processedCustomer = {
          ...validatedData,
          email: validatedData.email || null,
          birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
          tags,
          storeId: user.store.id,
          rowNumber: i + 1,
        };

        // Check for duplicates within the import batch
        if (duplicatePhones.has(validatedData.phone)) {
          results.errors.push({
            row: i + 1,
            error: 'Duplicate phone number in import data',
            data: customerData,
          });
          continue;
        }

        if (validatedData.email && duplicateEmails.has(validatedData.email)) {
          results.errors.push({
            row: i + 1,
            error: 'Duplicate email in import data',
            data: customerData,
          });
          continue;
        }

        duplicatePhones.add(validatedData.phone);
        if (validatedData.email) {
          duplicateEmails.add(validatedData.email);
        }

        validCustomers.push(processedCustomer);
      } catch (error) {
        if (error instanceof z.ZodError) {
          results.errors.push({
            row: i + 1,
            error: `Validation failed: ${error.errors.map(e => e.message).join(', ')}`,
            data: customers[i],
          });
        } else {
          results.errors.push({
            row: i + 1,
            error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            data: customers[i],
          });
        }
      }
    }

    // If validation only, return results
    if (validateOnly) {
      return NextResponse.json({
        ...results,
        valid: validCustomers.length,
        message: 'Validation completed',
      });
    }

    // Process valid customers
    for (const customerData of validCustomers) {
      try {
        // Check if customer already exists
        const existingCustomer = await prisma.customer.findUnique({
          where: {
            storeId_phone: {
              storeId: user.store.id,
              phone: customerData.phone,
            },
          },
        });

        if (existingCustomer) {
          if (updateExisting) {
            // Update existing customer
            await prisma.customer.update({
              where: { id: existingCustomer.id },
              data: {
                name: customerData.name,
                email: customerData.email,
                whatsappNumber: customerData.whatsappNumber,
                street: customerData.street,
                city: customerData.city,
                state: customerData.state,
                country: customerData.country,
                postalCode: customerData.postalCode,
                birthDate: customerData.birthDate,
                gender: customerData.gender,
                notes: customerData.notes,
                status: customerData.status,
                tags: customerData.tags,
              },
            });
            results.updated++;
          } else if (skipDuplicates) {
            results.skipped++;
          } else {
            results.errors.push({
              row: customerData.rowNumber,
              error: 'Customer with this phone number already exists',
              data: customerData,
            });
          }
        } else {
          // Check email conflicts for new customers
          if (customerData.email) {
            const emailConflict = await prisma.customer.findFirst({
              where: {
                storeId: user.store.id,
                email: customerData.email,
              },
            });

            if (emailConflict) {
              results.errors.push({
                row: customerData.rowNumber,
                error: 'Customer with this email already exists',
                data: customerData,
              });
              continue;
            }
          }

          // Create new customer
          const { rowNumber, ...createData } = customerData;
          await prisma.customer.create({
            data: createData,
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          row: customerData.rowNumber,
          error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: customerData,
        });
      }
    }

    return NextResponse.json({
      ...results,
      message: `Import completed. Created: ${results.created}, Updated: ${results.updated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
    });
  } catch (error) {
    console.error('Error importing customers:', error);
    return NextResponse.json(
      { error: 'Failed to import customers' },
      { status: 500 }
    );
  }
}