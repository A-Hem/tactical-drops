import {
  users, User, InsertUser,
  products, Product, InsertProduct,
  productSpecifications, ProductSpecification,
  productImages, ProductImage,
  categories, Category, InsertCategory,
  cartItems, CartItem, InsertCartItem,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  contactMessages, ContactMessage, InsertContactMessage,
  newsletterSubscribers, NewsletterSubscriber, InsertNewsletterSubscriber,
  blogPosts, BlogPost, InsertBlogPost,
  blogCategories, BlogCategory, InsertBlogCategory,
  blogPostCategories, BlogPostCategory
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Product specifications
  getProductSpecifications(productId: number): Promise<ProductSpecification[]>;
  addProductSpecification(spec: { productId: number; key: string; value: string }): Promise<ProductSpecification>;
  
  // Product images
  getProductImages(productId: number): Promise<ProductImage[]>;
  addProductImage(image: { productId: number; url: string; isMain?: boolean }): Promise<ProductImage>;
  
  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Cart methods
  getCartItems(sessionId: string): Promise<CartItem[]>;
  getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string, paymentId?: string): Promise<Order | undefined>;
  
  // Order items
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Contact methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  
  // Newsletter methods
  addNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  
  // Blog post methods
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  createBlogPost(postData: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Blog category methods
  getBlogCategory(id: number): Promise<BlogCategory | undefined>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined>;
  getAllBlogCategories(): Promise<BlogCategory[]>;
  createBlogCategory(categoryData: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: number, categoryData: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined>;
  deleteBlogCategory(id: number): Promise<boolean>;
  
  // Blog post category relationship methods
  addCategoryToBlogPost(postId: number, categoryId: number): Promise<BlogPostCategory>;
  removeCategoryFromBlogPost(postId: number, categoryId: number): Promise<boolean>;
  getBlogPostCategories(postId: number): Promise<BlogCategory[]>;
  getBlogPostsByCategory(categoryId: number, publishedOnly?: boolean): Promise<BlogPost[]>;
}

// Import the database storage implementation
import { DatabaseStorage } from "./database-storage";

// Export an instance of the database storage
export const storage = new DatabaseStorage();