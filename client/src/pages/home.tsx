import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Newsletter from "@/components/home/newsletter";
import ProductGrid from "@/components/product/product-grid";
import CategoryCard from "@/components/product/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Category } from "@shared/schema";

export default function Home() {
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

  // Featured product data
  const { data: featuredProductData, isLoading: featuredProductLoading } = useQuery({
    queryKey: ["/api/products/leupold-mark-4-circle-dot-scope"],
    queryFn: async () => {
      const response = await fetch("/api/products/leupold-mark-4-circle-dot-scope");
      if (!response.ok) {
        throw new Error("Failed to fetch featured product");
      }
      return response.json();
    },
  });

  return (
    <Layout>
      {/* Hero Section */}
      <Hero />

      {/* Featured Product Section */}
      <section id="featured" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Featured Product</h2>
            <div className="w-24 h-1 bg-accent mx-auto mt-4"></div>
          </div>

          {featuredProductLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <Skeleton className="h-96 w-full rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          ) : featuredProductData?.product ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="bg-card rounded-xl overflow-hidden shadow-xl p-4">
                <div className="relative h-72 sm:h-96">
                  <img
                    src={featuredProductData.product.imageUrl}
                    alt={featuredProductData.product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {featuredProductData.images && featuredProductData.images.length > 0 && (
                  <div className="mt-6 flex justify-center gap-4">
                    {featuredProductData.images.slice(0, 3).map((image, index) => (
                      <button
                        key={index}
                        className="w-20 h-20 bg-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-accent focus:outline-none"
                      >
                        <img
                          src={image.url}
                          alt={`${featuredProductData.product.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center">
                  <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">
                    Best Seller
                  </span>
                  <div className="ml-4 flex text-accent">
                    {Array.from({ length: Math.floor(Number(featuredProductData.product.rating)) }).map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                    {Number(featuredProductData.product.rating) % 1 >= 0.5 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="ml-2 text-muted-foreground text-sm">
                      ({featuredProductData.product.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <h3 className="mt-4 text-3xl font-bold text-white">{featuredProductData.product.name}</h3>
                <p className="mt-2 text-xl text-accent font-bold">
                  ${Number(featuredProductData.product.price).toFixed(2)}
                  {featuredProductData.product.compareAtPrice && (
                    <span className="ml-2 text-muted-foreground line-through text-lg">
                      ${Number(featuredProductData.product.compareAtPrice).toFixed(2)}
                    </span>
                  )}
                </p>

                <div className="mt-6 space-y-4">
                  {featuredProductData.product.description.split('. ').map((sentence, i) => (
                    <div key={i} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-accent mt-1 h-5 w-5 flex-shrink-0"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="ml-3 text-muted-foreground">{sentence}.</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link href={`/products/${featuredProductData.product.slug}`}>
                    <Button className="w-full btn-primary">View Product Details</Button>
                  </Link>
                </div>

                {featuredProductData.specifications && featuredProductData.specifications.length > 0 && (
                  <div className="mt-8 border-t border-secondary pt-6">
                    <h4 className="font-semibold text-white">Product Specifications</h4>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {featuredProductData.specifications.map((spec) => (
                        <div key={spec.id}>
                          <p className="text-muted-foreground text-sm">{spec.key}</p>
                          <p className="text-white">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                    <Link href={`/products/${featuredProductData.product.slug}`} className="inline-block mt-4 text-accent hover:underline">
                      View Full Specifications
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Featured product not available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Product Categories</h2>
            <div className="w-24 h-1 bg-accent mx-auto mt-4"></div>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : categoriesData?.categories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoriesData.categories.map((category: Category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No categories available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white">Popular Products</h2>
              <div className="w-24 h-1 bg-accent mt-4"></div>
            </div>
          </div>

          <ProductGrid limit={4} />

          <div className="mt-12 text-center">
            <Link href="/products">
              <Button variant="outline" className="btn-secondary">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <Features />

      {/* Newsletter */}
      <Newsletter />
    </Layout>
  );
}
