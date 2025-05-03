import { Link } from "wouter";
import { Category } from "@shared/schema";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/products/category/${category.slug}`}>
      <div className="group relative overflow-hidden rounded-xl shadow-xl h-64 transition-all cursor-pointer">
        <img 
          src={category.imageUrl} 
          alt={category.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20 group-hover:from-background/95"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-2xl font-bold text-white">{category.name}</h3>
          <p className="mt-2 text-muted-foreground">{category.description}</p>
          <span className="mt-4 inline-flex items-center text-accent group-hover:underline">
            Shop Collection <ChevronRight className="ml-1 h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
