export const printInvoice = (order) => {
  const invoiceWindow = window.open('', '_blank');
  if (!invoiceWindow) {
    alert('Please allow popups to download or print your invoice.');
    return;
  }
  
  const date = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const deliveryEstimate = () => {
    const baseDate = new Date(order.createdAt);
    baseDate.setDate(baseDate.getDate() + 4);
    return baseDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const itemsRows = order.orderItems.map((item) => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">${item.name}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; color: #4b5563;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px; color: #4b5563;">${item.quantity}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; font-weight: 600; color: #1f2937;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - #${order._id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
          
          body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            color: #1f2937;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 24px;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 22px;
            font-weight: 800;
            color: #6366f1;
            letter-spacing: -0.5px;
          }
          .invoice-title {
            text-align: right;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .section-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #9ca3af;
            margin-bottom: 8px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .value {
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          th {
            background-color: #f9fafb;
            padding: 12px 10px;
            text-align: left;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            color: #4b5563;
            border-bottom: 2px solid #e5e7eb;
            letter-spacing: 0.5px;
          }
          .summary {
            width: 320px;
            margin-left: auto;
            margin-bottom: 48px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
            color: #4b5563;
          }
          .summary-row.total {
            font-size: 18px;
            font-weight: 800;
            border-bottom: none;
            color: #6366f1;
            padding-top: 12px;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 60px;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">vikaStore E-COMMERCE</div>
            <div class="value" style="color: #6b7280; margin-top: 4px;">
              Premium Products Global Store<br/>
              support@antigravity.com
            </div>
          </div>
          <div class="invoice-title">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">INVOICE</h1>
            <div class="value" style="margin-top: 6px;">
              <strong>Order ID:</strong> <span style="font-family: monospace; font-size: 13px;">#${order._id}</span><br/>
              <strong>Date:</strong> ${date}
            </div>
          </div>
        </div>

        <div class="details-grid">
          <div>
            <div class="section-title">Billed To</div>
            <div class="value">
              <strong>${order.user?.name || 'Customer Account'}</strong><br/>
              ${order.shippingAddress.address}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br/>
              ${order.shippingAddress.country}
            </div>
          </div>
          <div>
            <div class="section-title">Payment & Delivery Details</div>
            <div class="value">
              <strong>Payment Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : (order.paymentMethod === 'Card' ? 'Stripe' : order.paymentMethod)}<br/>
              <strong>Payment Status:</strong> ${order.isPaid ? 'PAID' : 'UNPAID'}<br/>
              <strong>Delivery Estimate:</strong> ${deliveryEstimate()}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: right; width: 120px;">Unit Price</th>
              <th style="text-align: center; width: 100px;">Quantity</th>
              <th style="text-align: right; width: 120px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>$${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping Charges:</span>
            <span>${order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}</span>
          </div>
          <div class="summary-row">
            <span>GST / Sales Tax (15%):</span>
            <span>$${order.taxPrice.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Grand Total:</span>
            <span>$${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for shopping with us! This is a secure system generated invoice and requires no physical signature.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  invoiceWindow.document.write(htmlContent);
  invoiceWindow.document.close();
};
