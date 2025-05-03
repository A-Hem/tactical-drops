import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Layout from "@/components/layout/layout";
import ProductGrid from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@shared/schema";

export default function Products() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState("featured");

  // Fetch category if slug is provided
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: slug ? [`/api/categories/${slug}`] : null,
    queryFn: async () => {
      const response = await fetch(`/api/categories/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch category");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  // Fetch all categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  const getTitle = () => {
    if (slug) {
      if (categoryLoading) return "Loading...";
      if (categoryData?.category) return categoryData.category.name;
      return "Products";
    }
    return "All Products";
  };

  const getDescription = () => {
    if (slug && categoryData?.category) {
      return categoryData.category.description;
    }
    return "Browse our selection of premium tactical gear and equipment";
  };

  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white">{getTitle()}</h1>
              <div className="w-24 h-1 bg-accent mt-4"></div>
              <p className="mt-4 text-muted-foreground">{getDescription()}</p>
            </div>
            <div className="mt-6 md:mt-0 flex items-center">
              <span className="text-muted-foreground mr-3">Sort by:</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="bg-secondary text-white min-w-[180px]">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category filters for desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            <div className="hidden lg:block">
              <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
              {categoriesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      !slug
                        ? "bg-secondary text-white"
                        : "hover:bg-secondary/50 text-muted-foreground"
                    }`}
                    onClick={() => (window.location.href = "/products")}
                  >
                    All Products
                  </div>
                  {categoriesData?.categories?.map((category: Category) => (
                    <div
                      key={category.id}
                      className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        slug === category.slug
                          ? "bg-secondary text-white"
                          : "hover:bg-secondary/50 text-muted-foreground"
                      }`}
                      onClick={() => (window.location.href = `/products/category/${category.slug}`)}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <ProductGrid categorySlug={slug} />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
