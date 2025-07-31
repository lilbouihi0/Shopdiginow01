import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  const handleBrowseProducts = () => {
    const productGrid = document.querySelector('[data-product-grid]');
    if (productGrid) {
      productGrid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/message/B2TL4OZX6B72C1', '_blank');
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Premium <span className="text-primary">Digital Products</span>
              <br />
              <span className="text-accent">Trusted Worldwide</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get authentic software, subscriptions, and digital tools at unbeatable prices. 
              Fast delivery, lifetime warranty, and 24/7 support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="xl" variant="default" className="font-semibold" onClick={handleBrowseProducts}>
              🚀 Browse Products
            </Button>
            <Button size="xl" variant="outline" onClick={handleWhatsAppSupport}>
              💬 WhatsApp Support
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/50">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">100%</div>
              <div className="text-sm text-muted-foreground">Authentic Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-success">24/7</div>
              <div className="text-sm text-muted-foreground">Customer Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">5 Min</div>
              <div className="text-sm text-muted-foreground">Fast Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};