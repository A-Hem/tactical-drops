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
  newsletterSubscribers, NewsletterSubscriber, InsertNewsletterSubscriber
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
}

// Memory Storage Implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private productSpecs: Map<number, ProductSpecification>;
  private productImages: Map<number, ProductImage>;
  private categories: Map<number, Category>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private contactMessages: Map<number, ContactMessage>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  
  private userId: number;
  private productId: number;
  private productSpecId: number;
  private productImageId: number;
  private categoryId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;
  private contactMessageId: number;
  private newsletterSubscriberId: number;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.productSpecs = new Map();
    this.productImages = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.contactMessages = new Map();
    this.newsletterSubscribers = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.productSpecId = 1;
    this.productImageId = 1;
    this.categoryId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.contactMessageId = 1;
    this.newsletterSubscriberId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  // Initialize data
  private initializeData() {
    // Add categories
    const rifleScopes = this.createCategory({
      name: "Rifle Scopes",
      slug: "rifle-scopes",
      description: "Precision optics for enhanced accuracy",
      imageUrl: "https://images.unsplash.com/photo-1584556812952-70d4we33e197?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    });
    
    const tacticalGear = this.createCategory({
      name: "Tactical Gear",
      slug: "tactical-gear",
      description: "Professional equipment for field operations",
      imageUrl: "https://images.unsplash.com/photo-1585421514284-efb74320d621?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    });
    
    const lawEnforcement = this.createCategory({
      name: "Law Enforcement",
      slug: "law-enforcement",
      description: "Specialized equipment for security personnel",
      imageUrl: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    });
    
    // Add products
    const leupoldScope = this.createProduct({
      name: "Leupold Mark 4 Circle Dot Scope",
      slug: "leupold-mark-4-circle-dot-scope",
      description: "Precision-engineered optics with superior light transmission. Illuminated reticle with multiple brightness settings. Waterproof, fogproof, and shockproof construction. Durable aircraft-grade aluminum housing. Includes lens covers, mounting hardware, and carrying case.",
      price: "899.99",
      compareAtPrice: "999.99",
      imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      categoryId: rifleScopes.id,
      inventory: 25,
      featured: true,
      isNew: false,
      isSale: true,
      rating: "4.5",
      reviewCount: 24
    });
    
    // Add product specs
    this.addProductSpecification({
      productId: leupoldScope.id,
      key: "Magnification",
      value: "3.5-10x"
    });
    
    this.addProductSpecification({
      productId: leupoldScope.id,
      key: "Objective Lens",
      value: "40mm"
    });
    
    this.addProductSpecification({
      productId: leupoldScope.id,
      key: "Reticle",
      value: "Circle Dot"
    });
    
    this.addProductSpecification({
      productId: leupoldScope.id,
      key: "Weight",
      value: "16.5 oz / 468g"
    });
    
    this.addProductSpecification({
      productId: leupoldScope.id,
      key: "Tube Diameter",
      value: "30mm"
    });
    
    this.addProductSpecification({
      productId: leupoldScope.id,
      key: "Eye Relief",
      value: "3.7-4.2 inches"
    });
    
    // Add product images
    this.addProductImage({
      productId: leupoldScope.id,
      url: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      isMain: true
    });
    
    this.addProductImage({
      productId: leupoldScope.id,
      url: "https://images.unsplash.com/photo-1584556812950-d71353842ec4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    });
    
    // Add more products
    this.createProduct({
      name: "Professional Tactical Vest",
      slug: "professional-tactical-vest",
      description: "Heavy-duty tactical vest designed for law enforcement and security professionals. Features multiple pockets, MOLLE webbing, and adjustable sizing for a perfect fit.",
      price: "249.99",
      imageUrl: "https://images.unsplash.com/photo-1584556812952-70d4ee7a6397?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      categoryId: tacticalGear.id,
      inventory: 40,
      featured: false,
      isNew: false,
      isSale: false,
      rating: "4.0",
      reviewCount: 8
    });
    
    this.createProduct({
      name: "High-Output Tactical Flashlight",
      slug: "high-output-tactical-flashlight",
      description: "Powerful LED tactical flashlight with multiple modes, strobe function, and rugged construction. Water-resistant and impact-resistant design for field use.",
      price: "89.99",
      imageUrl: "https://images.unsplash.com/photo-1593809953517-99c6c79813fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      categoryId: lawEnforcement.id,
      inventory: 75,
      featured: false,
      isNew: true,
      isSale: false,
      rating: "5.0",
      reviewCount: 12
    });
    
    this.createProduct({
      name: "Tactical Gloves - Heavy Duty",
      slug: "tactical-gloves-heavy-duty",
      description: "Durable tactical gloves with reinforced knuckles and palms. Touch-screen compatible with excellent grip in all conditions.",
      price: "49.99",
      imageUrl: "https://images.unsplash.com/photo-1585418208385-940b80e9bbce?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      categoryId: tacticalGear.id,
      inventory: 100,
      featured: false,
      isNew: false,
      isSale: false,
      rating: "3.5",
      reviewCount: 24
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, isAdmin: false };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug
    );
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured
    );
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  // Product specifications
  async getProductSpecifications(productId: number): Promise<ProductSpecification[]> {
    return Array.from(this.productSpecs.values()).filter(
      (spec) => spec.productId === productId
    );
  }
  
  async addProductSpecification(spec: { productId: number; key: string; value: string }): Promise<ProductSpecification> {
    const id = this.productSpecId++;
    const newSpec = { ...spec, id };
    this.productSpecs.set(id, newSpec);
    return newSpec;
  }
  
  // Product images
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return Array.from(this.productImages.values()).filter(
      (image) => image.productId === productId
    );
  }
  
  async addProductImage(image: { productId: number; url: string; isMain?: boolean }): Promise<ProductImage> {
    const id = this.productImageId++;
    const newImage: ProductImage = { ...image, id, isMain: image.isMain || false };
    this.productImages.set(id, newImage);
    return newImage;
  }
  
  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }
  
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId
    );
  }
  
  async getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.sessionId === sessionId && item.productId === productId
    );
  }
  
  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemId++;
    const newItem: CartItem = { ...item, id };
    this.cartItems.set(id, newItem);
    return newItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(sessionId: string): Promise<boolean> {
    const cartItems = await this.getCartItems(sessionId);
    for (const item of cartItems) {
      this.cartItems.delete(item.id);
    }
    return true;
  }
  
  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async updateOrderStatus(id: number, status: string, paymentId?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status, 
      ...(paymentId ? { paymentId } : {}) 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order items
  async addOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  // Contact methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageId++;
    const newMessage: ContactMessage = { 
      ...message, 
      id, 
      createdAt: new Date() 
    };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
  
  // Newsletter methods
  async addNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = this.newsletterSubscriberId++;
    const newSubscriber: NewsletterSubscriber = { 
      ...subscriber, 
      id, 
      createdAt: new Date() 
    };
    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }
  
  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    return Array.from(this.newsletterSubscribers.values()).find(
      (subscriber) => subscriber.email.toLowerCase() === email.toLowerCase()
    );
  }
}

export const storage = new MemStorage();
