import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingBag, 
  FileText, 
  Tag, 
  MessageSquare, 
  ShoppingCart, 
  Package, 
  Truck, 
  BarChart 
} from 'lucide-react';

export default function AdminDashboard() {
  // Products count
  const { data: productsData } = useQuery<{products?: any[]}>({
    queryKey: ['/api/products'],
    enabled: true,
  });
  
  // Categories count
  const { data: categoriesData } = useQuery<{categories?: any[]}>({
    queryKey: ['/api/categories'],
    enabled: true,
  });

  // Blog posts count
  const { data: blogPostsData } = useQuery<{posts?: any[]}>({
    queryKey: ['/api/blog/posts'],
    enabled: true,
  });
  
  // Blog categories count
  const { data: blogCategoriesData } = useQuery<{categories?: any[]}>({
    queryKey: ['/api/blog/categories'],
    enabled: true,
  });
  
  // Orders count
  const { data: ordersData } = useQuery<{orders?: any[]}>({
    queryKey: ['/api/admin/orders'],
    enabled: true,
  });

  // Calculate counts
  const productCount = productsData?.products?.length || 0;
  const categoryCount = categoriesData?.categories?.length || 0;
  const blogPostCount = blogPostsData?.posts?.length || 0;
  const blogCategoryCount = blogCategoriesData?.categories?.length || 0;
  const orderCount = ordersData?.orders?.length || 0;
  
  // Calculate pending orders
  const pendingOrders = ordersData?.orders?.filter(order => order.status === 'pending').length || 0;
  const processingOrders = ordersData?.orders?.filter(order => order.status === 'processing').length || 0;
  const shippedOrders = ordersData?.orders?.filter(order => order.status === 'shipped').length || 0;
  
  const cardData = [
    {
      title: 'Total Products',
      value: productCount,
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'bg-blue-500',
      link: '/admin/products'
    },
    {
      title: 'Product Categories',
      value: categoryCount,
      icon: <Tag className="h-5 w-5" />,
      color: 'bg-green-500',
      link: '/admin/categories'
    },
    {
      title: 'Blog Posts',
      value: blogPostCount,
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-purple-500',
      link: '/admin/blog/posts'
    },
    {
      title: 'Blog Categories',
      value: blogCategoryCount,
      icon: <Tag className="h-5 w-5" />,
      color: 'bg-yellow-500',
      link: '/admin/blog/categories'
    }
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className={`flex flex-row items-center justify-between rounded-t-lg ${card.color} text-white p-4`}>
              <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <p className="text-3xl font-bold">{card.value}</p>
              <a 
                href={card.link} 
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                View details
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Order Management</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between rounded-t-lg bg-orange-500 text-white p-4">
              <CardTitle className="text-lg font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-5 w-5" />
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <p className="text-3xl font-bold">{orderCount}</p>
              <a 
                href="/admin/orders" 
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                Manage Orders
              </a>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between rounded-t-lg bg-yellow-500 text-white p-4">
              <CardTitle className="text-lg font-medium">Pending</CardTitle>
              <Package className="h-5 w-5" />
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <p className="text-3xl font-bold">{pendingOrders}</p>
              <a 
                href="/admin/orders?status=pending" 
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                View Pending
              </a>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between rounded-t-lg bg-blue-500 text-white p-4">
              <CardTitle className="text-lg font-medium">Processing</CardTitle>
              <Package className="h-5 w-5" />
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <p className="text-3xl font-bold">{processingOrders}</p>
              <a 
                href="/admin/orders?status=processing" 
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                View Processing
              </a>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between rounded-t-lg bg-green-500 text-white p-4">
              <CardTitle className="text-lg font-medium">Shipped</CardTitle>
              <Truck className="h-5 w-5" />
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <p className="text-3xl font-bold">{shippedOrders}</p>
              <a 
                href="/admin/orders?status=shipped" 
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                View Shipped
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <a 
                href="/admin/products/new" 
                className="flex items-center space-x-2 font-medium text-primary hover:underline"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Add New Product</span>
              </a>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <a 
                href="/admin/orders/process" 
                className="flex items-center space-x-2 font-medium text-primary hover:underline"
              >
                <Package className="h-5 w-5" />
                <span>Process Orders</span>
              </a>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <a 
                href="/admin/shipping/create-label" 
                className="flex items-center space-x-2 font-medium text-primary hover:underline"
              >
                <Truck className="h-5 w-5" />
                <span>Create USPS Label</span>
              </a>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <a 
                href="/admin/inventory" 
                className="flex items-center space-x-2 font-medium text-primary hover:underline"
              >
                <BarChart className="h-5 w-5" />
                <span>Manage Inventory</span>
              </a>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <a 
                href="/admin/blog/posts/new" 
                className="flex items-center space-x-2 font-medium text-primary hover:underline"
              >
                <FileText className="h-5 w-5" />
                <span>Create New Blog Post</span>
              </a>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <a 
                href="/admin/categories/new" 
                className="flex items-center space-x-2 font-medium text-primary hover:underline"
              >
                <Tag className="h-5 w-5" />
                <span>Add New Category</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}