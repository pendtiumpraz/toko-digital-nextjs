import { Order } from '@prisma/client';

interface InvoiceOrder extends Omit<Order, 'subtotal' | 'shipping' | 'tax' | 'discount' | 'total' | 'totalCost' | 'totalProfit' | 'createdAt' | 'updatedAt' | 'paidAt'> {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  totalCost: number;
  totalProfit: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  paidAt?: Date | string;
  trackingNumber?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    cost: number;
    subtotal: number;
    profit: number;
    variant?: string;
    product: {
      id: string;
      name: string;
      sku?: string;
      images: Array<{
        url: string;
        alt?: string;
      }>;
    };
  }>;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
    whatsappNumber?: string;
  };
}

interface Store {
  name: string;
  email?: string;
  whatsappNumber: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  logo?: string;
}

export function generateInvoiceHTML(order: InvoiceOrder, store: Store): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const customerAddress = [
    order.shippingStreet,
    order.shippingCity,
    order.shippingState,
    order.shippingCountry
  ].filter(Boolean).join(', ') + (order.shippingPostalCode ? ` ${order.shippingPostalCode}` : '');

  const storeAddress = [
    store.street,
    store.city,
    store.state,
    store.country
  ].filter(Boolean).join(', ') + (store.postalCode ? ` ${store.postalCode}` : '');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.orderNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }

        .invoice {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }

        .logo-section {
            flex: 1;
        }

        .logo-section h1 {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }

        .logo-section p {
            color: #6b7280;
            font-size: 14px;
        }

        .invoice-info {
            text-align: right;
            flex: 1;
        }

        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }

        .invoice-number {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 4px;
        }

        .invoice-date {
            font-size: 14px;
            color: #6b7280;
        }

        .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }

        .party {
            flex: 1;
            margin-right: 40px;
        }

        .party:last-child {
            margin-right: 0;
        }

        .party-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .party-info {
            color: #4b5563;
            font-size: 14px;
        }

        .party-info p {
            margin-bottom: 4px;
        }

        .order-details {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .order-details h3 {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 16px;
        }

        .order-details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }

        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .detail-label {
            font-weight: 500;
            color: #6b7280;
        }

        .detail-value {
            font-weight: 600;
            color: #1f2937;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }

        .status-confirmed,
        .status-processing {
            background: #dbeafe;
            color: #1e40af;
        }

        .status-shipped {
            background: #e0e7ff;
            color: #5b21b6;
        }

        .status-delivered,
        .status-completed {
            background: #d1fae5;
            color: #065f46;
        }

        .status-cancelled,
        .status-refunded {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-paid {
            background: #d1fae5;
            color: #065f46;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .items-table thead {
            background: #f3f4f6;
        }

        .items-table th,
        .items-table td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        .items-table th {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .items-table td {
            color: #4b5563;
            vertical-align: top;
        }

        .items-table .text-right {
            text-align: right;
        }

        .items-table .text-center {
            text-align: center;
        }

        .items-table .font-medium {
            font-weight: 500;
            color: #1f2937;
        }

        .totals {
            max-width: 400px;
            margin-left: auto;
            margin-bottom: 40px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .total-row:last-child {
            border-bottom: 2px solid #1f2937;
            font-weight: bold;
            font-size: 18px;
            color: #1f2937;
            padding: 16px 0 8px 0;
        }

        .total-label {
            color: #6b7280;
        }

        .total-value {
            font-weight: 500;
            color: #1f2937;
        }

        .notes {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .notes h4 {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 12px;
        }

        .notes p {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
        }

        .footer {
            text-align: center;
            padding-top: 40px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }

            .invoice {
                max-width: none;
                margin: 0;
                padding: 20px;
            }

            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice">
        <!-- Header -->
        <div class="header">
            <div class="logo-section">
                <h1>${store.name}</h1>
                <p>${store.email || ''}</p>
                <p>${store.whatsappNumber}</p>
                ${storeAddress ? `<p>${storeAddress}</p>` : ''}
            </div>
            <div class="invoice-info">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${order.orderNumber}</div>
                <div class="invoice-date">${formatDate(order.createdAt)}</div>
            </div>
        </div>

        <!-- Parties -->
        <div class="parties">
            <div class="party">
                <div class="party-title">Bill To</div>
                <div class="party-info">
                    <p><strong>${order.customer?.name || order.customerName}</strong></p>
                    ${order.customer?.email || order.customerEmail ? `<p>${order.customer?.email || order.customerEmail}</p>` : ''}
                    <p>${order.customer?.phone || order.customerPhone}</p>
                    ${order.customerWhatsapp ? `<p>WhatsApp: ${order.customerWhatsapp}</p>` : ''}
                    ${customerAddress ? `<p>${customerAddress}</p>` : ''}
                </div>
            </div>
            <div class="party">
                <div class="party-title">Ship To</div>
                <div class="party-info">
                    ${customerAddress ? `<p>${customerAddress}</p>` : '<p>Same as billing address</p>'}
                    ${order.shippingNotes ? `<p><em>Notes: ${order.shippingNotes}</em></p>` : ''}
                </div>
            </div>
        </div>

        <!-- Order Details -->
        <div class="order-details">
            <h3>Order Details</h3>
            <div class="order-details-grid">
                <div class="detail-item">
                    <span class="detail-label">Order Status:</span>
                    <span class="detail-value">
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Payment Status:</span>
                    <span class="detail-value">
                        <span class="status-badge status-${order.paymentStatus.toLowerCase()}">${order.paymentStatus}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${order.paymentMethod}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Order Source:</span>
                    <span class="detail-value">${order.source}</span>
                </div>
                ${order.transactionId ? `
                <div class="detail-item">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${order.transactionId}</span>
                </div>
                ` : ''}
                ${order.trackingNumber ? `
                <div class="detail-item">
                    <span class="detail-label">Tracking Number:</span>
                    <span class="detail-value">${order.trackingNumber}</span>
                </div>
                ` : ''}
                ${order.paidAt ? `
                <div class="detail-item">
                    <span class="detail-label">Paid At:</span>
                    <span class="detail-value">${formatDate(order.paidAt)}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                <tr>
                    <td>
                        <div class="font-medium">${item.name}</div>
                        ${item.product.sku ? `<div style="font-size: 12px; color: #6b7280;">SKU: ${item.product.sku}</div>` : ''}
                        ${item.variant ? `<div style="font-size: 12px; color: #6b7280;">Variant: ${item.variant}</div>` : ''}
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatPrice(item.price)}</td>
                    <td class="text-right font-medium">${formatPrice(item.subtotal)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">${formatPrice(order.subtotal)}</span>
            </div>
            ${order.shipping > 0 ? `
            <div class="total-row">
                <span class="total-label">Shipping:</span>
                <span class="total-value">${formatPrice(order.shipping)}</span>
            </div>
            ` : ''}
            ${order.tax > 0 ? `
            <div class="total-row">
                <span class="total-label">Tax:</span>
                <span class="total-value">${formatPrice(order.tax)}</span>
            </div>
            ` : ''}
            ${order.discount > 0 ? `
            <div class="total-row">
                <span class="total-label">Discount:</span>
                <span class="total-value" style="color: #059669;">-${formatPrice(order.discount)}</span>
            </div>
            ` : ''}
            <div class="total-row">
                <span>Total:</span>
                <span>${formatPrice(order.total)}</span>
            </div>
        </div>

        ${order.notes ? `
        <!-- Notes -->
        <div class="notes">
            <h4>Notes</h4>
            <p>${order.notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for your business!</p>
            <p>This invoice was generated on ${formatDate(new Date())}</p>
        </div>
    </div>

    <script>
        // Auto-print functionality
        window.onload = function() {
            if (window.location.search.includes('print=true')) {
                window.print();
            }
        }
    </script>
</body>
</html>
  `;
}

export function downloadInvoiceHTML(order: InvoiceOrder, store: Store) {
  const htmlContent = generateInvoiceHTML(order, store);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${order.orderNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function printInvoice(order: InvoiceOrder, store: Store) {
  const htmlContent = generateInvoiceHTML(order, store);

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}