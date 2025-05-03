import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  Printer, 
  XCircle, 
  CheckCircle, 
  AlertTriangle,
  RefreshCcw,
  ShoppingBag,
  ArrowUpDown,
  Check
} from 'lucide-react';

export default function AdminProcessOrders() {
  const [, setLocation] = useLocation();
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    }
  });

  // Batch update order status
  const batchUpdateStatus = async (status: string) => {
    if (selectedOrders.length === 0) {
      toast({
        title: 'No Orders Selected',
        description: 'Please select at least one order to process',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const orderId of selectedOrders) {
        await updateOrderStatusMutation.mutateAsync({ orderId, status });
      }
      
      toast({
        title: 'Orders Updated',
        description: `${selectedOrders.length} orders have been updated to ${status}`,
      });
      
      setSelectedOrders([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update some orders',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk create shipping labels
  const bulkCreateLabels = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: 'No Orders Selected',
        description: 'Please select at least one order to create labels',
        variant: 'destructive',
      });
      return;
    }
    
    // Navigate to the create label page with query string of order IDs
    setLocation(`/admin/shipping/create-label?orderIds=${selectedOrders.join(',')}`);
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

  // Toggle all checkboxes
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all orders from the current tab
      const ordersInTab = data?.orders
        .filter((order: any) => order.status === selectedTab)
        .map((order: any) => order.id) || [];
      setSelectedOrders(ordersInTab);
    } else {
      setSelectedOrders([]);
    }
  };

  // Toggle individual checkbox
  const toggleOrderSelection = (orderId: number) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Get filtered orders based on tab
  const getFilteredOrders = () => {
    if (!data?.orders) return [];
    return data.orders.filter((order: any) => order.status === selectedTab);
  };

  // Get counts for each status
  const getStatusCount = (status: string) => {
    if (!data?.orders) return 0;
    return data.orders.filter((order: any) => order.status === status).length;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Process Orders">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setLocation('/admin/orders')}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </div>
          
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Process Orders">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Failed to Load Orders</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't load the orders. Please try again later.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <AdminLayout title="Process Orders">
      <div className="space-y-6">
        {/* Back button and actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            onClick={() => setLocation('/admin/orders')}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => batchUpdateStatus('processing')}
              disabled={selectedOrders.length === 0 || isProcessing}
            >
              <Package className="h-4 w-4 mr-2" />
              Mark as Processing
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => batchUpdateStatus('shipped')}
              disabled={selectedOrders.length === 0 || isProcessing}
            >
              <Truck className="h-4 w-4 mr-2" />
              Mark as Shipped
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={bulkCreateLabels}
              disabled={selectedOrders.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Create Shipping Labels
            </Button>
          </div>
        </div>
        
        {/* Order Status Tabs */}
        <Tabs defaultValue="pending" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending
              <Badge variant="secondary" className="ml-1">{getStatusCount('pending')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex gap-2">
              <Package className="h-4 w-4" />
              Processing
              <Badge variant="secondary" className="ml-1">{getStatusCount('processing')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="shipped" className="flex gap-2">
              <Truck className="h-4 w-4" />
              Shipped
              <Badge variant="secondary" className="ml-1">{getStatusCount('shipped')}</Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab content panel */}
          <div className="mt-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-md">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No {selectedTab} orders</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedTab === 'pending'
                    ? "There are no pending orders requiring processing at this time."
                    : selectedTab === 'processing'
                    ? "There are no orders currently being processed."
                    : "There are no shipped orders to display."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={filteredOrders.length > 0 && filteredOrders.every((order: any) => 
                            selectedOrders.includes(order.id)
                          )}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Order Info</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order: any) => (
                      <TableRow key={order.id} className={selectedOrders.includes(order.id) ? 'bg-accent/5' : ''}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => toggleOrderSelection(order.id)}
                            aria-label={`Select order ${order.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">#{order.id}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {order.paymentId ? 
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">
                                <Check className="h-2.5 w-2.5 mr-1" /> Paid
                              </Badge> :
                              <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500">
                                <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Payment Pending
                              </Badge>
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{order.fullName}</div>
                          <div className="text-xs text-muted-foreground mt-1">{order.email}</div>
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{order.itemCount || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(order.totalAmount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/admin/orders/${order.id}`)}
                          >
                            View
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
        
        {/* Selected Orders Summary */}
        {selectedOrders.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Selected Orders: {selectedOrders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedOrders.map(orderId => (
                  <Badge key={orderId} variant="outline" className="px-3 py-1">
                    #{orderId}
                    <button 
                      className="ml-2 text-muted-foreground hover:text-foreground" 
                      onClick={() => toggleOrderSelection(orderId)}
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrders([])}>
                Clear Selection
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => batchUpdateStatus('processing')}
                  disabled={isProcessing}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Processing
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={bulkCreateLabels}
                  disabled={isProcessing}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Create Labels
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}