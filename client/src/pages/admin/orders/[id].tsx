import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  ChevronLeft, 
  Package, 
  Truck, 
  Printer, 
  XCircle, 
  CheckCircle, 
  AlertTriangle,
  RefreshCcw,
  Download,
  User,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

export default function AdminOrderDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [currentStatus, setCurrentStatus] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const orderId = params.id;

  // Fetch order details
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/admin/orders/${orderId}`],
    queryFn: async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      
      // Set initial status
      if (data.order && data.order.status) {
        setCurrentStatus(data.order.status);
      }
      
      return data;
    }
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async (status: string) => {
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
      toast({
        title: 'Status Updated',
        description: `Order status has been updated to ${currentStatus}`,
      });
      
      // Invalidate order queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/admin/orders/${orderId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      
      setIsStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update status: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Generate shipping label function
  const generateShippingLabel = async () => {
    try {
      toast({
        title: 'Generating Label',
        description: 'Redirecting to shipping label generator...',
      });
      
      // Navigate to shipping label page with order id
      setLocation(`/admin/shipping/create-label?orderId=${orderId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate shipping label',
        variant: 'destructive',
      });
    }
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

  // Status badge component
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
          return <ShoppingCart className="h-4 w-4 mr-2" />;
      }
    };

    return (
      <Badge variant="outline" className={`flex items-center uppercase text-sm ${getStatusStyles()}`}>
        {getStatusIcon()} {status}
      </Badge>
    );
  };

  // Handle status update
  const handleStatusUpdate = () => {
    updateOrderStatus.mutate(currentStatus);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading Order...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-52 w-full" />
            <Skeleton className="h-52 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data?.order) {
    return (
      <AdminLayout title="Order Not Found">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Button
            onClick={() => setLocation('/admin/orders')}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { order, items } = data;

  return (
    <AdminLayout title={`Order #${order.id}`}>
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
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Order Status</DialogTitle>
                  <DialogDescription>
                    Change the status of order #{order.id}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select value={currentStatus} onValueChange={setCurrentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={updateOrderStatus.isPending}>
                    {updateOrderStatus.isPending ? 'Updating...' : 'Update Status'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button onClick={generateShippingLabel} size="sm">
              <Truck className="h-4 w-4 mr-2" />
              Create Shipping Label
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
        
        {/* Order summary and status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                  <CardDescription>Placed on {formatDate(order.createdAt)}</CardDescription>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-border pb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-card rounded-md overflow-hidden w-16 h-16 flex items-center justify-center">
                        <img 
                          src={item.product?.imageUrl} 
                          alt={item.productName} 
                          className="w-full h-full object-contain p-1" 
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <div className="flex text-sm text-muted-foreground">
                          <span className="mr-2">Qty: {item.quantity}</span>
                          <span>${Number(item.price).toFixed(2)} each</span>
                        </div>
                      </div>
                    </div>
                    <p className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>${Number(order.totalAmount).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Shipping</p>
                    <p>Free</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Tax</p>
                    <p>${(Number(order.totalAmount) * 0.08).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between font-bold pt-4 border-t border-border">
                    <p>Total</p>
                    <p>${(Number(order.totalAmount) * 1.08).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <User className="h-4 w-4 mr-2" /> Customer
                </div>
                <p className="font-medium">{order.fullName}</p>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 mr-2" /> {order.email}
                </div>
                {order.phone && (
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 mr-2" /> {order.phone}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <MapPin className="h-4 w-4 mr-2" /> Shipping Address
                </div>
                <p className="font-medium">{order.fullName}</p>
                <p>{order.address}</p>
                <p>{order.city}, {order.state} {order.zipCode}</p>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center text-muted-foreground mb-1 text-sm">
                  <ShoppingCart className="h-4 w-4 mr-2" /> Order Details
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div className="text-muted-foreground">Payment ID</div>
                  <div className="font-mono">{order.paymentId || 'Not available'}</div>
                  
                  <div className="text-muted-foreground">Date</div>
                  <div>{formatDate(order.createdAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0"></div>
              
              <div className={`relative z-10 flex flex-col items-center ${order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'text-accent' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Order Placed</span>
                <span className="text-xs">{formatDate(order.createdAt)}</span>
              </div>
              
              <div className={`relative z-10 flex flex-col items-center ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'text-accent' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Processing</span>
                <span className="text-xs">{order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'In progress' : '-'}</span>
              </div>
              
              <div className={`relative z-10 flex flex-col items-center ${order.status === 'shipped' || order.status === 'delivered' ? 'text-accent' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Shipped</span>
                <span className="text-xs">{order.status === 'shipped' || order.status === 'delivered' ? 'On the way' : '-'}</span>
              </div>
              
              <div className={`relative z-10 flex flex-col items-center ${order.status === 'delivered' ? 'text-accent' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${order.status === 'delivered' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Delivered</span>
                <span className="text-xs">{order.status === 'delivered' ? 'Completed' : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}