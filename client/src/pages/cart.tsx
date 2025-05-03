import { useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/layout/layout";
import CartItem from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart, ChevronRight, ArrowLeft } from "lucide-react";

export default function Cart() {
  const { items, totalItems, totalPrice, updateItemQuantity, removeItem, isLoading } = useCart();
  const [processingItems, setProcessingItems] = useState<number[]>([]);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setProcessingItems((prev) => [...prev, id]);
    updateItemQuantity(id, quantity).finally(() => {
      setProcessingItems((prev) => prev.filter((itemId) => itemId !== id));
    });
  };

  const handleRemoveItem = (id: number) => {
    setProcessingItems((prev) => [...prev, id]);
    removeItem(id).finally(() => {
      setProcessingItems((prev) => prev.filter((itemId) => itemId !== id));
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
        <div className="w-24 h-1 bg-accent mt-4 mb-8"></div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="mx-auto bg-card/50 rounded-full p-6 w-24 h-24 flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Your cart is empty</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products">
              <Button className="mt-4 btn-primary">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg p-6">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              <div className="mt-8">
                <Link href="/products">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <div className="bg-card rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                    <span className="text-white">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-white">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-white">Calculated at checkout</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Estimated Total</span>
                    <span className="text-accent">${totalPrice.toFixed(2)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full btn-primary mt-4 flex items-center justify-between">
                      <span>Proceed to Checkout</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-4 mb-2">
                    <div className="h-7 w-8 opacity-50">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="text-white h-full w-full">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
                      </svg>
                    </div>
                    <div className="h-7 w-8 opacity-50">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="text-white h-full w-full">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Secure checkout powered by Square
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
