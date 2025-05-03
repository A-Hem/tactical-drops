import { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@shared/schema";
import { nanoid } from "nanoid";
import { apiRequest } from "@/lib/queryClient";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface AddCartItem {
  productId: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: AddCartItem) => Promise<void>;
  updateItemQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total items and price
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  // Initialize session ID
  useEffect(() => {
    const storedSessionId = localStorage.getItem("cartSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = nanoid();
      localStorage.setItem("cartSessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Fetch cart items whenever session ID changes
  useEffect(() => {
    if (!sessionId) return;

    const fetchCartItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/cart", {
          headers: {
            "X-Session-ID": sessionId,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [sessionId]);

  // Add item to cart
  const addItem = async (item: AddCartItem) => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/cart", item, {
        headers: {
          "X-Session-ID": sessionId,
        },
      });

      if (response.ok) {
        // Refresh cart
        const cartResponse = await fetch("/api/cart", {
          headers: {
            "X-Session-ID": sessionId,
          },
        });

        if (cartResponse.ok) {
          const data = await cartResponse.json();
          setItems(data.items || []);
        }
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = async (id: number, quantity: number) => {
    if (!sessionId || quantity < 1) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });

      if (response.ok) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (id: number) => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("DELETE", `/api/cart/${id}`);

      if (response.status === 204) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("DELETE", "/api/cart", null, {
        headers: {
          "X-Session-ID": sessionId,
        },
      });

      if (response.status === 204) {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
