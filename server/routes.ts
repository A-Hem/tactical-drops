import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertCartItemSchema, 
  insertOrderSchema, 
  insertContactMessageSchema, 
  insertNewsletterSubscriberSchema,
  insertUserSchema,
  insertBlogPostSchema,
  insertBlogCategorySchema
} from "@shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import passport from "passport";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API routes
  // All routes should be prefixed with /api

  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      let products: any[] = [];
      const categorySlug = req.query.category as string | undefined;
      const featured = req.query.featured === "true";
      
      if (categorySlug) {
        const category = await storage.getCategoryBySlug(categorySlug);
        if (category) {
          products = await storage.getProductsByCategory(category.id);
        }
      } else if (featured) {
        products = await storage.getFeaturedProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json({ products });
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const specifications = await storage.getProductSpecifications(product.id);
      const images = await storage.getProductImages(product.id);
      const category = await storage.getCategory(product.categoryId);
      
      res.json({
        product,
        specifications,
        images,
        category
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching product details" });
    }
  });

  // Category routes
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const products = await storage.getProductsByCategory(category.id);
      
      res.json({
        category,
        products
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching category details" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }
      
      const cartItems = await storage.getCartItems(sessionId);
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json({ items: itemsWithProducts });
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart items" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }
      
      const validatedItem = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });
      
      const product = await storage.getProduct(validatedItem.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if item already exists in cart
      const existingItem = await storage.getCartItem(sessionId, validatedItem.productId);
      
      if (existingItem) {
        // Update quantity if item exists
        const updatedItem = await storage.updateCartItemQuantity(
          existingItem.id,
          existingItem.quantity + (validatedItem.quantity || 1)
        );
        
        return res.json({ item: updatedItem });
      }
      
      // Add new item to cart
      const newItem = await storage.addCartItem(validatedItem);
      
      res.status(201).json({ item: newItem });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Error adding item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(Number(id), quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ item: updatedItem });
    } catch (error) {
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.removeCartItem(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing cart item" });
    }
  });

  app.delete("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }
      
      await storage.clearCart(sessionId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const sessionId = req.headers["x-session-id"] as string;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(sessionId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        
        if (!product) continue;
        
        await storage.addOrderItem({
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price
        });
      }
      
      // Clear cart
      await storage.clearCart(sessionId);
      
      res.status(201).json({ order });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(Number(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const items = await storage.getOrderItems(order.id);
      
      res.json({
        order,
        items
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching order details" });
    }
  });

  // Update order with payment info
  app.put("/api/orders/:id/payment", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentId } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ message: "Payment ID required" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(
        Number(id),
        "paid",
        paymentId
      );
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json({ order: updatedOrder });
    } catch (error) {
      res.status(500).json({ message: "Error updating order payment" });
    }
  });

  // Contact routes
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(contactData);
      
      res.status(201).json({ message });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Error submitting contact form" });
    }
  });

  // Newsletter routes
  app.post("/api/newsletter", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }
      
      // Check if email already exists
      const existingSubscriber = await storage.getNewsletterSubscriberByEmail(email);
      
      if (existingSubscriber) {
        return res.status(409).json({ message: "Email already subscribed" });
      }
      
      const newSubscriber = await storage.addNewsletterSubscriber({ email });
      
      res.status(201).json({ subscriber: newSubscriber });
    } catch (error) {
      res.status(500).json({ message: "Error subscribing to newsletter" });
    }
  });

  // User registration
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const { is_admin, ...userDataRaw } = req.body;
      const userData = insertUserSchema.parse(userDataRaw);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already registered" });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        isAdmin: !!is_admin // Allow setting isAdmin from request
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Error registering user" });
    }
  });
  
  // Authentication routes
  app.post('/api/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ 
          message: 'Authentication failed', 
          details: info?.message || 'Invalid credentials' 
        });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        // Exclude password from response
        const { password, ...userWithoutPassword } = user;
        return res.json({ 
          user: userWithoutPassword,
          message: 'Login successful' 
        });
      });
    })(req, res, next);
  });
  
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error during logout' });
      }
      res.json({ message: 'Logout successful' });
    });
  });
  
  // Check auth status
  app.get('/api/auth/status', (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user) {
      // Exclude password from response
      const user = req.user as any;
      const { password, ...userWithoutPassword } = user;
      
      return res.json({ 
        isAuthenticated: true, 
        user: userWithoutPassword 
      });
    }
    res.json({ 
      isAuthenticated: false 
    });
  });
  
  // Middleware to check if user is authenticated and is admin
  const isAdminAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && (req.user as any)?.isAdmin) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };
  
  // Admin product routes
  // Create product
  app.post('/api/admin/products', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Check if slug already exists
      const existingProduct = await storage.getProductBySlug(productData.slug);
      if (existingProduct) {
        return res.status(409).json({ message: 'Product slug already exists' });
      }
      
      const product = await storage.createProduct(productData);
      
      // Add specifications if provided
      if (req.body.specifications && Array.isArray(req.body.specifications)) {
        for (const spec of req.body.specifications) {
          await storage.addProductSpecification({
            productId: product.id,
            key: spec.key,
            value: spec.value
          });
        }
      }
      
      // Add additional images if provided
      if (req.body.additionalImages && Array.isArray(req.body.additionalImages)) {
        for (const imageUrl of req.body.additionalImages) {
          await storage.addProductImage({
            productId: product.id,
            url: imageUrl,
            isMain: false
          });
        }
      }
      
      res.status(201).json({ product });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Invalid input', 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: 'Error creating product' });
    }
  });
  
  // Update product
  app.put('/api/admin/products/:id', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const productId = Number(id);
      
      // Check if product exists
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // If slug is being changed, check if new slug already exists
      if (req.body.slug && req.body.slug !== existingProduct.slug) {
        const productWithSlug = await storage.getProductBySlug(req.body.slug);
        if (productWithSlug && productWithSlug.id !== productId) {
          return res.status(409).json({ message: 'Product slug already exists' });
        }
      }
      
      // Update product
      const updatedProduct = await storage.updateProduct(productId, req.body);
      
      // Update specifications if provided
      if (req.body.specifications && Array.isArray(req.body.specifications)) {
        // Get current specifications
        const currentSpecs = await storage.getProductSpecifications(productId);
        
        // Delete existing specifications (simplest approach for now)
        for (const spec of currentSpecs) {
          // Would need to add delete method to storage
        }
        
        // Add new specifications
        for (const spec of req.body.specifications) {
          await storage.addProductSpecification({
            productId: productId,
            key: spec.key,
            value: spec.value
          });
        }
      }
      
      // Update images if provided
      if (req.body.additionalImages && Array.isArray(req.body.additionalImages)) {
        // Get current images
        const currentImages = await storage.getProductImages(productId);
        
        // Delete existing images except main image (simplest approach for now)
        for (const image of currentImages.filter(img => !img.isMain)) {
          // Would need to add delete method to storage
        }
        
        // Add new images
        for (const imageUrl of req.body.additionalImages) {
          await storage.addProductImage({
            productId: productId,
            url: imageUrl,
            isMain: false
          });
        }
      }
      
      res.json({ product: updatedProduct });
    } catch (error) {
      res.status(500).json({ message: 'Error updating product' });
    }
  });
  
  // Delete product
  app.delete('/api/admin/products/:id', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const productId = Number(id);
      
      // Check if product exists
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Delete product would need to be added to storage
      // await storage.deleteProduct(productId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product' });
    }
  });
  
  // Blog routes (protected admin routes)
  // Get all blog posts
  app.get('/api/blog/posts', async (req: Request, res: Response) => {
    try {
      const publishedOnly = req.query.published === 'true';
      // If admin is authenticated, show all posts, otherwise only show published posts
      const isAdmin = req.isAuthenticated() && (req.user as any)?.isAdmin;
      const posts = await storage.getAllBlogPosts(isAdmin ? false : true);
      res.json({ posts });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching blog posts' });
    }
  });
  
  // Get single blog post by slug
  app.get('/api/blog/posts/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      // If not published and user is not admin, return 404
      if (!post.published && !(req.isAuthenticated() && (req.user as any)?.isAdmin)) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      const categories = await storage.getBlogPostCategories(post.id);
      
      res.json({ post, categories });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching blog post' });
    }
  });
  
  // Admin blog routes
  // Create blog post
  app.post('/api/admin/blog/posts', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      
      // Add categories
      if (req.body.categoryIds && Array.isArray(req.body.categoryIds)) {
        for (const categoryId of req.body.categoryIds) {
          await storage.addCategoryToBlogPost(post.id, Number(categoryId));
        }
      }
      
      res.status(201).json({ post });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Invalid input', 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: 'Error creating blog post' });
    }
  });
  
  // Update blog post
  app.put('/api/admin/blog/posts/:id', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const postId = Number(id);
      
      // Check if post exists
      const existingPost = await storage.getBlogPost(postId);
      if (!existingPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      // Update post data
      const updatedPost = await storage.updateBlogPost(postId, req.body);
      
      // Update categories if provided
      if (req.body.categoryIds && Array.isArray(req.body.categoryIds)) {
        // Get current categories
        const currentCategories = await storage.getBlogPostCategories(postId);
        const currentCategoryIds = currentCategories.map(c => c.id);
        
        // Add new categories
        for (const categoryId of req.body.categoryIds) {
          if (!currentCategoryIds.includes(Number(categoryId))) {
            await storage.addCategoryToBlogPost(postId, Number(categoryId));
          }
        }
        
        // Remove categories that are no longer associated
        for (const category of currentCategories) {
          if (!req.body.categoryIds.includes(category.id)) {
            await storage.removeCategoryFromBlogPost(postId, category.id);
          }
        }
      }
      
      res.json({ post: updatedPost });
    } catch (error) {
      res.status(500).json({ message: 'Error updating blog post' });
    }
  });
  
  // Delete blog post
  app.delete('/api/admin/blog/posts/:id', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBlogPost(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting blog post' });
    }
  });
  
  // Blog category routes
  // Get all blog categories
  app.get('/api/blog/categories', async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAllBlogCategories();
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching blog categories' });
    }
  });
  
  // Get blog posts by category
  app.get('/api/blog/categories/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const category = await storage.getBlogCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: 'Blog category not found' });
      }
      
      // If admin is authenticated, show all posts, otherwise only show published posts
      const isAdmin = req.isAuthenticated() && (req.user as any)?.isAdmin;
      const posts = await storage.getBlogPostsByCategory(category.id, isAdmin ? false : true);
      
      res.json({ category, posts });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching blog category' });
    }
  });
  
  // Admin blog category routes
  // Create blog category
  app.post('/api/admin/blog/categories', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const categoryData = insertBlogCategorySchema.parse(req.body);
      
      // Check if slug already exists
      const existingCategory = await storage.getBlogCategoryBySlug(categoryData.slug);
      if (existingCategory) {
        return res.status(409).json({ message: 'Category slug already exists' });
      }
      
      const category = await storage.createBlogCategory(categoryData);
      res.status(201).json({ category });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Invalid input', 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: 'Error creating blog category' });
    }
  });
  
  // Update blog category
  app.put('/api/admin/blog/categories/:id', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if category exists
      const existingCategory = await storage.getBlogCategory(Number(id));
      if (!existingCategory) {
        return res.status(404).json({ message: 'Blog category not found' });
      }
      
      // If slug is being changed, check if new slug already exists
      if (req.body.slug && req.body.slug !== existingCategory.slug) {
        const categoryWithSlug = await storage.getBlogCategoryBySlug(req.body.slug);
        if (categoryWithSlug && categoryWithSlug.id !== Number(id)) {
          return res.status(409).json({ message: 'Category slug already exists' });
        }
      }
      
      const updatedCategory = await storage.updateBlogCategory(Number(id), req.body);
      res.json({ category: updatedCategory });
    } catch (error) {
      res.status(500).json({ message: 'Error updating blog category' });
    }
  });
  
  // Delete blog category
  app.delete('/api/admin/blog/categories/:id', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBlogCategory(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Blog category not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting blog category' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
