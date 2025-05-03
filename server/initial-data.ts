import { db } from "./db";
import { categories, products, productImages, productSpecifications } from "@shared/schema";

// Clear existing data (uncomment if needed)
// await db.delete(productSpecifications);
// await db.delete(productImages);
// await db.delete(products);
// await db.delete(categories);

export async function seedDatabase() {
  console.log("Seeding database with initial data...");

  // Check if categories already exist
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  // Insert categories
  const [rifleScopes] = await db.insert(categories).values({
    name: "Rifle Scopes",
    slug: "rifle-scopes",
    description: "High-quality rifle scopes for tactical applications",
    imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842db1f?q=80&w=3000"
  }).returning();

  const [tacticalGear] = await db.insert(categories).values({
    name: "Tactical Gear",
    slug: "tactical-gear",
    description: "Professional tactical gear for law enforcement and military",
    imageUrl: "https://images.unsplash.com/photo-1590424592104-3fd0652fe777?q=80&w=3000"
  }).returning();

  // Insert products
  const [leupoldScope] = await db.insert(products).values({
    name: "Leupold Mark 4 Circle Dot Scope",
    slug: "leupold-mark-4-circle-dot-scope",
    description: "The Leupold Mark 4 Circle Dot Scope is a premium tactical scope designed for professional applications. Featuring advanced optical technology, this scope provides exceptional clarity and precision in all lighting conditions.",
    price: "1299.99",
    compareAtPrice: "1499.99",
    imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842db1f?q=80&w=1200",
    categoryId: rifleScopes.id,
    inventory: 15,
    featured: true,
    isNew: true,
    isSale: true,
    rating: "4.8",
    reviewCount: 24
  }).returning();

  // Add product images
  await db.insert(productImages).values([
    { 
      productId: leupoldScope.id, 
      url: "https://images.unsplash.com/photo-1595590424283-b8f17842db1f?q=80&w=1200", 
      isMain: true 
    },
    { 
      productId: leupoldScope.id, 
      url: "https://images.unsplash.com/photo-1595590424283-b8f17842db1f?q=80&w=1000", 
      isMain: false 
    },
    { 
      productId: leupoldScope.id, 
      url: "https://images.unsplash.com/photo-1618500299503-5b2643b8860d?q=80&w=3000", 
      isMain: false 
    }
  ]);

  // Add product specifications
  await db.insert(productSpecifications).values([
    { productId: leupoldScope.id, key: "Magnification", value: "3-9x" },
    { productId: leupoldScope.id, key: "Objective Lens", value: "40mm" },
    { productId: leupoldScope.id, key: "Reticle", value: "Circle Dot" },
    { productId: leupoldScope.id, key: "Tube Size", value: "30mm" },
    { productId: leupoldScope.id, key: "Weight", value: "16.5 oz" },
    { productId: leupoldScope.id, key: "Length", value: "12.5 inches" },
    { productId: leupoldScope.id, key: "Adjustment", value: "1/4 MOA" },
    { productId: leupoldScope.id, key: "Waterproof", value: "Yes" }
  ]);

  // Add tactical vest product
  const [tacticalVest] = await db.insert(products).values({
    name: "Professional Tactical Vest",
    slug: "professional-tactical-vest",
    description: "Heavy-duty tactical vest designed for law enforcement and security personnel. Features multiple pouches, MOLLE system compatibility, and adjustable sizing for comfort during extended operations.",
    price: "249.99",
    compareAtPrice: "299.99",
    imageUrl: "https://images.unsplash.com/photo-1590424592104-3fd0652fe777?q=80&w=1500",
    categoryId: tacticalGear.id,
    inventory: 28,
    featured: true,
    isNew: true,
    isSale: false,
    rating: "4.6",
    reviewCount: 18
  }).returning();

  // Add product images for tactical vest
  await db.insert(productImages).values([
    { 
      productId: tacticalVest.id, 
      url: "https://images.unsplash.com/photo-1590424592104-3fd0652fe777?q=80&w=1500", 
      isMain: true 
    },
    { 
      productId: tacticalVest.id, 
      url: "https://images.unsplash.com/photo-1542549369-ddb5961915d8?q=80&w=3000", 
      isMain: false 
    }
  ]);

  // Add product specifications for tactical vest
  await db.insert(productSpecifications).values([
    { productId: tacticalVest.id, key: "Material", value: "1000D Nylon" },
    { productId: tacticalVest.id, key: "Color", value: "Black" },
    { productId: tacticalVest.id, key: "Size", value: "Adjustable" },
    { productId: tacticalVest.id, key: "Weight", value: "3.5 lbs" },
    { productId: tacticalVest.id, key: "Pouches", value: "8" },
    { productId: tacticalVest.id, key: "Compatibility", value: "MOLLE/PALS" }
  ]);

  console.log("Database seeded successfully!");
}