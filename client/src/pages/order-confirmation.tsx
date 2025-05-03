import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { CheckCircle, Clock, Package, Truck, ChevronRight } from "lucide-react";

interface OrderParams {
  orderId?: string;
  success?: string;
}

export default function OrderConfirmation() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<OrderParams>({});
  const { clearCart } = useCart();
  
  // Parse URL search params for order ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams({
      orderId: params.get("orderId") || undefined,
      success: params.get("success") || undefined
    });
    
    // Clear the cart only if payment was successful
    if (params.get("success") === "true") {
      clearCart();
    }
  }, [clearCart]);

  // Fetch order details if we have an order ID
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/orders/${searchParams.orderId}`],
    queryFn: async () => {
      if (!searchParams.orderId) return null;
      
      const response = await fetch(`/api/orders/${searchParams.orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      return response.json();
    },
    enabled: !!searchParams.orderId,
  });

  // Show loader while fetching order
  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="flex justify-center mb-8">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4 mx-auto mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-8">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show error if order fetch failed
  if (error || (searchParams.orderId && !data)) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-red-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500 w-10 h-10"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find the order you're looking for. Please check your order ID or contact customer support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setLocation("/products")}>
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => setLocation("/contact")}>
              Contact Support
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show success page even without order details if success is true
  if (searchParams.success === "true" && !searchParams.orderId) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-green-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. You will receive an email confirmation shortly.
          </p>
          <Button onClick={() => setLocation("/products")}>Continue Shopping</Button>
        </div>
      </Layout>
    );
  }

  // Default screen when no params are available (direct visit to confirmation page)
  if (!searchParams.orderId && !searchParams.success) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">No Order Information</h1>
          <p className="text-muted-foreground mb-8">
            Please complete a purchase to see order confirmation details.
          </p>
          <Button onClick={() => setLocation("/products")}>Shop Now</Button>
        </div>
      </Layout>
    );
  }

  // Show full order details if we have them
  const { order, items } = data || {};

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-foreground">Order Confirmation</span>
        </div>

        <div className="bg-green-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="text-green-500 w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-4">Thank You for Your Order!</h1>
        <p className="text-muted-foreground text-center mb-12">
          Your order has been placed and is being processed. You will receive an email confirmation shortly.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Order #{order?.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-card rounded-md overflow-hidden w-16 h-16 flex items-center justify-center">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-contain p-1" 
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</p>
              </div>
            ))}

            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p>${order?.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Shipping</p>
                <p>Free</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Tax</p>
                <p>${order?.tax.toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold pt-4 border-t border-border">
                <p>Total</p>
                <p>${order?.total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {order?.shippingName}
              </p>
              <p>
                <span className="font-medium">Address:</span> {order?.shippingAddress1}{order?.shippingAddress2 ? `, ${order.shippingAddress2}` : ''}
              </p>
              <p>
                <span className="font-medium">City:</span> {order?.shippingCity}, {order?.shippingState} {order?.shippingZip}
              </p>
              <p>
                <span className="font-medium">Country:</span> {order?.shippingCountry}
              </p>
              <p>
                <span className="font-medium">Email:</span> {order?.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {order?.phone || 'Not provided'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 rounded-full p-2">
                  <Clock className="text-accent h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Order Received</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order?.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 rounded-full p-2">
                  <Package className="text-accent h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-muted-foreground">In progress</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Truck className="text-muted-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Shipped</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => setLocation("/products")}>
            Continue Shopping
          </Button>
          <Button variant="outline" onClick={() => setLocation("/contact")}>
            Need Help?
          </Button>
        </div>
      </div>
    </Layout>
  );
}