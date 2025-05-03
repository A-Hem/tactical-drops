import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Heart, Minus, Plus, Star, StarHalf, ChevronRight } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/products/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <Skeleton className="h-96 w-full rounded-xl" />
              <div className="flex mt-4 gap-2">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <Skeleton className="h-20 w-20 rounded-lg" />
                <Skeleton className="h-20 w-20 rounded-lg" />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 flex-grow" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data?.product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
          <p className="mt-4 text-muted-foreground">
            The product you're looking for could not be found.
          </p>
          <Link href="/products">
            <Button className="mt-6">Back to Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { product, specifications, images, category } = data;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      quantity,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-accent text-accent" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-accent text-accent" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-accent/30" />);
    }

    return stars;
  };

  return (
    <Layout>
      <div className="bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <Link href="/products" className="hover:text-accent">
              Products
            </Link>
            {category && (
              <>
                <ChevronRight className="mx-2 h-4 w-4" />
                <Link href={`/products/category/${category.slug}`} className="hover:text-accent">
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="bg-card rounded-xl overflow-hidden shadow-xl p-4 mb-4">
                <div className="relative h-72 sm:h-96">
                  <img
                    src={images && images.length > 0 ? images[selectedImage].url : product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {images && images.length > 0 && (
                <div className="flex justify-center gap-4 mt-4">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      className={`w-20 h-20 bg-secondary rounded-lg overflow-hidden focus:outline-none ${
                        selectedImage === index ? "ring-2 ring-accent" : "hover:ring-2 hover:ring-accent/50"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={image.url} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <div className="flex items-center">
                {product.isNew && (
                  <span className="badge-new mr-2">NEW</span>
                )}
                {product.isSale && (
                  <span className="badge-sale mr-2">SALE</span>
                )}
                <div className="flex ml-auto text-accent">
                  {renderRatingStars(Number(product.rating))}
                  <span className="ml-2 text-muted-foreground text-sm">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <h1 className="mt-4 text-3xl font-bold text-white">{product.name}</h1>
              <div className="mt-2 flex items-center">
                <span className="text-2xl text-accent font-bold">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <span className="ml-2 text-muted-foreground line-through text-lg">
                    ${Number(product.compareAtPrice).toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Availability */}
              <div className="mt-6 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-muted-foreground">
                  {product.inventory > 0
                    ? `In Stock (${product.inventory} available)`
                    : "Out of Stock"}
                </span>
              </div>

              {/* Add to Cart */}
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center justify-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="text-muted-foreground"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setQuantity(val);
                        }
                      }}
                      min="1"
                      className="w-12 py-2 bg-transparent text-foreground text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementQuantity}
                      className="text-muted-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="flex-1 btn-primary"
                    onClick={handleAddToCart}
                    disabled={product.inventory <= 0}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="aspect-square"
                    onClick={() => {
                      toast({
                        title: "Feature not available",
                        description: "Wishlist functionality is coming soon!",
                      });
                    }}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Specifications */}
              {specifications && specifications.length > 0 && (
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="font-semibold text-white text-lg mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {specifications.map((spec) => (
                      <div key={spec.id}>
                        <p className="text-muted-foreground text-sm">{spec.key}</p>
                        <p className="text-foreground">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Features */}
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-semibold text-white text-lg mb-4">Features</h3>
                <div className="space-y-3">
                  {product.description.split(". ").map((sentence, i) => (
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
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Related Products</h2>
            <ProductGrid categorySlug={category?.slug} limit={4} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Import at the end to avoid circular dependencies
import ProductGrid from "@/components/product/product-grid";
