import { useState } from "react";
import { ArrowLeft, ShoppingBag, CreditCard, Truck, Shield, MessageCircle, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  name: string;
  provider: string;
  price: string; // e.g., "57USD"
  image: string;
  quantity: number;
  duration: string;
}

interface CheckoutPageProps {
  cartItems: CartItem[];
}

export const CheckoutPage = ({ cartItems }: CheckoutPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("whatsapp");
  const [orderStatus, setOrderStatus] = useState<"form" | "whatsapp-instructions" | "processing" | "completed">("form");
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  const [copiedText, setCopiedText] = useState<string>("");

  // Calculate total, savings, and final amount
  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('USD', '')); // Use parseFloat for accurate calculations
    return sum + (price * item.quantity);
  }, 0);

  const savings = Math.floor(total * 0.2); // Assuming 20% savings
  const finalAmount = total - savings;

  // Generate order ID
  // Using a more robust order ID that's consistent across the checkout process
  const [orderId, setOrderId] = useState<string>(`SDN-${Date.now().toString().slice(-6)}`);

  // Function to generate WhatsApp message content
  const generateWhatsAppMessage = () => {
    const itemsList = cartItems.map(item =>
      `• ${item.name} (${item.duration}) - Qty: ${item.quantity} - $${(parseFloat(item.price.replace('USD', '')) * item.quantity).toFixed(2)}`
    ).join('\n');

    return `🛒 *New Order from Shopdiginow*

*Order ID:* ${orderId}
*Customer:* ${customerInfo.firstName} ${customerInfo.lastName}
*Email:* ${customerInfo.email}
*Phone:* ${customerInfo.phone}

*Items:*
${itemsList}

*Subtotal:* $${total.toFixed(2)}
*Discount:* -$${savings.toFixed(2)}
*Total Amount:* $${finalAmount.toFixed(2)}

*Payment Method:* WhatsApp Payment

Please confirm this order and provide payment instructions.`;
  };

  // Function to log order details - using GET request to bypass CORS
  const logOrderToGoogleSheets = async (orderData: any) => {
    try {
      // Using GET request with URL parameters to bypass CORS preflight
      const webAppUrl = 'https://script.google.com/macros/s/AKfycbyhYMLWAFyBdwaKEG1pSNiFFXS-MyTU0WWGh1fN5uXaGX3a3g_W1aLL1tAeDgnbuEINzQ/exec';
      
      // Send each item as a separate request to Google Sheets with unique order IDs
      const logPromises = orderData.items.map(async (item: any, index: number) => {
        // Create unique order ID for each item to ensure separate rows
        const uniqueOrderId = orderData.items.length > 1 
          ? `${orderData.orderId}-${index + 1}` 
          : orderData.orderId;
        
        const itemPrice = parseFloat(item.price.replace(' USD', ''));
        
        const params = new URLSearchParams({
          order_id: uniqueOrderId,
          customer_name: orderData.customer,
          customer_email: orderData.email,
          customer_phone: orderData.phone,
          product_name: `${item.name} (${item.provider}) - ${item.duration}`,
          product_quantity: item.quantity.toString(),
          total_amount: `${itemPrice.toFixed(2)} USD`, // Each item gets its own price
          payment_method: orderData.paymentMethod,
          order_date: orderData.timestamp,
          status: 'Pending'
        });

        const requestUrl = `${webAppUrl}?${params.toString()}`;
        console.log(`Sending GET request to Google Sheets for item ${index + 1}:`, requestUrl);

        // Use GET request which doesn't trigger CORS preflight
        const response = await fetch(requestUrl, {
          method: 'GET',
          mode: 'cors'
        });

        if (response.ok) {
          const result = await response.text();
          console.log(`Item ${index + 1} logged to Google Sheets successfully:`, result);
          return true;
        } else {
          console.error(`Failed to log item ${index + 1} to Google Sheets:`, response.status);
          return false;
        }
      });

      // Wait for all items to be logged
      const results = await Promise.all(logPromises);
      const allSuccessful = results.every(result => result === true);

      if (allSuccessful) {
        console.log(`All ${orderData.items.length} items logged successfully`);
        return true;
      } else {
        console.log('Some items failed to log, but order logged locally:', orderData);
        return true; // Allow checkout to proceed
      }
    } catch (error) {
      console.error('Error logging order to Google Sheets:', error);
      // Fallback: still proceed with checkout but log locally
      console.log('Order logged locally:', orderData);
      return true; // Allow checkout to proceed
    }
  };

  // This function now prepares data and calls logOrderToGoogleSheets
  // It's separated from handleProceedToPayment to keep concerns distinct.
  const finalizeOrderAndLog = async () => {
    // Generate a new order ID if not already set (e.g., on initial load)
    // This ensures orderId is generated once and used consistently
    const currentOrderId = orderId; // Use the state variable directly

    const orderData = {
      orderId: currentOrderId,
      customer: `${customerInfo.firstName} ${customerInfo.lastName}`,
      email: customerInfo.email,
      phone: customerInfo.phone,
      total: `${finalAmount.toFixed(2)} USD`, // Ensure consistent format
      subtotal: `${total.toFixed(2)} USD`,
      savings: `${savings.toFixed(2)} USD`,
      paymentMethod: paymentMethod === "whatsapp" ? 'WhatsApp Payment' : 'Credit/Debit Card', // Use state for payment method
      items: cartItems.map(item => ({
        name: item.name,
        provider: item.provider,
        duration: item.duration,
        quantity: item.quantity,
        price: `${(parseFloat(item.price.replace('USD', '')) * item.quantity).toFixed(2)} USD`
      })),
      timestamp: new Date().toISOString()
    };

    console.log('Order data prepared for logging:', orderData);
    
    // Log to Google Sheets
    const loggedSuccessfully = await logOrderToGoogleSheets(orderData);
    if (!loggedSuccessfully) {
      // If logging fails, you might want to prevent proceeding or show a critical error
      // For now, we'll let it proceed but the toast will inform the user.
      console.warn("Order logging to Google Sheets failed, but proceeding with checkout flow.");
    }
    return loggedSuccessfully;
  };

  // Handle copying text to clipboard
  const handleCopyText = async (text: string, type: string) => {
    try {
      // Use execCommand for broader compatibility in iframes if navigator.clipboard fails
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or restricted environments
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Avoid scrolling to bottom
        textArea.style.left = "-9999px"; // Hide from view
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedText(type);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  // Form validation before proceeding
  const validateForm = () => {
    const { firstName, lastName, email, phone } = customerInfo;
    if (!firstName || !lastName || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  // Main handler when "Proceed to Payment" is clicked
  const handleProceedToPayment = async () => {
    if (!validateForm()) return; // Validate form first

    // Proceed to payment immediately without waiting for logging
    if (paymentMethod === "whatsapp") {
      setOrderStatus("whatsapp-instructions");
    } else {
      setOrderStatus("completed");
      toast({
        title: "Payment Method",
        description: "Credit/Debit Card payment is coming soon.",
      });
    }

    // Log order to Google Sheets in the background (don't wait for it)
    finalizeOrderAndLog().catch(error => {
      console.error('Background logging failed:', error);
    });
  };

  // Handle input changes for customer info
  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  // If cart is empty, display a message
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">Add some products to proceed with checkout</p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Checkout</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
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
                      <div className="flex justify-between mt-1">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="text-sm font-medium">
                          ${(parseFloat(item.price.replace('USD', '')) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-success">
                    <span>You Save:</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-price">${finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      value={customerInfo.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      value={customerInfo.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 123-4567" 
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Digital Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        Instant delivery via email and WhatsApp
                      </p>
                    </div>
                    <span className="text-success font-medium">FREE</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Form (initial state) */}
                {orderStatus === "form" && (
                  <>
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Select Payment Method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                        <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="whatsapp" id="whatsapp" />
                          <div className="flex-1">
                            <Label htmlFor="whatsapp" className="flex items-center gap-3 cursor-pointer">
                              <MessageCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <div className="font-medium">Pay via WhatsApp</div>
                                <div className="text-sm text-muted-foreground">Quick and secure payment through WhatsApp</div>
                              </div>
                              <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                            </Label>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors opacity-50">
                          <RadioGroupItem value="card" id="card" disabled />
                          <div className="flex-1">
                            <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer">
                              <CreditCard className="h-5 w-5" />
                              <div>
                                <div className="font-medium">Credit/Debit Card</div>
                                <div className="text-sm text-muted-foreground">Pay with your card (Coming Soon)</div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button variant="buy" size="xl" className="w-full" onClick={handleProceedToPayment}>
                      Proceed to Payment - ${finalAmount.toFixed(2)}
                    </Button>
                  </>
                )}

                {/* WhatsApp Instructions (after "Proceed to Payment" if WhatsApp selected) */}
                {orderStatus === "whatsapp-instructions" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Complete Payment via WhatsApp</h3>
                      <p className="text-muted-foreground">
                        Follow the instructions below to complete your order
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          Step 1: Contact Us on WhatsApp
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">WhatsApp Number:</span>
                            <code className="bg-background px-2 py-1 rounded text-sm font-mono">+212 604-567810</code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyText("+212 604-567810", "Phone number")}
                            >
                              {copiedText === "Phone number" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => window.open("https://wa.me/212604567810", "_blank")}
                            >
                              Open WhatsApp
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCopyText("+212 604-567810", "Phone number")}
                            >
                              Copy Number
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-3">Step 2: Send This Order Message</h4>
                        <div className="bg-background p-3 rounded border text-sm font-mono whitespace-pre-wrap mb-3">
                          {generateWhatsAppMessage()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleCopyText(generateWhatsAppMessage(), "Order message")}
                          >
                            {copiedText === "Order message" ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Message
                              </>
                            )}
                          </Button>
                          <Button
                            variant="buy"
                            onClick={() => {
                              const message = encodeURIComponent(generateWhatsAppMessage());
                              window.open(`https://wa.me/212604567810?text=${message}`, "_blank");
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send via WhatsApp
                          </Button>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-2">Step 3: Payment Instructions</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Our team will respond with payment instructions and account details within 5 minutes.
                        </p>
                        <div className="text-xs text-muted-foreground">
                          💡 <strong>Tip:</strong> Keep this page open to track your order status
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setOrderStatus("form")}>
                        Back to Form
                      </Button>
                      <Button
                        variant="buy"
                        className="flex-1"
                        onClick={() => {
                          // This button now only sets status to completed and shows toast,
                          // as logging is already done in handleProceedToPayment.
                          setOrderStatus("completed");
                          toast({
                            title: "Order Submitted!",
                            description: "We'll process your order once payment is confirmed.",
                          });
                        }}
                      >
                        I've Sent the Message
                      </Button>
                    </div>
                  </div>
                )}

                {/* Order Completed (after "I've Sent the Message") */}
                {orderStatus === "completed" && (
                  <div className="text-center space-y-6">
                    <div className="text-center">
                      <Check className="h-16 w-16 text-success mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Order Submitted Successfully!</h3>
                      <p className="text-muted-foreground mb-4">
                        Order ID: <code className="bg-muted px-2 py-1 rounded">{orderId}</code>
                      </p>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg border border-border text-left">
                      <h4 className="font-medium mb-2">What happens next?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Our team will confirm your order within 5-15 minutes</li>
                        <li>• You'll receive payment instructions via WhatsApp</li>
                        <li>• After payment, digital products will be delivered instantly</li>
                        <li>• Order confirmation will be sent to your email</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                        Continue Shopping
                      </Button>
                      <Button
                        variant="buy"
                        className="flex-1"
                        onClick={() => window.open("https://wa.me/212604567810", "_blank")}
                      >
                        Contact Support
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-center text-muted-foreground">
                  🔒 Your information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
