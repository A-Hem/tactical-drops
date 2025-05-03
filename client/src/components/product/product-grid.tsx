import { useQuery } from "@tanstack/react-query";
import ProductCard from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@shared/schema";

interface ProductGridProps {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
}

const ProductGrid = ({ categorySlug, featured, limit }: ProductGridProps) => {
  let queryUrl = "/api/products";
  
  if (categorySlug) {
    queryUrl += `?category=${categorySlug}`;
  } else if (featured) {
    queryUrl += "?featured=true";
  }

  const { data, isLoading, error } = useQuery({
    queryKey: [queryUrl],
    queryFn: async () => {
      const response = await fetch(queryUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-card rounded-xl overflow-hidden shadow-xl">
            <Skeleton className="w-full h-56" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading products. Please try again later.</p>
      </div>
    );
  }

  const products: Product[] = data?.products || [];
  const displayProducts = limit ? products.slice(0, limit) : products;

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
