import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertCartItemSchema, 
  insertOrderSchema, 
  insertContactMessageSchema, 
  insertNewsletterSubscriberSchema,
  insertUserSchema
} from "@shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API routes
  // All routes should be prefixed with /api

  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      let products;
      const categorySlug = req.query.category as string | undefined;
      const featured = req.query.featured === "true";
      
      if (categorySlug) {
        const category = await storage.getCategoryBySlug(categorySlug);
        if (category) {
          products = await storage.getProductsByCategory(category.id);
        } else {
          products = [];
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
          existingItem.quantity + validatedItem.quantity
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
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already registered" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
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

  const httpServer = createServer(app);

  return httpServer;
}
