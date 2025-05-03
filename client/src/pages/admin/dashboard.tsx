import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, FileText, Tag, MessageSquare } from 'lucide-react';

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

  // Calculate counts
  const productCount = productsData?.products?.length || 0;
  const categoryCount = categoriesData?.categories?.length || 0;
  const blogPostCount = blogPostsData?.posts?.length || 0;
  const blogCategoryCount = blogCategoriesData?.categories?.length || 0;
  
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
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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