import test from "node:test";
import assert from "node:assert/strict";
import { createOrderSchema, itemsSchema, productSchema } from "../src/lib/validation";
import { assertCycleOpen } from "../src/lib/orders";
import { PRODUCT_IMAGES } from "../src/lib/catalog";
test("rejects forged employee identities", () => { assert.equal(createOrderSchema.safeParse({ cycleId: "cycle", employeeId: "someone-else", items: [{ cycleProductId: "product", quantity: 1 }] }).success, false); });
test("rejects repeated product lines instead of bypassing the limit", () => { assert.equal(itemsSchema.safeParse([{ cycleProductId: "same", quantity: 2 }, { cycleProductId: "same", quantity: 2 }]).success, false); });
for (const quantity of [-1, 0, 1.5, "2", null, 101]) test("rejects invalid quantity " + String(quantity), () => { assert.equal(itemsSchema.safeParse([{ cycleProductId: "product", quantity }]).success, false); });
test("accepts a valid whole-number quantity", () => { assert.equal(itemsSchema.safeParse([{ cycleProductId: "product", quantity: 2 }]).success, true); });
test("deadline is enforced at its exact instant", () => { const deadline = new Date("2026-10-07T04:00:00Z"); assert.throws(() => assertCycleOpen({ status: "open", deadline }, deadline), /deadline/); });
test("future cycles cannot accept orders", () => { assert.throws(() => assertCycleOpen({ status: "open", deadline: null, startDate: new Date("2030-01-01") }, new Date("2026-01-01")), /not started/); });
test("closed cycles reject edits and submissions", () => { assert.throws(() => assertCycleOpen({ status: "closed", deadline: null }), /closed/); });
test("rejects external and former upload image paths", () => {
  const product = { name: "Milk", description: null, category: "Dairy", unit: "1 litre", marketPrice: 5, discountedPrice: 4, isActive: true };
  for (const imagePath of ["https://example.com/logo.png", "/uploads/products/brand.png", "../../private.txt"]) assert.equal(productSchema.safeParse({ ...product, imagePath }).success, false);
  assert.equal(productSchema.safeParse({ ...product, imagePath: PRODUCT_IMAGES[0] }).success, true);
});
test("rejects inaccurate money and staff prices above regular prices", () => {
  const product = { name: "Milk", description: null, category: "Dairy", unit: "1 litre", imagePath: null, isActive: true };
  assert.equal(productSchema.safeParse({ ...product, marketPrice: 5, discountedPrice: 5.1 }).success, false);
  assert.equal(productSchema.safeParse({ ...product, marketPrice: 5, discountedPrice: 3.111 }).success, false);
});
