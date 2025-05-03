import { useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem as CartItemType } from "@/hooks/use-cart";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (isNaN(newQuantity) || newQuantity < 1) return;
    
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const decrementQuantity = () => {
    if (quantity <= 1) return;
    const newQuantity = quantity - 1;
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-border">
      <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-4 sm:mb-0 sm:mr-4">
        <img 
          src={item.product.imageUrl} 
          alt={item.product.name} 
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      
      <div className="flex-grow">
        <h3 className="text-lg font-medium text-foreground">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          ${Number(item.product.price).toFixed(2)}
        </p>
        
        <div className="flex items-center mt-2">
          <div className="flex items-center justify-center border border-border rounded-lg mr-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 p-0"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-12 h-8 text-center p-0 border-0 bg-transparent"
              min="1"
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 p-0"
              onClick={incrementQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-right mt-4 sm:mt-0 ml-auto">
        <p className="font-semibold text-lg">
          ${(Number(item.product.price) * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
