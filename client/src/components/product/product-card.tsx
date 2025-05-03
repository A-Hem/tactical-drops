import { Link } from "wouter";
import { Heart, ShoppingCart, Star, StarHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      quantity: 1
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Rating stars
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
    <Link href={`/products/${product.slug}`}>
      <div className="product-card cursor-pointer h-full flex flex-col">
        <div className="relative">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-56 object-cover"
          />
          {product.isNew && (
            <div className="absolute top-4 left-4">
              <span className="badge-new">NEW</span>
            </div>
          )}
          {product.isSale && (
            <div className="absolute top-4 left-4">
              <span className="badge-sale">SALE</span>
            </div>
          )}
          <button 
            className="absolute top-4 right-4 bg-secondary/70 hover:bg-secondary text-white p-2 rounded-full transition-all"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast({
                title: "Feature not available",
                description: "Wishlist functionality is coming soon!",
              });
            }}
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          <div className="mt-2 flex text-sm">
            <div className="flex">
              {renderRatingStars(Number(product.rating))}
            </div>
            <span className="ml-2 text-muted-foreground">({product.reviewCount})</span>
          </div>
          <div className="mt-auto pt-4 flex justify-between items-center">
            <div>
              <span className="text-accent font-bold">${Number(product.price).toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="text-muted-foreground line-through ml-2 text-sm">
                  ${Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="hover:bg-secondary/80 text-white rounded-lg transition-all"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
