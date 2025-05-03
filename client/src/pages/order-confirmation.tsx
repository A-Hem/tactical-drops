import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";

export default function OrderConfirmation() {
  const [location] = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract orderId from URL search params
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId");
    setOrderId(id);

    // If we have an orderId, fetch the order details
    if (id) {
      const fetchOrder = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/orders/${id}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch order details");
          }
          
          const data = await response.json();
          setOrderData(data);
        } catch (err: any) {
          setError(err.message || "An error occurred while fetching order details");
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrder();
    } else {
      setIsLoading(false);
      setError("No order ID provided");
    }
  }, [location]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center max-w-3xl mx-auto">
            <div className="bg-secondary p-8 rounded-lg">
              <svg className="h-16 w-16 text-destructive mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/">
                  <Button className="btn-primary">
                    Return to Home
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="btn-secondary">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-3xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-xl">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. Your order has been received and is being processed.
              </p>

              {orderData && (
                <div className="text-left mb-8">
                  <div className="border border-border rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Order Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Order Number</p>
                        <p className="text-white">{orderData.order.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Order Date</p>
                        <p className="text-white">
                          {new Date(orderData.order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Payment Status</p>
                        <p className="text-white capitalize">{orderData.order.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Total Amount</p>
                        <p className="text-white">${Number(orderData.order.totalAmount).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {orderData.items && orderData.items.length > 0 && (
                    <div className="border border-border rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
                      <div className="space-y-4">
                        {orderData.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between">
                            <div>
                              <p className="text-white">
                                {item.productName} <span className="text-muted-foreground">× {item.quantity}</span>
                              </p>
                            </div>
                            <p className="text-white">${Number(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center gap-4">
                <Link href="/">
                  <Button variant="default" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Return Home
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
