-- Add the status used for approved service orders waiting to start execution.
ALTER TYPE "ServiceOrderStatus" ADD VALUE 'AWAITING_EXECUTION' AFTER 'AWAITING_APPROVAL';
