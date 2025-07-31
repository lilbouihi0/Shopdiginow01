import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProductGrid } from "@/components/ProductGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { products } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

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

interface IndexProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlistItems: number[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
}

const Index = ({ cartItems, setCartItems, wishlistItems, onAddToCart, onToggleWishlist }: IndexProps) => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { toast } = useToast();

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.features.some(feature => 
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    });
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={cartItemCount}
        wishlistCount={wishlistItems.length}
        onCartOpen={() => setIsCartOpen(true)}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      
      <main>
        <HeroSection />
        <ProductGrid
          products={filteredProducts}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlistItems={wishlistItems}
          onProductClick={handleProductClick}
        />
      </main>

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

export default Index;
