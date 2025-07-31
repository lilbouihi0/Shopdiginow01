import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: number;
  name: string;
  provider: string;
  price: string;
  image: string;
  quantity: number;
  duration: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem 
}: CartDrawerProps) => {
  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => {
    const price = parseInt(item.price.replace('USD', ''));
    return sum + (price * item.quantity);
  }, 0);

  const savings = Math.floor(total * 0.2); // 20% savings

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl border-l border-border">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <Badge variant="secondary">{cartItems.length}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Add some products to get started
                </p>
                <Button onClick={onClose}>Continue Shopping</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.provider} • {item.duration}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-price">
                            ${parseInt(item.price.replace('USD', '')) * item.quantity}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive h-auto p-0"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-border space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span>You Save:</span>
                  <span>-${savings}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-price">${total - savings}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="buy" className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
              
              <div className="text-xs text-center text-muted-foreground">
                🔒 Secure checkout • 💬 WhatsApp support available
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};