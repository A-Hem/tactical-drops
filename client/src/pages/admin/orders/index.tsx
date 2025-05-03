import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Search, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

// Order status badge component
const OrderStatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case 'processing':
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case 'shipped':
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case 'delivered':
        return "bg-green-700/10 text-green-700 hover:bg-green-700/20";
      case 'cancelled':
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case 'refunded':
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'processing':
        return <Package className="h-3 w-3 mr-1" />;
      case 'shipped':
        return <Truck className="h-3 w-3 mr-1" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3 mr-1" />;
      case 'refunded':
        return <RefreshCcw className="h-3 w-3 mr-1" />;
      default:
        return <ShoppingCart className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <Badge variant="outline" className={`flex items-center uppercase ${getStatusStyles()}`}>
      {getStatusIcon()} {status}
    </Badge>
  );
};

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const itemsPerPage = 10;

  // Fetch orders from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    }
  });

  // Filter and sort orders
  const filteredOrders = data?.orders
    ? data.orders
        .filter((order: any) => 
          (statusFilter === 'all' || order.status === statusFilter) &&
          (searchTerm === '' || 
           order.id.toString().includes(searchTerm) ||
           order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a: any, b: any) => {
          if (sortOrder === 'newest') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (sortOrder === 'oldest') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          } else if (sortOrder === 'highest') {
            return Number(b.totalAmount) - Number(a.totalAmount);
          } else {
            return Number(a.totalAmount) - Number(b.totalAmount);
          }
        })
    : [];

  // Calculate total pages
  const totalPages = Math.ceil((filteredOrders?.length || 0) / itemsPerPage);
  
  // Get current page items
  const currentItems = filteredOrders?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate status count
  const getStatusCount = (status: string) => {
    if (!data?.orders) return 0;
    return status === 'all' 
      ? data.orders.length 
      : data.orders.filter((order: any) => order.status === status).length;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle view order details
  const handleViewOrder = (orderId: number) => {
    setLocation(`/admin/orders/${orderId}`);
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        {/* Orders Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                All Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{getStatusCount('all')}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center text-yellow-500">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{getStatusCount('pending')}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center text-blue-500">
                <Package className="h-4 w-4 mr-2" />
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{getStatusCount('processing')}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center text-green-500">
                <Truck className="h-4 w-4 mr-2" />
                Shipped
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{getStatusCount('shipped')}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center text-red-500">
                <XCircle className="h-4 w-4 mr-2" />
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{getStatusCount('cancelled')}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by order ID, name or email..."
                className="pl-8 w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Value</SelectItem>
                <SelectItem value="lowest">Lowest Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="whitespace-nowrap"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setLocation('/admin/orders/process')}
              className="whitespace-nowrap"
            >
              <Package className="h-4 w-4 mr-2" /> Process Orders
            </Button>
          </div>
        </div>
        
        {/* Orders Table */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Failed to load orders</h3>
            <p className="text-muted-foreground">Please try again later</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? "Try changing your filters to see more results" 
                : "Start selling to get orders"}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        {order.fullName}
                        <div className="text-xs text-muted-foreground">{order.email}</div>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(order.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewOrder(order.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}