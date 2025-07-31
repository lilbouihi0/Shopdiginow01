import { useState } from "react";
import { Search, ShoppingCart, User, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  cartItemCount: number;
  wishlistCount: number;
  onCartOpen: () => void;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
  showCategories?: boolean;
}

export const Header = ({ cartItemCount, wishlistCount, onCartOpen, onSearchChange, onCategoryChange, selectedCategory, showCategories = true }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const categories = [
    "AI Tools", "Software & Apps", "Graphics Tools", "Streaming Tools",
    "Premium VPN", "Productivity Tools", "Writing Tools", "Marketing Tools",
    "Educational Tools"
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span>📧 digipremiumkeys@gmail.com</span>
              <span>📞 +212 604-567810</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span>💬 WhatsApp Support Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div 
              className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              Shop<span className="text-accent">digi</span>now
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for digital products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 h-12"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {wishlistCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" onClick={onCartOpen}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      {showCategories && (
        <div className="border-t border-border">
          <div className="container mx-auto px-4">
            <nav className="hidden md:flex items-center gap-6 py-3 overflow-x-auto">
              <Button 
                variant={selectedCategory === "" ? "default" : "ghost"} 
                size="sm" 
                className="whitespace-nowrap"
                onClick={() => onCategoryChange("")}
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button 
                  key={category} 
                  variant={selectedCategory === category ? "default" : "ghost"} 
                  size="sm" 
                  className="whitespace-nowrap"
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </Button>
              ))}
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-border">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={selectedCategory === "" ? "default" : "ghost"} 
                    size="sm" 
                    className="justify-start"
                    onClick={() => onCategoryChange("")}
                  >
                    All Products
                  </Button>
                  {categories.map((category) => (
                    <Button 
                      key={category} 
                      variant={selectedCategory === category ? "default" : "ghost"} 
                      size="sm" 
                      className="justify-start"
                      onClick={() => onCategoryChange(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};