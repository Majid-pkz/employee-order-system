ALTER TABLE "Admin" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Employee" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "sku" TEXT;
ALTER TABLE "Product" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Pantry';
ALTER TABLE "Product" ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'each';
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
ALTER TABLE "OrderCycle" ADD COLUMN "nextOrderNumber" INTEGER NOT NULL DEFAULT 1;
UPDATE "OrderCycle" SET "nextOrderNumber" = COALESCE((SELECT MAX(CAST(substr("orderNumber", instr("orderNumber", '-') + 1) AS INTEGER)) + 1 FROM "Order" WHERE "cycleId" = "OrderCycle"."id"), 1);
UPDATE "OrderCycle" SET "status" = 'closed' WHERE "status" = 'open' AND "id" != (SELECT "id" FROM "OrderCycle" WHERE "status" = 'open' ORDER BY "createdAt" DESC, "id" DESC LIMIT 1);
CREATE UNIQUE INDEX "OrderCycle_one_open" ON "OrderCycle"("status") WHERE "status" = 'open';
CREATE TABLE "LoginAttempt" ("key" TEXT NOT NULL PRIMARY KEY, "attempts" INTEGER NOT NULL DEFAULT 0, "resetAt" DATETIME NOT NULL);
-- Retire all former product-image references; curated images are selected in the admin form.
UPDATE "Product" SET "imagePath" = NULL;
