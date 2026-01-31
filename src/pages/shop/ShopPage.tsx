import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Product, RentalPeriod } from '@/types';
import { formatCurrency, productCategories } from '@/data/mockData';
import { Search, Filter, ShoppingCart, Calendar as CalendarIcon, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ShopPage() {
  const navigate = useNavigate();
  const { products } = useData();
  const { addItem, getItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  
  // Rental configuration state
  const [rentConfig, setRentConfig] = useState({
    quantity: 1,
    period: 'daily' as RentalPeriod,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const publishedProducts = products.filter(p => p.isPublished && p.isRentable);
  
  const filteredProducts = publishedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openRentDialog = (product: Product) => {
    setSelectedProduct(product);
    setRentConfig({
      quantity: 1,
      period: 'daily',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    setIsRentDialogOpen(true);
  };

  const calculateEstimatedTotal = () => {
    if (!selectedProduct) return 0;
    
    const diffTime = Math.abs(rentConfig.endDate.getTime() - rentConfig.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    let price = 0;
    switch (rentConfig.period) {
      case 'hourly':
        price = selectedProduct.rentalPrices.hourly * diffDays * 24;
        break;
      case 'daily':
        price = selectedProduct.rentalPrices.daily * diffDays;
        break;
      case 'weekly':
        price = selectedProduct.rentalPrices.weekly * Math.ceil(diffDays / 7);
        break;
    }
    
    return price * rentConfig.quantity;
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addItem(
        selectedProduct,
        rentConfig.quantity,
        rentConfig.period,
        rentConfig.startDate,
        rentConfig.endDate
      );
      setIsRentDialogOpen(false);
    }
  };

  const cartCount = getItemCount();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rental Shop</h1>
          <p className="text-muted-foreground">Browse and rent equipment for your needs</p>
        </div>
        <Button onClick={() => navigate('/cart')} className="relative">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart
          {cartCount > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
              {cartCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {productCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const available = product.quantityOnHand - product.quantityWithCustomer;
          return (
            <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hourly:</span>
                    <span className="font-medium">{formatCurrency(product.rentalPrices.hourly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily:</span>
                    <span className="font-medium">{formatCurrency(product.rentalPrices.daily)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekly:</span>
                    <span className="font-medium">{formatCurrency(product.rentalPrices.weekly)}</span>
                  </div>
                </div>
                <p className={cn(
                  "mt-2 text-sm",
                  available > 2 ? "text-success" : available > 0 ? "text-warning" : "text-destructive"
                )}>
                  {available > 0 ? `${available} available` : 'Out of stock'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={available <= 0}
                  onClick={() => openRentDialog(product)}
                >
                  Rent Now
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}

      {/* Rent Configuration Dialog */}
      <Dialog open={isRentDialogOpen} onOpenChange={setIsRentDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Configure Rental</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <img
                      src={selectedProduct.images[0]}
                      alt=""
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedProduct.category}</p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRentConfig(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{rentConfig.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRentConfig(prev => ({ 
                        ...prev, 
                        quantity: Math.min(selectedProduct.quantityOnHand - selectedProduct.quantityWithCustomer, prev.quantity + 1)
                      }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Rental Period */}
                <div className="space-y-2">
                  <Label>Rental Period</Label>
                  <Select
                    value={rentConfig.period}
                    onValueChange={(value: RentalPeriod) => setRentConfig(prev => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly - {formatCurrency(selectedProduct.rentalPrices.hourly)}/hr</SelectItem>
                      <SelectItem value="daily">Daily - {formatCurrency(selectedProduct.rentalPrices.daily)}/day</SelectItem>
                      <SelectItem value="weekly">Weekly - {formatCurrency(selectedProduct.rentalPrices.weekly)}/week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(rentConfig.startDate, 'PP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={rentConfig.startDate}
                          onSelect={(date) => date && setRentConfig(prev => ({ ...prev, startDate: date }))}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(rentConfig.endDate, 'PP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={rentConfig.endDate}
                          onSelect={(date) => date && setRentConfig(prev => ({ ...prev, endDate: date }))}
                          disabled={(date) => date < rentConfig.startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Estimated Total */}
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Estimated Total</span>
                    <span>{formatCurrency(calculateEstimatedTotal())}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    + 18% GST at checkout
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
