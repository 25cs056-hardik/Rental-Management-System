import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Building2,
  Settings2,
  Tag,
  User,
  Plus,
  X,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    attributes, updateAttributes,
    companySettings, updateCompanySettings,
    rentalSettings, updateRentalSettings
  } = useData();

  const [localCompanySettings, setLocalCompanySettings] = useState(companySettings);
  const [localRentalSettings, setLocalRentalSettings] = useState(rentalSettings);
  const [localAttributes, setLocalAttributes] = useState(attributes);
  const [newAttributeValue, setNewAttributeValue] = useState<Record<string, string>>({});

  const handleSaveCompany = () => {
    updateCompanySettings(localCompanySettings);
    toast({
      title: 'Settings saved',
      description: 'Company settings have been updated successfully.',
    });
  };

  const handleSaveRental = () => {
    updateRentalSettings(localRentalSettings);
    toast({
      title: 'Settings saved',
      description: 'Rental settings have been updated successfully.',
    });
  };

  const handleAddAttributeValue = (attrId: string) => {
    const value = newAttributeValue[attrId]?.trim();
    if (!value) return;

    setLocalAttributes(prev => prev.map(attr => {
      if (attr.id === attrId && !attr.values.includes(value)) {
        return { ...attr, values: [...attr.values, value] };
      }
      return attr;
    }));
    setNewAttributeValue(prev => ({ ...prev, [attrId]: '' }));
  };

  const handleRemoveAttributeValue = (attrId: string, value: string) => {
    setLocalAttributes(prev => prev.map(attr => {
      if (attr.id === attrId) {
        return { ...attr, values: attr.values.filter(v => v !== value) };
      }
      return attr;
    }));
  };

  const handleSaveAttributes = () => {
    updateAttributes(localAttributes);
    toast({
      title: 'Settings saved',
      description: 'Product attributes have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your system configuration</p>
      </div>

      <Tabs defaultValue={user?.role === 'admin' ? "company" : "profile"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          {user?.role === 'admin' && (
            <>
              <TabsTrigger value="company" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Company</span>
              </TabsTrigger>
              <TabsTrigger value="rental" className="gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Rental</span>
              </TabsTrigger>
              <TabsTrigger value="attributes" className="gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Attributes</span>
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Manage your company details and tax settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={localCompanySettings.name}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={localCompanySettings.gstin}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, gstin: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={localCompanySettings.address}
                  onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={localCompanySettings.phone}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={localCompanySettings.email}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={localCompanySettings.taxRate}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit">Security Deposit (%)</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    value={localCompanySettings.securityDepositPercent}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, securityDepositPercent: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFee">Late Fee (₹/day)</Label>
                  <Input
                    id="lateFee"
                    type="number"
                    value={localCompanySettings.lateFeePerDay}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, lateFeePerDay: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveCompany}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rental Settings */}
        <TabsContent value="rental">
          <Card>
            <CardHeader>
              <CardTitle>Rental Configuration</CardTitle>
              <CardDescription>Configure rental periods and booking rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Rental Periods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Hourly Rentals</Label>
                      <p className="text-sm text-muted-foreground">Allow customers to rent by the hour</p>
                    </div>
                    <Switch
                      checked={localRentalSettings.allowHourly}
                      onCheckedChange={(checked) => setLocalRentalSettings(prev => ({ ...prev, allowHourly: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily Rentals</Label>
                      <p className="text-sm text-muted-foreground">Allow customers to rent by the day</p>
                    </div>
                    <Switch
                      checked={localRentalSettings.allowDaily}
                      onCheckedChange={(checked) => setLocalRentalSettings(prev => ({ ...prev, allowDaily: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Rentals</Label>
                      <p className="text-sm text-muted-foreground">Allow customers to rent by the week</p>
                    </div>
                    <Switch
                      checked={localRentalSettings.allowWeekly}
                      onCheckedChange={(checked) => setLocalRentalSettings(prev => ({ ...prev, allowWeekly: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="minHours">Minimum Rental Hours</Label>
                  <Input
                    id="minHours"
                    type="number"
                    value={localRentalSettings.minRentalHours}
                    onChange={(e) => setLocalRentalSettings(prev => ({ ...prev, minRentalHours: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDays">Maximum Rental Days</Label>
                  <Input
                    id="maxDays"
                    type="number"
                    value={localRentalSettings.maxRentalDays}
                    onChange={(e) => setLocalRentalSettings(prev => ({ ...prev, maxRentalDays: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advanceBooking">Advance Booking Days</Label>
                  <Input
                    id="advanceBooking"
                    type="number"
                    value={localRentalSettings.advanceBookingDays}
                    onChange={(e) => setLocalRentalSettings(prev => ({ ...prev, advanceBookingDays: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveRental}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Attributes */}
        <TabsContent value="attributes">
          <Card>
            <CardHeader>
              <CardTitle>Product Attributes</CardTitle>
              <CardDescription>Manage configurable attributes for products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {localAttributes.map((attr) => (
                <div key={attr.id} className="space-y-3">
                  <Label>{attr.name}</Label>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((value) => (
                      <Badge key={value} variant="secondary" className="gap-1">
                        {value}
                        <button
                          onClick={() => handleRemoveAttributeValue(attr.id, value)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add ${attr.name.toLowerCase()}`}
                      value={newAttributeValue[attr.id] || ''}
                      onChange={(e) => setNewAttributeValue(prev => ({ ...prev, [attr.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAttributeValue(attr.id)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleAddAttributeValue(attr.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator />
                </div>
              ))}

              <Button onClick={handleSaveAttributes}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>View and manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={user?.name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={user?.companyName || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input value={user?.gstin || ''} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div>
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                To update your profile information, please contact support.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
