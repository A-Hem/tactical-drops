import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Package, 
  Truck, 
  AlertTriangle, 
  RefreshCcw, 
  CheckCircle,
  Layers,
  BarChart3,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  
  // Get orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    }
  });
  
  // Get products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Calculate order statistics
  const getOrderStats = () => {
    if (!ordersData?.orders) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        totalSales: 0
      };
    }
    
    const totalOrders = ordersData.orders.length;
    const pendingOrders = ordersData.orders.filter((order: any) => order.status === 'pending').length;
    const processingOrders = ordersData.orders.filter((order: any) => order.status === 'processing').length;
    const shippedOrders = ordersData.orders.filter((order: any) => order.status === 'shipped').length;
    const totalSales = ordersData.orders.reduce((total: number, order: any) => total + Number(order.totalAmount), 0);
    
    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      totalSales
    };
  };
  
  // Calculate inventory statistics
  const getInventoryStats = () => {
    if (!productsData?.products) {
      return {
        totalProducts: 0,
        totalInventory: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      };
    }
    
    const totalProducts = productsData.products.length;
    const totalInventory = productsData.products.reduce((total: number, product: any) => total + product.inventory, 0);
    const lowStockCount = productsData.products.filter((product: any) => product.inventory > 0 && product.inventory <= 5).length;
    const outOfStockCount = productsData.products.filter((product: any) => product.inventory <= 0).length;
    
    return {
      totalProducts,
      totalInventory,
      lowStockCount,
      outOfStockCount
    };
  };
  
  const orderStats = getOrderStats();
  const inventoryStats = getInventoryStats();
  
  // Recent orders (limited to 5)
  const recentOrders = ordersData?.orders?.slice(0, 5) || [];
  
  // Low stock products
  const lowStockProducts = productsData?.products
    ?.filter((product: any) => product.inventory <= 5)
    .sort((a: any, b: any) => a.inventory - b.inventory)
    .slice(0, 5) || [];
  
  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(orderStats.totalSales)}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-2 text-indigo-500" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{inventoryStats.totalProducts}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Layers className="h-4 w-4 mr-2 text-orange-500" />
                Total Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{inventoryStats.totalInventory}</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Order Status & Inventory Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Order Status
              </CardTitle>
              <CardDescription>
                Overview of order fulfillment statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-3 text-yellow-500" />
                      <div>
                        <div className="font-medium">Pending Orders</div>
                        <div className="text-sm text-muted-foreground">Awaiting processing</div>
                      </div>
                    </div>
                    <div className="font-bold text-lg">{orderStats.pendingOrders}</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-md">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">Processing Orders</div>
                        <div className="text-sm text-muted-foreground">Currently processing</div>
                      </div>
                    </div>
                    <div className="font-bold text-lg">{orderStats.processingOrders}</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-md">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 mr-3 text-green-500" />
                      <div>
                        <div className="font-medium">Shipped Orders</div>
                        <div className="text-sm text-muted-foreground">En route to customers</div>
                      </div>
                    </div>
                    <div className="font-bold text-lg">{orderStats.shippedOrders}</div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/admin/orders")}>
                View All Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Inventory Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Inventory Status
              </CardTitle>
              <CardDescription>
                Overview of stock levels and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-3 text-yellow-500" />
                      <div>
                        <div className="font-medium">Low Stock Products</div>
                        <div className="text-sm text-muted-foreground">Less than 5 items remaining</div>
                      </div>
                    </div>
                    <div className="font-bold text-lg">{inventoryStats.lowStockCount}</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-3 text-red-500" />
                      <div>
                        <div className="font-medium">Out of Stock Products</div>
                        <div className="text-sm text-muted-foreground">Requires restock</div>
                      </div>
                    </div>
                    <div className="font-bold text-lg">{inventoryStats.outOfStockCount}</div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/admin/inventory")}>
                Manage Inventory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Recent Orders & Low Stock Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest orders received by the store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No orders found
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <div className="font-medium">Order #{order.id}</div>
                        <div className="text-sm text-muted-foreground">{order.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-medium">{formatCurrency(Number(order.totalAmount))}</div>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                            ${order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' : ''}
                            ${order.status === 'shipped' ? 'bg-green-500/10 text-green-500' : ''}
                            ${order.status === 'delivered' ? 'bg-green-700/10 text-green-700' : ''}
                            ${order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : ''}
                          `}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/admin/orders")}>
                View All Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
              <CardDescription>
                Products with low inventory levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : lowStockProducts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No low stock products found
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product: any) => (
                    <div key={product.id} className="flex justify-between items-center border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/333/white?text=No+Image';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-medium">{formatCurrency(Number(product.price))}</div>
                        <Badge 
                          variant="outline" 
                          className={`${product.inventory <= 0 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}
                        >
                          {product.inventory <= 0 ? 'Out of Stock' : `${product.inventory} left`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/admin/inventory")}>
                Manage Inventory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="h-auto py-4 flex flex-col gap-2 items-center justify-center"
            onClick={() => setLocation("/admin/orders/process")}
          >
            <Package className="h-6 w-6 mb-1" />
            <div className="font-medium">Process Orders</div>
            <div className="text-xs text-muted-foreground">Update order statuses</div>
          </Button>
          
          <Button 
            className="h-auto py-4 flex flex-col gap-2 items-center justify-center"
            onClick={() => setLocation("/admin/shipping/create-label")}
          >
            <Truck className="h-6 w-6 mb-1" />
            <div className="font-medium">Create Shipping Label</div>
            <div className="text-xs text-muted-foreground">Generate USPS shipping labels</div>
          </Button>
          
          <Button 
            className="h-auto py-4 flex flex-col gap-2 items-center justify-center"
            onClick={() => setLocation("/admin/products/new")}
          >
            <ShoppingBag className="h-6 w-6 mb-1" />
            <div className="font-medium">Add New Product</div>
            <div className="text-xs text-muted-foreground">Create listing for new product</div>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}