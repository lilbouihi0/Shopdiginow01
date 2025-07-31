import { ProductCard } from "./ProductCard";

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

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  wishlistItems: number[];
  onProductClick: (product: Product) => void;
}

export const ProductGrid = ({ 
  products, 
  onAddToCart, 
  onToggleWishlist, 
  wishlistItems,
  onProductClick 
}: ProductGridProps) => {
  return (
    <section className="py-12" data-product-grid>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground mt-2">
              Discover our most popular digital products
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{products.length} products</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isInWishlist={wishlistItems.includes(product.id)}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};