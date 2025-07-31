import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingCart, Star, Shield, Clock, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";

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

interface CartItem {
  id: number;
  name: string;
  provider: string;
  price: string;
  image: string;
  quantity: number;
  duration: string;
}

interface ProductPageProps {
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  wishlistItems: number[];
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const ProductPage = ({ onAddToCart, onToggleWishlist, wishlistItems, cartItems, setCartItems }: ProductPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const product = products.find(p => p.id === parseInt(id || '0'));
  
  useEffect(() => {
    if (!product) {
      navigate('/404');
    }
  }, [product, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return null;
  }

  const isInWishlist = wishlistItems.includes(product.id);
  const currentPrice = product.durations[selectedDuration];
  const netPrice = parseInt(currentPrice.price.replace('USD', '')); // Net price from data file
  const retailPrice = Math.floor(netPrice * 1.25); // 25% markup for retail price
  const salePrice = netPrice; // Net price is the sale price
  const isLifetime = currentPrice.duration.toLowerCase().includes('lifetime');

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const handleToggleWishlist = () => {
    onToggleWishlist(product.id);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlistItems.length}
        onCartOpen={() => setIsCartOpen(true)}
        onSearchChange={() => {}}
        onCategoryChange={() => {}}
        selectedCategory=""
        showCategories={false}
      />
      
      {/* Back Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </Card>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Secure Purchase</span>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4 text-primary" />
                  <span>Instant Delivery</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.provider}</Badge>
                <Badge variant="secondary">{product.category}</Badge>
                {isLifetime && (
                  <Badge variant="destructive">LIFETIME</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-rating text-rating" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8) • 1,247 reviews</span>
              </div>
            </div>

            {/* Pricing */}
            <Card className="p-6 bg-accent/5">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-3xl font-bold text-price">${salePrice}</span>
                    <span className="text-lg text-muted-foreground line-through ml-2">
                      ${retailPrice}
                    </span>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    Save ${retailPrice - salePrice}
                  </Badge>
                </div>
                
                {/* Duration Options */}
                {product.durations.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {product.durations.map((duration, index) => (
                        <Button
                          key={index}
                          variant={selectedDuration === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDuration(index)}
                          className="justify-between"
                        >
                          <span>{duration.duration}</span>
                          <span>${parseInt(duration.price.replace('USD', ''))}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {currentPrice.duration} • One-time payment
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart - ${salePrice}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>

            {/* Quick Features */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">What's Included:</h3>
              <div className="space-y-2">
                {product.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Description & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Product Description</h2>
              <div className="prose prose-sm max-w-none">
                {product.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Card>

            {/* Features */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Delivery Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>5-15 minutes delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>100% secure activation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </Card>

            {/* Guarantee */}
            <Card className="p-6 bg-success/5 border-success/20">
              <h3 className="font-semibold mb-2 text-success">Our Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                30-day money-back guarantee. If you're not completely satisfied, 
                we'll refund your purchase with no questions asked.
              </p>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card 
                  key={relatedProduct.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <CardContent className="p-0">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {relatedProduct.provider}
                      </Badge>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          ${parseInt(relatedProduct.durations[0].price.replace('USD', ''))}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ${Math.floor(parseInt(relatedProduct.durations[0].price.replace('USD', '')) * 1.25)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
};