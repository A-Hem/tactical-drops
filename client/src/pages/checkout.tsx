import { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import CheckoutForm from "@/components/checkout/checkout-form";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";

export default function Checkout() {
  const { items, totalItems } = useCart();
  const [, navigate] = useLocation();

  // Redirect to cart if checkout is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white">Checkout</h1>
        <div className="w-24 h-1 bg-accent mt-4 mb-8"></div>

        <div className="mb-8">
          <Link href="/cart">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
        </div>

        {items.length > 0 && (
          <>
            <CheckoutForm />

            <div className="mt-12 max-w-3xl mx-auto">
              <Separator />
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-accent mr-2" />
                  <h3 className="text-lg font-semibold text-white">Secure Checkout</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.
                </p>
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <div className="h-8 w-8 opacity-50">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-white h-full w-full">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
                    </svg>
                  </div>
                  <div className="h-8 w-8 opacity-50">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-white h-full w-full">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
