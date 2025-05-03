import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  ShoppingBag, 
  Search, 
  ArrowUpDown, 
  RefreshCcw, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash,
  Package,
  XCircle,
  Save,
  BarChart,
  ArrowDown,
  ArrowUp
} from 'lucide-react';

export default function AdminInventory() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch products from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  // Update product inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ id, inventory }: { id: number, inventory: number }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventory }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Inventory Updated',
        description: 'Product inventory has been updated successfully',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update inventory: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Filter and sort products
  const filteredProducts = data?.products
    ? data.products
        .filter((product: any) => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a: any, b: any) => {
          const direction = sortDirection === 'asc' ? 1 : -1;
          
          if (sortField === 'name') {
            return direction * a.name.localeCompare(b.name);
          } else if (sortField === 'price') {
            return direction * (Number(a.price) - Number(b.price));
          } else if (sortField === 'inventory') {
            return direction * (a.inventory - b.inventory);
          }
          
          return 0;
        })
    : [];

  // Inventory status badge
  const InventoryStatusBadge = ({ inventory }: { inventory: number }) => {
    if (inventory <= 0) {
      return <Badge variant="outline" className="bg-red-500/10 text-red-500">Out of Stock</Badge>;
    } else if (inventory <= 5) {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-500/10 text-green-500">In Stock</Badge>;
    }
  };

  // Toggle sort direction or set new sort field
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Open edit dialog
  const handleEditInventory = (product: any) => {
    setEditingProduct({ ...product, newInventory: product.inventory });
    setIsEditDialogOpen(true);
  };

  // Save inventory changes
  const handleSaveInventory = () => {
    if (editingProduct) {
      updateInventoryMutation.mutate({
        id: editingProduct.id,
        inventory: editingProduct.newInventory
      });
    }
  };

  // Quick adjustment buttons
  const adjustInventory = (amount: number) => {
    if (editingProduct) {
      const newInventory = Math.max(0, editingProduct.newInventory + amount);
      setEditingProduct({ ...editingProduct, newInventory });
    }
  };

  // Calculate inventory statistics
  const calculateStats = () => {
    if (!data?.products || data.products.length === 0) {
      return {
        totalProducts: 0,
        totalInventory: 0,
        outOfStockCount: 0,
        lowStockCount: 0
      };
    }

    const totalProducts = data.products.length;
    const totalInventory = data.products.reduce((total: number, product: any) => total + product.inventory, 0);
    const outOfStockCount = data.products.filter((product: any) => product.inventory <= 0).length;
    const lowStockCount = data.products.filter((product: any) => product.inventory > 0 && product.inventory <= 5).length;

    return {
      totalProducts,
      totalInventory,
      outOfStockCount,
      lowStockCount
    };
  };

  const stats = calculateStats();

  return (
    <AdminLayout title="Inventory Management">
      <div className="space-y-6">
        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Total Items In Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{stats.totalInventory}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center text-yellow-500">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{stats.lowStockCount}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center text-red-500">
                <XCircle className="h-4 w-4 mr-2" />
                Out of Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold">{stats.outOfStockCount}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or SKU..."
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
              onClick={() => setLocation('/admin/products/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
        
        {/* Products Table */}
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
            <h3 className="text-lg font-medium">Failed to load products</h3>
            <p className="text-muted-foreground">Please try again later</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try changing your search term" : "Start by adding some products"}
            </p>
            {!searchTerm && (
              <Button 
                variant="default" 
                className="mt-4"
                onClick={() => setLocation('/admin/products/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Product Name
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                    <div className="flex items-center">
                      Price
                      {sortField === 'price' && (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('inventory')}>
                    <div className="flex items-center">
                      Inventory
                      {sortField === 'inventory' && (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any, index: number) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 mr-3 bg-secondary rounded overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/333/white?text=No+Image';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.categoryName || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku || 'N/A'}</TableCell>
                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.inventory <= 5 ? 'text-yellow-500 font-medium' : 'font-medium'}>
                        {product.inventory}
                      </span>
                    </TableCell>
                    <TableCell>
                      <InventoryStatusBadge inventory={product.inventory} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditInventory(product)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLocation(`/admin/products/edit/${product.id}`)}
                        >
                          <BarChart className="h-4 w-4" />
                          <span className="sr-only">Details</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Edit Inventory Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Inventory</DialogTitle>
              <DialogDescription>
                {editingProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">Current Inventory:</label>
                <span className="text-lg">{editingProduct?.inventory}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustInventory(-5)}
                  disabled={editingProduct?.newInventory < 5}
                >
                  -5
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustInventory(-1)}
                  disabled={editingProduct?.newInventory < 1}
                >
                  -1
                </Button>
                <Input 
                  type="number" 
                  value={editingProduct?.newInventory}
                  min="0"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setEditingProduct({
                        ...editingProduct,
                        newInventory: value
                      });
                    }
                  }}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustInventory(1)}
                >
                  +1
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustInventory(5)}
                >
                  +5
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handleSaveInventory}
                disabled={updateInventoryMutation.isPending || editingProduct?.inventory === editingProduct?.newInventory}
              >
                {updateInventoryMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="mr-2 h-5 w-5" />
                    Save
                  </div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}