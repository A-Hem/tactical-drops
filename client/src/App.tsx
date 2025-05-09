import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CartProvider } from "@/hooks/use-cart";

// Store pages
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

// Admin pages
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminNewProduct from "@/pages/admin/products/new";
import AdminEditProduct from "@/pages/admin/products/edit/[id]";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/orders/[id]";
import AdminProcessOrders from "@/pages/admin/orders/process";
import AdminInventory from "@/pages/admin/inventory";
import AdminCreateShippingLabel from "@/pages/admin/shipping/create-label";

function Router() {
  return (
    <Switch>
      {/* Store routes */}
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/category/:slug" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      {/* Admin Product routes */}
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/new" component={AdminNewProduct} />
      <Route path="/admin/products/edit/:id" component={AdminEditProduct} />
      
      {/* Admin Order routes */}
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/orders/process" component={AdminProcessOrders} />
      <Route path="/admin/orders/:id" component={AdminOrderDetail} />
      
      {/* Admin Inventory & Shipping routes */}
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/admin/shipping/create-label" component={AdminCreateShippingLabel} />
      
      {/* 404 route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" forcedTheme="dark">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
