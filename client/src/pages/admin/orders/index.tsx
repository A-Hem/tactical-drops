import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingBag, 
  Search, 
  ArrowUpDown, 
  RefreshCcw, 
  AlertTriangle, 
  Plus, 
  Package,
  Truck,
  Clipboard,
  ArrowRight,
  Check,
  XCircle,
  CheckCircle,
  ArrowDown,
  ArrowUp
} from 'lucide-react';

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('all');

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

  // Toggle sort direction or set new sort field
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending order when changing fields
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status Badge Component
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
          return <AlertTriangle className="h-4 w-4 mr-2" />;
        case 'processing':
          return <Package className="h-4 w-4 mr-2" />;
        case 'shipped':
          return <Truck className="h-4 w-4 mr-2" />;
        case 'delivered':
          return <CheckCircle className="h-4 w-4 mr-2" />;
        case 'cancelled':
          return <XCircle className="h-4 w-4 mr-2" />;
        case 'refunded':
          return <RefreshCcw className="h-4 w-4 mr-2" />;
        default:
          return <ShoppingBag className="h-4 w-4 mr-2" />;
      }
    };

    return (
      <Badge variant="outline" className={`flex items-center uppercase text-xs ${getStatusStyles()}`}>
        {getStatusIcon()} {status}
      </Badge>
    );
  };

  // Filter orders based on search term & tab
  const filteredOrders = data?.orders
    ? data.orders
        .filter((order: any) => 
          (order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.id.toString().includes(searchTerm)) &&
          (activeTab === 'all' || order.status === activeTab)
        )
        .sort((a: any, b: any) => {
          const direction = sortDirection === 'asc' ? 1 : -1;
          
          if (sortField === 'createdAt') {
            return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          } else if (sortField === 'totalAmount') {
            return direction * (Number(a.totalAmount) - Number(b.totalAmount));
          } else if (sortField === 'id') {
            return direction * (a.id - b.id);
          }
          
          return 0;
        })
    : [];
    
  // Get counts for tabs
  const getOrderCounts = () => {
    if (!data?.orders) return { 
      all: 0, 
      pending: 0, 
      processing: 0, 
      shipped: 0, 
      delivered: 0, 
      cancelled: 0 
    };
    
    const counts = {
      all: data.orders.length,
      pending: data.orders.filter((order: any) => order.status === 'pending').length,
      processing: data.orders.filter((order: any) => order.status === 'processing').length,
      shipped: data.orders.filter((order: any) => order.status === 'shipped').length,
      delivered: data.orders.filter((order: any) => order.status === 'delivered').length,
      cancelled: data.orders.filter((order: any) => order.status === 'cancelled').length
    };
    
    return counts;
  };
  
  const orderCounts = getOrderCounts();

  return (
    <AdminLayout title="Order Management">
      <div className="space-y-6">
        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="col-span-2 bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{orderCounts.all}</p>
                <p className="text-sm text-muted-foreground">orders</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{orderCounts.pending}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-2 text-blue-500" />
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{orderCounts.processing}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <Truck className="h-4 w-4 mr-2 text-green-500" />
                Shipped
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{orderCounts.shipped}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-700" />
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{orderCounts.delivered}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setLocation('/admin/orders/process')}
            >
              <Clipboard className="h-4 w-4 mr-2" />
              Batch Process
            </Button>
          </div>
        </div>
        
        {/* Order Status Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              All ({orderCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs md:text-sm">
              <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 md:mr-2 hidden md:inline" />
              Pending ({orderCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="processing" className="text-xs md:text-sm">
              <Package className="h-3 w-3 md:h-4 md:w-4 md:mr-2 hidden md:inline" />
              Processing ({orderCounts.processing})
            </TabsTrigger>
            <TabsTrigger value="shipped" className="text-xs md:text-sm">
              <Truck className="h-3 w-3 md:h-4 md:w-4 md:mr-2 hidden md:inline" />
              Shipped ({orderCounts.shipped})
            </TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs md:text-sm">
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 md:mr-2 hidden md:inline" />
              Delivered ({orderCounts.delivered})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs md:text-sm">
              <XCircle className="h-3 w-3 md:h-4 md:w-4 md:mr-2 hidden md:inline" />
              Cancelled ({orderCounts.cancelled})
            </TabsTrigger>
          </TabsList>
          
          {/* Orders Table */}
          <div className="mt-6">
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
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No orders found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "Try changing your search term or filter" 
                    : activeTab !== 'all' 
                    ? `No orders with status "${activeTab}"` 
                    : "No orders have been placed yet"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                        <div className="flex items-center">
                          Order ID
                          {sortField === 'id' && (
                            sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center">
                          Date
                          {sortField === 'createdAt' && (
                            sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('totalAmount')}>
                        <div className="flex items-center">
                          Total
                          {sortField === 'totalAmount' && (
                            sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div>{order.fullName}</div>
                          <div className="text-xs text-muted-foreground">{order.email}</div>
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{order.itemCount || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(order.totalAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {order.paymentId ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500">
                              <Check className="h-3 w-3 mr-1" /> Paid
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/admin/orders/${order.id}`)}
                          >
                            View <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
}