import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function VendorApplicationPage() {
  const { user, applyVendorAccess } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role === 'vendor' || user.role === 'admin') {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await applyVendorAccess(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to apply');
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Vendor Section</CardTitle>
              <CardDescription>
                Add your business details to access the vendor section and start renting out your products.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company / Business Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Your company name"
                value={formData.companyName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN *</Label>
              <Input
                id="gstin"
                name="gstin"
                placeholder="e.g. 29ABCDE1234F1Z5"
                value={formData.gstin}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Apply for vendor access'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            After approval you will have access to Dashboard, Products, Orders, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
