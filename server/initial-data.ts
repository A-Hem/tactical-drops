import bcrypt from 'bcryptjs';
import { db } from './db';
import { InsertUser, categories, products, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // Check if we already have data
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Seeding database with initial data...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser: InsertUser = {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@justdrops.xyz',
      isAdmin: true,
      fullName: 'Admin User'
    };
    
    await db.insert(users).values(adminUser);

    // Create categories
    const categoriesData = [
      {
        name: 'Rifle Scopes',
        slug: 'rifle-scopes',
        description: 'High-quality precision rifle scopes for tactical and hunting applications.',
        imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f'
      },
      {
        name: 'Red Dot Sights',
        slug: 'red-dot-sights',
        description: 'Fast target acquisition red dot sights for close to medium range shooting.',
        imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f'
      },
      {
        name: 'Tactical Gear',
        slug: 'tactical-gear',
        description: 'Professional-grade tactical equipment for law enforcement and security.',
        imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f'
      }
    ];
    
    await db.insert(categories).values(categoriesData);
    
    // Fetch the created categories to get their IDs
    const createdCategories = await db.select().from(categories);
    const rifleScope = createdCategories.find(cat => cat.slug === 'rifle-scopes');
    
    if (rifleScope) {
      // Create products
      const productsData = [
        {
          name: 'Leupold Mark 4 Circle Dot Scope',
          slug: 'leupold-mark-4-circle-dot-scope',
          description: `The Leupold Mark 4 CQ/T is a versatile tactical scope designed for close to medium range engagements. 
          Featuring a 1-3x variable power with an illuminated Circle Dot reticle, this scope provides rapid target acquisition in CQB scenarios 
          while offering sufficient magnification for precision shots at extended ranges. Its robust construction meets military specifications, 
          ensuring reliability in the harshest conditions.`,
          price: 1299.99,
          compareAtPrice: 1499.99,
          imageUrl: 'https://images.unsplash.com/photo-1584226761916-25b55339fdb7',
          categoryId: rifleScope.id,
          inventory: 15,
          featured: true,
          isNew: true,
          isSale: true,
          rating: 4.8,
          reviewCount: 24
        }
      ];
      
      await db.insert(products).values(productsData);
    }
    
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}