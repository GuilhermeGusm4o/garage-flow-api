-- Rename ServiceOrderStatus enum value FINALIZED to FINISHED
ALTER TYPE "ServiceOrderStatus" RENAME VALUE 'FINALIZED' TO 'FINISHED';
