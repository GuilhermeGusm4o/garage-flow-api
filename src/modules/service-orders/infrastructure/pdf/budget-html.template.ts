export interface ServiceOrderBudgetLineItem {
  name: string;
  quantity: number;
  unitOfMeasure: string | null;
  unitPrice: number;
  subtotal: number;
}

export interface ServiceOrderBudgetViewModel {
  serviceOrderId: string;
  description: string;
  status: string;
  client: {
    name: string;
    cpfCnpj: string;
    phone: string;
    address: string;
    email: string | null;
  };
  vehicle: {
    brand: string;
    model: string;
    licensePlate: string;
    year: number;
  };
  services: ServiceOrderBudgetLineItem[];
  parts: ServiceOrderBudgetLineItem[];
  totalAmount: number;
  generatedAt: Date;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderLineItemsTable(title: string, items: ServiceOrderBudgetLineItem[]): string {
  if (items.length === 0) return '';

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td class="numeric">${item.quantity}${item.unitOfMeasure ? ` ${escapeHtml(item.unitOfMeasure)}` : ''}</td>
          <td class="numeric">${currencyFormatter.format(item.unitPrice)}</td>
          <td class="numeric">${currencyFormatter.format(item.subtotal)}</td>
        </tr>`,
    )
    .join('');

  return `
    <h2>${title}</h2>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th class="numeric">Qtd.</th>
          <th class="numeric">Valor unitário</th>
          <th class="numeric">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function buildServiceOrderBudgetHtml(data: ServiceOrderBudgetViewModel): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Orçamento - OS ${escapeHtml(data.serviceOrderId)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #1a1a1a;
        padding: 32px;
        font-size: 12px;
      }
      h1 { font-size: 20px; margin-bottom: 4px; }
      h2 { font-size: 14px; margin-top: 24px; margin-bottom: 8px; }
      .subtitle { color: #555; margin-bottom: 24px; }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }
      .info-box {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 12px;
      }
      .info-box h3 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #555; }
      .info-box p { margin: 2px 0; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      td.numeric, th.numeric { text-align: right; }
      .total-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
        font-size: 14px;
        font-weight: bold;
      }
      .footer { margin-top: 32px; color: #888; font-size: 10px; }
    </style>
  </head>
  <body>
    <h1>Orçamento de Serviço</h1>
    <p class="subtitle">
      OS #${escapeHtml(data.serviceOrderId)} — Status: ${escapeHtml(data.status)}<br />
      ${escapeHtml(data.description)}
    </p>

    <div class="info-grid">
      <div class="info-box">
        <h3>Cliente</h3>
        <p>${escapeHtml(data.client.name)}</p>
        <p>CPF/CNPJ: ${escapeHtml(data.client.cpfCnpj)}</p>
        <p>Telefone: ${escapeHtml(data.client.phone)}</p>
        <p>Endereço: ${escapeHtml(data.client.address)}</p>
        ${data.client.email ? `<p>E-mail: ${escapeHtml(data.client.email)}</p>` : ''}
      </div>
      <div class="info-box">
        <h3>Veículo</h3>
        <p>${escapeHtml(data.vehicle.brand)} ${escapeHtml(data.vehicle.model)} (${data.vehicle.year})</p>
        <p>Placa: ${escapeHtml(data.vehicle.licensePlate)}</p>
      </div>
    </div>

    ${renderLineItemsTable('Serviços', data.services)}
    ${renderLineItemsTable('Peças e insumos', data.parts)}

    <div class="total-row">Total: ${currencyFormatter.format(data.totalAmount)}</div>

    <p class="footer">Orçamento gerado em ${dateFormatter.format(data.generatedAt)}</p>
  </body>
</html>`;
}
