import { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  provider: string;
  category: string;
  durations: Array<{ duration: string; price: string }>;
  description: string;
  features: string[];
  image: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  isInWishlist: boolean;
  onProductClick: (product: Product) => void;
}

export const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isInWishlist,
  onProductClick 
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryPrice = product.durations[0];
  const isLifetime = primaryPrice.duration.toLowerCase().includes('lifetime');
  const netPrice = parseInt(primaryPrice.price.replace('USD', '')); // Net price from data file
  const retailPrice = Math.floor(netPrice * 1.25); // 25% markup for retail price
  const salePrice = netPrice; // Net price is the sale price

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isLifetime && (
              <Badge variant="destructive" className="text-xs">
                LIFETIME
              </Badge>
            )}
            <Badge className="bg-accent text-accent-foreground text-xs">
              20% OFF
            </Badge>
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background ${
              isInWishlist ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="p-4">
          {/* Provider */}
          <div className="text-xs text-muted-foreground mb-1 font-medium">
            {product.provider}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Features */}
          <div className="space-y-1 mb-3">
            {product.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-1 h-1 bg-success rounded-full"></div>
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-rating text-rating" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-price">
              ${salePrice}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ${retailPrice}
            </span>
            <span className="text-xs text-sale font-medium">
              Save ${retailPrice - salePrice}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            {primaryPrice.duration}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-2">
          <Button 
            variant="cart" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          
          {isHovered && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Quick View
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};