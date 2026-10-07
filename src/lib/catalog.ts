export const PRODUCT_CATEGORIES = ["Dairy", "Drinks", "Pantry"] as const;
export const PRODUCT_IMAGES = [
  "/images/products/milk.webp",
  "/images/products/orange-juice.webp",
  "/images/products/strawberry-yogurt.webp",
  "/images/products/honey.webp",
  "/images/products/cheddar.webp",
  "/images/products/granola.webp",
] as const;
export const IMAGE_OPTIONS = [
  { label: "Milk", path: PRODUCT_IMAGES[0] },
  { label: "Orange juice", path: PRODUCT_IMAGES[1] },
  { label: "Strawberry yoghurt", path: PRODUCT_IMAGES[2] },
  { label: "Honey", path: PRODUCT_IMAGES[3] },
  { label: "Cheddar", path: PRODUCT_IMAGES[4] },
  { label: "Granola", path: PRODUCT_IMAGES[5] },
];
export function productImage(path: string | null, name: string) {
  if (path && PRODUCT_IMAGES.includes(path as typeof PRODUCT_IMAGES[number])) return path;
  const text = name.toLowerCase();
  if (/yog[h]?urt/.test(text)) return PRODUCT_IMAGES[2];
  if (/milk/.test(text)) return PRODUCT_IMAGES[0];
  if (/juice|orange/.test(text)) return PRODUCT_IMAGES[1];
  if (/honey/.test(text)) return PRODUCT_IMAGES[3];
  if (/cheddar|cheese/.test(text)) return PRODUCT_IMAGES[4];
  if (/granola|oat|cereal/.test(text)) return PRODUCT_IMAGES[5];
  return null;
}
export const demoProducts = [
  { sku: "DEMO-MILK", name: "Fresh full-cream milk", description: "A fridge staple for coffee, cereal and everything in between.", category: "Dairy", unit: "1 litre", marketPrice: 4.5, discountedPrice: 3.2, imagePath: PRODUCT_IMAGES[0], maxQty: 4 },
  { sku: "DEMO-JUICE", name: "Orange juice", description: "Bright, refreshing orange juice for a sunny start to your day.", category: "Drinks", unit: "1 litre", marketPrice: 6.5, discountedPrice: 4.4, imagePath: PRODUCT_IMAGES[1], maxQty: 3 },
  { sku: "DEMO-YOGURT", name: "Strawberry Greek yoghurt", description: "Thick, creamy yoghurt with a little berry sweetness.", category: "Dairy", unit: "500 g", marketPrice: 7.2, discountedPrice: 4.8, imagePath: PRODUCT_IMAGES[2], maxQty: 3 },
  { sku: "DEMO-HONEY", name: "Golden honey", description: "A spoonful of sweetness for toast, tea and breakfast bowls.", category: "Pantry", unit: "350 g", marketPrice: 9.5, discountedPrice: 6.5, imagePath: PRODUCT_IMAGES[3], maxQty: 2 },
  { sku: "DEMO-CHEDDAR", name: "Mature cheddar", description: "A rich, mellow cheddar for sandwiches and sharing.", category: "Dairy", unit: "250 g", marketPrice: 6.8, discountedPrice: 4.6, imagePath: PRODUCT_IMAGES[4], maxQty: 3 },
  { sku: "DEMO-GRANOLA", name: "Oat & almond granola", description: "Golden, crunchy oat clusters for your breakfast ritual.", category: "Pantry", unit: "400 g", marketPrice: 8.9, discountedPrice: 5.9, imagePath: PRODUCT_IMAGES[5], maxQty: 2 },
];
