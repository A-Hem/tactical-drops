// Square Web Payments SDK integration helper
import { apiRequest } from "./queryClient";

declare global {
  interface Window {
    Square: any;
  }
}

type PaymentMethod = "CREDIT_CARD";

interface PaymentOptions {
  amount: number;
  currencyCode: string;
  orderId: number;
}

interface PaymentResult {
  success: boolean;
  error?: string;
  paymentId?: string;
}

export async function initializeSquarePayment(elementId: string): Promise<any> {
  if (!window.Square) {
    throw new Error("Square SDK not loaded");
  }

  try {
    const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID || process.env.SQUARE_APPLICATION_ID;
    
    if (!appId) {
      throw new Error("Square Application ID is not configured");
    }
    
    const payments = window.Square.payments(appId);
    
    const card = await payments.card();
    await card.attach(`#${elementId}`);
    
    return card;
  } catch (error) {
    console.error("Failed to initialize Square payments:", error);
    throw error;
  }
}

export async function processPayment(
  card: any,
  options: PaymentOptions
): Promise<PaymentResult> {
  try {
    const result = await card.tokenize();
    
    if (result.status === "OK") {
      // Send the token to the server to process the payment
      const paymentData = {
        paymentId: result.token,
        amount: options.amount,
        currencyCode: options.currencyCode
      };
      
      const response = await fetch(`/api/orders/${options.orderId}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          paymentId: data.order.paymentId
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || "Failed to process payment"
        };
      }
    } else {
      return {
        success: false,
        error: result.errors?.[0]?.message || "Failed to tokenize card"
      };
    }
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred"
    };
  }
}
