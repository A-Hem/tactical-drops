import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  PlusCircle, 
  Search, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data, isLoading: isLoadingProducts } = useQuery<{products?: any[]}>({
    queryKey: ['/api/products'],
    enabled: true,
  });

  // Filter products based on search query
  const filteredProducts = data?.products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest({
        url: `/api/admin/products/${id}`,
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Product Deleted',
        description: 'The product has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
      });
    },
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <AdminLayout title="Products">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        
        <Button onClick={() => navigate('/admin/products/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {isLoadingProducts ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading products...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No products found.</p>
          {searchQuery && (
            <p className="mt-2">
              Try adjusting your search query or{' '}
              <Button variant="link" onClick={() => setSearchQuery('')}>
                clear the search
              </Button>
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-md border overflow-hidden flex-shrink-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.categoryName || 'Uncategorized'}</TableCell>
                    <TableCell>
                      <div className="font-medium">{formatPrice(product.price)}</div>
                      {product.compareAtPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.compareAtPrice)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.inventory > 0 ? (
                        <span>{product.inventory} in stock</span>
                      ) : (
                        <span className="text-red-500">Out of stock</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.featured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                        {product.isNew && (
                          <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                        )}
                        {product.isSale && (
                          <Badge className="bg-red-500 hover:bg-red-600">Sale</Badge>
                        )}
                        {!product.featured && !product.isNew && !product.isSale && (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setProductToDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstProduct + 1}-
                {Math.min(indexOfLastProduct, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className="w-9"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (productToDelete) {
                  deleteMutation.mutate(productToDelete);
                  setProductToDelete(null);
                }
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}