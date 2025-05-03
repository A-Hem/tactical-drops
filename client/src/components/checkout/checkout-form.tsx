import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { initializeSquarePayment, processPayment } from "@/lib/square";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const formSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutForm = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [squarePayment, setSquarePayment] = useState<any>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    },
  });

  useEffect(() => {
    const loadSquare = async () => {
      try {
        if (cardContainerRef.current) {
          const card = await initializeSquarePayment("card-container");
          setSquarePayment(card);
        }
      } catch (error) {
        console.error("Failed to load Square payment:", error);
        toast({
          title: "Payment Error",
          description: "Could not initialize payment system. Please try again later.",
          variant: "destructive",
        });
      }
    };

    loadSquare();
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive",
      });
      return;
    }

    if (!squarePayment) {
      toast({
        title: "Payment Error",
        description: "Payment system not initialized. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessingPayment(true);

      // 1. Create order in our system
      const orderResponse = await apiRequest("POST", "/api/orders", {
        ...values,
        totalAmount: totalPrice,
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.order.id;

      // 2. Process payment with Square
      const paymentResult = await processPayment(squarePayment, {
        amount: totalPrice,
        currencyCode: "USD",
        orderId,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment processing failed");
      }

      // 3. Success - clear cart and navigate to success page
      clearCart();
      
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
      });

      // Navigate to a success page
      navigate(`/order-confirmation?orderId=${orderId}`);
    } catch (error: any) {
      toast({
        title: "Checkout Error",
        description: error.message || "An error occurred during checkout",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Phoenix" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="AZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="85001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h2 className="text-2xl font-bold mt-8 mb-6">Payment Information</h2>
            <div className="border border-border rounded-md p-4 bg-card/50">
              <div id="card-container" ref={cardContainerRef} className="min-h-[100px]"></div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isProcessingPayment || items.length === 0}
            >
              {isProcessingPayment
                ? "Processing..."
                : `Complete Order • $${totalPrice.toFixed(2)}`}
            </Button>
          </form>
        </Form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
        <div className="bg-card rounded-lg p-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">
                    {item.product.name} <span className="text-muted-foreground">× {item.quantity}</span>
                  </p>
                </div>
                <p className="font-medium">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Subtotal</p>
              <p>${totalPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Shipping</p>
              <p>Free</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Tax</p>
              <p>Calculated at checkout</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between">
            <p className="font-semibold">Total</p>
            <p className="font-semibold">${totalPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-8 bg-card/50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Secure Checkout</h3>
          <p className="text-sm text-muted-foreground">
            Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.
          </p>
          <div className="flex items-center mt-4 space-x-4">
            <div className="h-8 w-8">
              <svg viewBox="0 0 24 24" fill="currentColor" className="text-white h-full w-full">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
              </svg>
            </div>
            <p className="text-sm">128-bit SSL Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
