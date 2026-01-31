import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate } from '@/data/mockData';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, updateItem, clearCart, getSubtotal, getTax, getTotal, createQuotation } = useCart();
  const { addQuotation, addOrder, companySettings } = useData();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [notes, setNotes] = useState('');

  const handleQuantityChange = (productId: string, delta: number) => {
    const item = items.find(i => i.product.id === productId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      updateItem(productId, { quantity: newQuantity });
    }
  };

  const handleCheckout = async () => {
    if (!user) return;
    
    setIsCheckingOut(true);
    
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create quotation
    const quotation = createQuotation(user.id, user.name);
    quotation.notes = notes;
    addQuotation(quotation);
    
    // Convert to order
    const securityDeposit = getTotal() * (companySettings.securityDepositPercent / 100);
    
    addOrder({
      customerId: user.id,
      customerName: user.name,
      vendorId: 'vendor-1',
      lines: quotation.lines,
      status: 'draft',
      subtotal: getSubtotal(),
      tax: getTax(),
      total: getTotal(),
      securityDeposit,
      lateFee: 0,
      notes,
    });
    
    clearCart();
    setIsCheckingOut(false);
    
    toast({
      title: 'Order Placed Successfully!',
      description: 'Your rental order has been submitted for processing.',
    });
    
    navigate('/my-orders');
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 animate-fade-in">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground">Browse our products and add items to your cart</p>
        <Button onClick={() => navigate('/shop')}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/shop')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">{items.length} item(s) in your cart</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-lg bg-muted flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.product.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Period: {item.rentalPeriod}</p>
                      <p>{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.product.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.product.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.pricePerPeriod * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any special instructions or notes for your order..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18% GST)</span>
                  <span>{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit ({companySettings.securityDepositPercent}%)</span>
                  <span>{formatCurrency(getTotal() * (companySettings.securityDepositPercent / 100))}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(getTotal() + getTotal() * (companySettings.securityDepositPercent / 100))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
