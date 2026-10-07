import { z } from "zod";
import { PRODUCT_IMAGES, PRODUCT_CATEGORIES } from "@/lib/catalog";

export const passcodeSchema = z.string().min(8, "Use at least 8 characters.").max(72, "Use no more than 72 characters.").regex(/^[\x20-\x7E]+$/, "Use letters, numbers and standard symbols.");
export const employeeSchema = z.object({
  employeeId: z.string().trim().min(1).max(40).regex(/^[a-zA-Z0-9_-]+$/, "Use letters, numbers, hyphens or underscores for the employee ID."),
  fullName: z.string().trim().min(1, "Full name is required.").max(120),
  pin: passcodeSchema,
  isActive: z.boolean().default(true),
}).strict();
export const employeeUpdateSchema = employeeSchema.omit({ employeeId: true }).extend({ pin: passcodeSchema.optional() });
const money = z.number().finite().min(0).max(10000).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.000001, "Use a price with no more than two decimal places.");
export const productSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().default(null),
  marketPrice: money,
  discountedPrice: money,
  category: z.enum(PRODUCT_CATEGORIES),
  unit: z.string().trim().min(1).max(40),
  imagePath: z.enum(PRODUCT_IMAGES).nullable(),
  isActive: z.boolean(),
}).strict().refine(p => p.discountedPrice <= p.marketPrice, "The staff price cannot exceed the regular price.");
export const cycleSchema = z.object({
  name: z.string().trim().min(1, "Cycle name is required.").max(120),
  deadline: z.iso.datetime().nullable().default(null),
}).strict();
export const cycleUpdateSchema = cycleSchema.partial().extend({ status: z.enum(["draft", "open", "closed"]).optional() }).strict();
export const cycleProductSchema = z.object({
  productId: z.string().min(1),
  price: money,
  maxQtyPerPerson: z.number().int().min(1).max(100),
}).strict();
export const itemsSchema = z.array(z.object({
  cycleProductId: z.string().min(1).max(80),
  quantity: z.number().int("Quantities must be whole numbers.").min(1).max(100),
}).strict()).min(1, "Add at least one product.").max(100).superRefine((items, ctx) => {
  if (new Set(items.map(i => i.cycleProductId)).size !== items.length) {
    ctx.addIssue({ code: "custom", message: "A product can only appear once in an order." });
  }
});
export const createOrderSchema = z.object({ cycleId: z.string().min(1).max(80), items: itemsSchema }).strict();
export const updateOrderSchema = z.object({ items: itemsSchema }).strict();
