import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  Printer,
  Package,
  Download,
  ArrowRight,
  Truck,
  Mail,
  FileText,
  CheckCircle
} from 'lucide-react';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Shipping service options
const shippingServices = [
  { id: 'usps_priority', name: 'USPS Priority Mail', price: 7.95, daysToDeliver: '1-3' },
  { id: 'usps_priority_express', name: 'USPS Priority Mail Express', price: 26.95, daysToDeliver: '1-2' },
  { id: 'usps_first_class', name: 'USPS First Class Package', price: 4.95, daysToDeliver: '2-5' },
  { id: 'usps_ground_advantage', name: 'USPS Ground Advantage', price: 5.95, daysToDeliver: '2-5' },
];

// Package size options
const packageSizes = [
  { id: 'small', name: 'Small', dimensions: '8" x 5" x 2"', weight: 'Up to 1 lb' },
  { id: 'medium', name: 'Medium', dimensions: '11" x 8.5" x 5.5"', weight: 'Up to 5 lbs' },
  { id: 'large', name: 'Large', dimensions: '12" x 12" x 8"', weight: 'Up to 10 lbs' },
  { id: 'custom', name: 'Custom Size', dimensions: 'Custom', weight: 'Custom' },
];

// Form schema
const shippingFormSchema = z.object({
  orderId: z.union([z.string(), z.number()]).optional(),
  
  // From address
  fromName: z.string().min(2, { message: "Name is required" }),
  fromCompany: z.string().optional(),
  fromAddress1: z.string().min(5, { message: "Address is required" }),
  fromAddress2: z.string().optional(),
  fromCity: z.string().min(2, { message: "City is required" }),
  fromState: z.string().min(2, { message: "State is required" }),
  fromZip: z.string().min(5, { message: "ZIP code is required" }),
  fromPhone: z.string().optional(),
  
  // To address
  toName: z.string().min(2, { message: "Name is required" }),
  toCompany: z.string().optional(),
  toAddress1: z.string().min(5, { message: "Address is required" }),
  toAddress2: z.string().optional(),
  toCity: z.string().min(2, { message: "City is required" }),
  toState: z.string().min(2, { message: "State is required" }),
  toZip: z.string().min(5, { message: "ZIP code is required" }),
  toPhone: z.string().optional(),
  
  // Package details
  packageSize: z.string().min(1, { message: "Package size is required" }),
  weight: z.string().min(1, { message: "Weight is required" }),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  shippingService: z.string().min(1, { message: "Shipping service is required" }),
  
  // Options
  signature: z.boolean().default(false),
  insurance: z.boolean().default(false),
  insuranceValue: z.string().optional(),
  contents: z.string().optional(),
  returnLabel: z.boolean().default(false),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

export default function AdminCreateShippingLabel() {
  const [, setLocation] = useLocation();
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [completedLabels, setCompletedLabels] = useState<string[]>([]);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  
  // Create form with default values
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fromName: 'JustDrops Store',
      fromCompany: 'JustDrops.xyz',
      fromAddress1: '123 Main St',
      fromCity: 'Phoenix',
      fromState: 'AZ',
      fromZip: '85001',
      packageSize: 'medium',
      weight: '2',
      shippingService: 'usps_priority',
      signature: false,
      insurance: false,
      returnLabel: false,
    }
  });
  
  // Parse URL for order IDs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('orderId');
    const orderIdsParam = params.get('orderIds');
    
    if (orderIdParam) {
      setOrderIds([orderIdParam]);
    } else if (orderIdsParam) {
      setOrderIds(orderIdsParam.split(','));
    }
  }, []);
  
  // Get the current order to process
  const currentOrderId = orderIds[currentOrderIndex];
  
  // Fetch order details if there's an order ID
  const { data: orderData, isLoading } = useQuery({
    queryKey: [`/api/admin/orders/${currentOrderId}`],
    queryFn: async () => {
      if (!currentOrderId) return null;
      
      const response = await fetch(`/api/admin/orders/${currentOrderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      return response.json();
    },
    enabled: !!currentOrderId
  });
  
  // Fill form with order data when loaded
  useEffect(() => {
    if (orderData?.order) {
      const order = orderData.order;
      
      form.setValue('orderId', order.id);
      form.setValue('toName', order.fullName);
      form.setValue('toAddress1', order.address);
      form.setValue('toCity', order.city);
      form.setValue('toState', order.state);
      form.setValue('toZip', order.zipCode);
      form.setValue('toPhone', order.phone || '');
      
      // Calculate package size and weight
      if (orderData.items && orderData.items.length > 0) {
        // Simple logic to determine size based on quantity
        const totalItems = orderData.items.reduce((total: number, item: any) => total + item.quantity, 0);
        
        if (totalItems <= 1) {
          form.setValue('packageSize', 'small');
          form.setValue('weight', '1');
        } else if (totalItems <= 3) {
          form.setValue('packageSize', 'medium');
          form.setValue('weight', '3');
        } else {
          form.setValue('packageSize', 'large');
          form.setValue('weight', '5');
        }
      }
    }
  }, [orderData, form]);
  
  // Generate shipping label
  const onSubmit = async (values: ShippingFormValues) => {
    setIsGeneratingLabel(true);
    
    try {
      // Simulate API call to USPS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock label ID
      const labelId = `USPS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Add to completed labels
      setCompletedLabels(prev => [...prev, labelId]);
      
      toast({
        title: 'Shipping Label Created',
        description: `Label ${labelId} has been created successfully.`,
      });
      
      // If there are more orders, go to next order
      if (currentOrderIndex < orderIds.length - 1) {
        setCurrentOrderIndex(prevIndex => prevIndex + 1);
        
        toast({
          title: 'Processing Next Order',
          description: `Moving to the next order in the queue.`,
        });
      }
      
      // Update order status to shipped
      if (currentOrderId) {
        try {
          const response = await fetch(`/api/admin/orders/${currentOrderId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'shipped' }),
          });
        } catch (error) {
          console.error('Failed to update order status:', error);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate shipping label. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingLabel(false);
    }
  };
  
  // Get selected shipping service details
  const getSelectedServiceDetails = () => {
    const serviceId = form.watch('shippingService');
    return shippingServices.find(service => service.id === serviceId);
  };
  
  const service = getSelectedServiceDetails();
  
  // Get progress text
  const getProgressText = () => {
    if (orderIds.length === 0) {
      return 'No orders to process';
    }
    
    return `Processing ${currentOrderIndex + 1} of ${orderIds.length} orders`;
  };
  
  return (
    <AdminLayout title="Create Shipping Label">
      <div className="space-y-6">
        {/* Back button and progress */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            onClick={() => setLocation('/admin/orders')}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          {orderIds.length > 0 && (
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{getProgressText()}</span>
            </div>
          )}
        </div>
        
        {/* Main Content */}
        {orderIds.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Create a Single Shipping Label</CardTitle>
              <CardDescription>
                Fill out the form below to create a new shipping label. You can also process orders directly from the orders page.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        
        {/* Order information if available */}
        {currentOrderId && orderData?.order && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Order #{orderData.order.id}
              </CardTitle>
              <CardDescription>
                Created on {new Date(orderData.order.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium">{orderData.order.fullName}</p>
                  <p className="text-muted-foreground mt-1">{orderData.order.email}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground mb-1">Shipping Address</p>
                  <p>{orderData.order.address}</p>
                  <p>{orderData.order.city}, {orderData.order.state} {orderData.order.zipCode}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground mb-1">Order Summary</p>
                  <p>{orderData.items?.length || 0} items, ${Number(orderData.order.totalAmount).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Shipping Label Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    From Address
                  </CardTitle>
                  <CardDescription>
                    Your business or return address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fromCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fromAddress1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Street Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fromAddress2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt, Suite, Unit, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="fromCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fromState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fromZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ZIP Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="fromPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* To Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    To Address
                  </CardTitle>
                  <CardDescription>
                    Recipient's shipping address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="toName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="toCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="toAddress1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Street Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="toAddress2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt, Suite, Unit, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="toCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="toState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="toZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ZIP Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="toPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Package Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Package Details
                  </CardTitle>
                  <CardDescription>
                    Size and weight information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="packageSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select package size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {packageSizes.map(size => (
                              <SelectItem key={size.id} value={size.id}>
                                {size.name} - {size.dimensions} ({size.weight})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0.1" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('packageSize') === 'custom' && (
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (in)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0.1" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (in)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0.1" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (in)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0.1" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="contents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Contents (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description of contents" {...field} />
                        </FormControl>
                        <FormDescription>
                          This information is used for customs declarations for international shipments.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Shipping Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Method
                  </CardTitle>
                  <CardDescription>
                    Select shipping service and options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shippingService"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Shipping Service</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            {shippingServices.map(service => (
                              <div key={service.id} className="flex items-center space-x-2 rounded-md border p-4">
                                <RadioGroupItem value={service.id} id={service.id} />
                                <Label htmlFor={service.id} className="flex flex-1 justify-between cursor-pointer">
                                  <div>
                                    <p className="font-medium">{service.name}</p>
                                    <p className="text-xs text-muted-foreground">Delivery in {service.daysToDeliver} business days</p>
                                  </div>
                                  <p className="font-medium">${service.price.toFixed(2)}</p>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="signature"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Signature Required (+$3.00)
                            </FormLabel>
                            <FormDescription>
                              Requires signature upon delivery
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="insurance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Add Insurance
                            </FormLabel>
                            <FormDescription>
                              Insure package for loss or damage
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('insurance') && (
                      <FormField
                        control={form.control}
                        name="insuranceValue"
                        render={({ field }) => (
                          <FormItem className="ml-7">
                            <FormLabel>Insurance Value ($)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormDescription>
                              Package will be insured up to this amount.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="returnLabel"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Include Return Label (+$3.00)
                            </FormLabel>
                            <FormDescription>
                              Include a return shipping label
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start pt-0">
                  <div className="w-full p-4 bg-accent/10 rounded-md">
                    <div className="flex justify-between font-medium mb-2">
                      <span>Shipping Cost:</span>
                      <span>${service?.price.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    {form.watch('signature') && (
                      <div className="flex justify-between text-sm mb-2">
                        <span>Signature Required:</span>
                        <span>$3.00</span>
                      </div>
                    )}
                    
                    {form.watch('insurance') && form.watch('insuranceValue') && (
                      <div className="flex justify-between text-sm mb-2">
                        <span>Insurance:</span>
                        <span>$2.50</span>
                      </div>
                    )}
                    
                    {form.watch('returnLabel') && (
                      <div className="flex justify-between text-sm mb-2">
                        <span>Return Label:</span>
                        <span>$3.00</span>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>
                        ${(
                          (service?.price || 0) +
                          (form.watch('signature') ? 3 : 0) +
                          (form.watch('insurance') && form.watch('insuranceValue') ? 2.50 : 0) +
                          (form.watch('returnLabel') ? 3 : 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isGeneratingLabel}
                className="w-full md:w-auto"
              >
                {isGeneratingLabel ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Label...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Printer className="mr-2 h-5 w-5" />
                    Create Shipping Label
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Completed Labels */}
        {completedLabels.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Completed Labels ({completedLabels.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedLabels.map((labelId, index) => (
                  <div key={labelId} className="flex justify-between items-center p-4 bg-accent/5 rounded-md">
                    <div>
                      <p className="font-medium">Label #{index + 1}: {labelId}</p>
                      <p className="text-sm text-muted-foreground">Created {new Date().toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setLocation('/admin/orders')} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}