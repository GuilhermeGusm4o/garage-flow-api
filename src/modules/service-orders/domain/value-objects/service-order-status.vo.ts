export enum ServiceOrderStatus {
  RECEIVED = 'RECEIVED',
  IN_DIAGNOSIS = 'IN_DIAGNOSIS',
  FINISHED_DIAGNOSIS = 'FINISHED_DIAGNOSIS',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  AWAITING_EXECUTION = 'AWAITING_EXECUTION',
  IN_EXECUTION = 'IN_EXECUTION',
  FINISHED = 'FINISHED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

/**
 * Status em que a OS ainda está em andamento: o serviço não terminou e as peças
 * dela ainda não foram consumidas. FINISHED e DELIVERED já consumiram; CANCELED
 * devolve as peças.
 */
export const OPEN_SERVICE_ORDER_STATUSES: ServiceOrderStatus[] = [
  ServiceOrderStatus.RECEIVED,
  ServiceOrderStatus.IN_DIAGNOSIS,
  ServiceOrderStatus.FINISHED_DIAGNOSIS,
  ServiceOrderStatus.AWAITING_APPROVAL,
  ServiceOrderStatus.AWAITING_EXECUTION,
  ServiceOrderStatus.IN_EXECUTION,
];
