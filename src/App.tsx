import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { ProductPage } from "./pages/ProductPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import NotFound from "./pages/NotFound";
import { products } from "./data/products";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

interface CartItem {
  id: number;
  name: string;
  provider: string;
  price: string;
  image: string;
  quantity: number;
  duration: string;
}

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

const App = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        provider: product.provider,
        price: product.durations[0].price,
        image: product.image,
        quantity: 1,
        duration: product.durations[0].duration
      };
      setCartItems(prev => [...prev, newItem]);
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = (productId: number) => {
    setWishlistItems(prev => {
      const isInWishlist = prev.includes(productId);
      const product = products.find(p => p.id === productId);
      
      toast({
        title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: `${product?.name || 'Product'} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
      });

      return isInWishlist 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <Index 
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  wishlistItems={wishlistItems}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              } 
            />
            <Route 
              path="/product/:id" 
              element={
                <ProductPage 
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistItems={wishlistItems}
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                />
              } 
            />
            <Route 
              path="/checkout" 
              element={<CheckoutPage cartItems={cartItems} />} 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
