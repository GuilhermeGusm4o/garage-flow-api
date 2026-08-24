import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

/**
 * Ordens de serviço nesses status ainda vão consumir peça, então o que elas
 * reservaram é descontado do estoque lógico. FINISHED e DELIVERED já consumiram;
 * CANCELED devolve a peça.
 */
export const STOCK_RESERVING_STATUSES: string[] = [
  ServiceOrderStatus.RECEIVED,
  ServiceOrderStatus.IN_DIAGNOSIS,
  ServiceOrderStatus.AWAITING_APPROVAL,
  ServiceOrderStatus.IN_EXECUTION,
];
