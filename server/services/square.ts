import { randomUUID } from "crypto";
import { SquareClient } from 'square';

// Initialize Square client
const squareClient = new SquareClient({ 
  token: process.env.SQUARE_ACCESS_TOKEN ?? ''
});

// Payment processing service
export const squareService = {
  /**
   * Process a payment with Square using a payment token
   * @param sourceId The payment token from Square Web Payments SDK
   * @param amount The amount to charge in dollars
   * @param orderId The order ID for reference
   * @param customerEmail The customer's email for receipts
   * @returns The payment result with ID if successful
   */
  async processPayment(
    sourceId: string,
    amount: number,
    orderId: number,
    customerEmail: string
  ) {
    try {
      // Convert dollar amount to cents (Square uses cents)
      const amountCents = Math.round(amount * 100);

      // Create a unique idempotency key for this payment
      const idempotencyKey = randomUUID();

      // Create the payment request
      const payment = await squareClient.payments.create({
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(amountCents), // Square expects BigInt for the amount
          currency: "USD"
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
        referenceId: orderId.toString(),
        // Include customer email for receipts if provided
        buyerEmailAddress: customerEmail,
        // Add a note for internal reference
        note: `Payment for order #${orderId} on JustDrops.xyz`
      });

      return {
        success: true,
        paymentId: payment.payment?.id
      };
    } catch (error) {
      console.error("Square payment processing error:", error);
      
      // Handle errors with a more generic approach
      const squareError = error as any;
      
      // Check for Square API errors
      if (squareError && typeof squareError === 'object') {
        // New Square SDK error format
        if (squareError.errors && Array.isArray(squareError.errors)) {
          return {
            success: false,
            error: squareError.errors[0]?.detail || "Payment processing failed"
          };
        }
        
        // Legacy format or other structured error
        if (squareError.result && squareError.result.errors && Array.isArray(squareError.result.errors)) {
          return {
            success: false,
            error: squareError.result.errors[0]?.detail || "Payment processing failed"
          };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown payment processing error"
      };
    }
  }
};