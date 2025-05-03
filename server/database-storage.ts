import { 
  users, products, productImages, productSpecifications, 
  categories, cartItems, orders, orderItems, 
  contactMessages, newsletterSubscribers, blogPosts, blogCategories, blogPostCategories,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type ProductSpecification, type ProductImage,
  type Category, type InsertCategory,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type ContactMessage, type InsertContactMessage,
  type NewsletterSubscriber, type InsertNewsletterSubscriber,
  type BlogPost, type InsertBlogPost,
  type BlogCategory, type InsertBlogCategory,
  type BlogPostCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  // Product specifications
  async getProductSpecifications(productId: number): Promise<ProductSpecification[]> {
    return await db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, productId));
  }

  async addProductSpecification(spec: { productId: number; key: string; value: string }): Promise<ProductSpecification> {
    const [specification] = await db
      .insert(productSpecifications)
      .values(spec)
      .returning();
    return specification;
  }

  // Product images
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));
  }

  async addProductImage(image: { productId: number; url: string; isMain?: boolean }): Promise<ProductImage> {
    const [productImage] = await db
      .insert(productImages)
      .values({
        productId: image.productId,
        url: image.url,
        isMain: image.isMain || false
      })
      .returning();
    return productImage;
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.sessionId, sessionId));
  }

  async getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined> {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, sessionId),
          eq(cartItems.productId, productId)
        )
      );
    return item;
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db.insert(cartItems).values(item).returning();
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id))
      .returning({ id: cartItems.id });
    return result.length > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.sessionId, sessionId))
      .returning({ id: cartItems.id });
    return result.length > 0;
  }

  // Order methods
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values({
      ...orderData,
      createdAt: new Date(),
      status: orderData.status || 'pending',
      paymentId: orderData.paymentId || null
    }).returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string, paymentId?: string): Promise<Order | undefined> {
    const updateData: Partial<Order> = { status };
    if (paymentId) {
      updateData.paymentId = paymentId;
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Order items
  async addOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(item).returning();
    return orderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  // Contact methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [contactMessage] = await db.insert(contactMessages).values({
      ...message,
      createdAt: new Date()
    }).returning();
    return contactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  // Newsletter methods
  async addNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [newsletterSubscriber] = await db.insert(newsletterSubscribers).values({
      ...subscriber,
      createdAt: new Date()
    }).returning();
    return newsletterSubscriber;
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));
    return subscriber;
  }

  // Blog post methods
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getAllBlogPosts(publishedOnly: boolean = false): Promise<BlogPost[]> {
    if (publishedOnly) {
      return await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.createdAt));
    } else {
      return await db.select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.createdAt));
    }
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values({
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return post;
  }

  async updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        ...postData,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });
    return result.length > 0;
  }

  // Blog category methods
  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, id));
    return category;
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug));
    return category;
  }

  async getAllBlogCategories(): Promise<BlogCategory[]> {
    return await db.select().from(blogCategories);
  }

  async createBlogCategory(categoryData: InsertBlogCategory): Promise<BlogCategory> {
    const [category] = await db.insert(blogCategories).values(categoryData).returning();
    return category;
  }

  async updateBlogCategory(id: number, categoryData: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const [updatedCategory] = await db
      .update(blogCategories)
      .set(categoryData)
      .where(eq(blogCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteBlogCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(blogCategories)
      .where(eq(blogCategories.id, id))
      .returning({ id: blogCategories.id });
    return result.length > 0;
  }

  // Blog post category relationship methods
  async addCategoryToBlogPost(postId: number, categoryId: number): Promise<BlogPostCategory> {
    const [relationship] = await db
      .insert(blogPostCategories)
      .values({ postId, categoryId })
      .returning();
    return relationship;
  }

  async removeCategoryFromBlogPost(postId: number, categoryId: number): Promise<boolean> {
    const result = await db
      .delete(blogPostCategories)
      .where(
        and(
          eq(blogPostCategories.postId, postId),
          eq(blogPostCategories.categoryId, categoryId)
        )
      )
      .returning({ id: blogPostCategories.id });
    return result.length > 0;
  }

  async getBlogPostCategories(postId: number): Promise<BlogCategory[]> {
    const categories = await db
      .select()
      .from(blogPostCategories)
      .innerJoin(blogCategories, eq(blogPostCategories.categoryId, blogCategories.id))
      .where(eq(blogPostCategories.postId, postId));
    
    return categories.map(row => ({
      id: row.blog_categories.id,
      name: row.blog_categories.name,
      slug: row.blog_categories.slug
    }));
  }

  async getBlogPostsByCategory(categoryId: number, publishedOnly: boolean = false): Promise<BlogPost[]> {
    if (publishedOnly) {
      const result = await db
        .select()
        .from(blogPostCategories)
        .innerJoin(blogPosts, eq(blogPostCategories.postId, blogPosts.id))
        .where(and(
          eq(blogPostCategories.categoryId, categoryId),
          eq(blogPosts.published, true)
        ))
        .orderBy(desc(blogPosts.createdAt));
        
      return result.map(row => ({
        id: row.blog_posts.id,
        title: row.blog_posts.title,
        slug: row.blog_posts.slug,
        content: row.blog_posts.content,
        excerpt: row.blog_posts.excerpt,
        coverImageUrl: row.blog_posts.coverImageUrl,
        authorId: row.blog_posts.authorId,
        published: row.blog_posts.published,
        publishedAt: row.blog_posts.publishedAt,
        createdAt: row.blog_posts.createdAt,
        updatedAt: row.blog_posts.updatedAt
      }));
    } else {
      const result = await db
        .select()
        .from(blogPostCategories)
        .innerJoin(blogPosts, eq(blogPostCategories.postId, blogPosts.id))
        .where(eq(blogPostCategories.categoryId, categoryId))
        .orderBy(desc(blogPosts.createdAt));
        
      return result.map(row => ({
        id: row.blog_posts.id,
        title: row.blog_posts.title,
        slug: row.blog_posts.slug,
        content: row.blog_posts.content,
        excerpt: row.blog_posts.excerpt,
        coverImageUrl: row.blog_posts.coverImageUrl,
        authorId: row.blog_posts.authorId,
        published: row.blog_posts.published,
        publishedAt: row.blog_posts.publishedAt,
        createdAt: row.blog_posts.createdAt,
        updatedAt: row.blog_posts.updatedAt
      }));
    }
  }
}