import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/types';
import { formatCurrency, productCategories } from '@/data/mockData';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, attributes } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    costPrice: 0,
    salesPrice: 0,
    hourlyPrice: 0,
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    quantityOnHand: 0,
    isRentable: true,
    isPublished: true,
    attributes: {} as Record<string, string>,
  });

  const columns = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <img src={product.images[0]} alt="" className="h-8 w-8 object-cover rounded" />
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rentalPrices',
      header: 'Rental Prices',
      render: (product: Product) => (
        <div className="text-sm">
          <p>H: {formatCurrency(product.rentalPrices.hourly)}</p>
          <p>D: {formatCurrency(product.rentalPrices.daily)}</p>
          <p>W: {formatCurrency(product.rentalPrices.weekly)}</p>
          <p>M: {formatCurrency(product.rentalPrices.monthly)}</p>
          <p>Y: {formatCurrency(product.rentalPrices.yearly)}</p>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product: Product) => {
        const available = product.quantityOnHand - product.quantityWithCustomer;
        return (
          <div>
            <p className="font-medium">{available} available</p>
            <p className="text-xs text-muted-foreground">
              {product.quantityWithCustomer} rented / {product.quantityOnHand} total
            </p>
          </div>
        );
      },
    },
    {
      key: 'isRentable',
      header: 'Rentable',
      render: (product: Product) => (
        <Switch
          checked={product.isRentable}
          onCheckedChange={(checked) => updateProduct(product.id, { isRentable: checked })}
        />
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={product.isPublished ? 'published' : 'unpublished'} />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              updateProduct(product.id, { isPublished: !product.isPublished });
            }}
          >
            {product.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(product);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              deleteProduct(product.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      costPrice: product.costPrice,
      salesPrice: product.salesPrice,
      hourlyPrice: product.rentalPrices.hourly,
      dailyPrice: product.rentalPrices.daily,
      weeklyPrice: product.rentalPrices.weekly,
      monthlyPrice: product.rentalPrices.monthly,
      yearlyPrice: product.rentalPrices.yearly,
      quantityOnHand: product.quantityOnHand,
      isRentable: product.isRentable,
      isPublished: product.isPublished,
      attributes: product.attributes,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      costPrice: 0,
      salesPrice: 0,
      hourlyPrice: 0,
      dailyPrice: 0,
      weeklyPrice: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      quantityOnHand: 0,
      isRentable: true,
      isPublished: true,
      attributes: {},
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      images: ['/placeholder.svg'],
      costPrice: formData.costPrice,
      salesPrice: formData.salesPrice,
      rentalPrices: {
        hourly: formData.hourlyPrice,
        daily: formData.dailyPrice,
        weekly: formData.weeklyPrice,
        monthly: formData.monthlyPrice,
        yearly: formData.yearlyPrice,
      },
      quantityOnHand: formData.quantityOnHand,
      quantityWithCustomer: 0,
      isRentable: formData.isRentable,
      isPublished: formData.isPublished,
      attributes: formData.attributes,
      variants: [],
      vendorId: 'vendor-1',
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your rental inventory</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={products}
            columns={columns}
            searchKeys={['name', 'category']}
            emptyMessage="No products found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (₹)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesPrice">Sales Price (₹)</Label>
                <Input
                  id="salesPrice"
                  type="number"
                  value={formData.salesPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, salesPrice: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rental Prices</Label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="hourlyPrice" className="text-xs">Hourly (₹)</Label>
                  <Input
                    id="hourlyPrice"
                    type="number"
                    value={formData.hourlyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyPrice: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyPrice" className="text-xs">Daily (₹)</Label>
                  <Input
                    id="dailyPrice"
                    type="number"
                    value={formData.dailyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, dailyPrice: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyPrice" className="text-xs">Weekly (₹)</Label>
                  <Input
                    id="weeklyPrice"
                    type="number"
                    value={formData.weeklyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, weeklyPrice: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice" className="text-xs">Monthly (₹)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearlyPrice" className="text-xs">Yearly (₹)</Label>
                  <Input
                    id="yearlyPrice"
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearlyPrice: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity on Hand</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantityOnHand}
                onChange={(e) => setFormData(prev => ({ ...prev, quantityOnHand: Number(e.target.value) }))}
              />
            </div>

            {/* Attributes */}
            <div className="space-y-2">
              <Label>Product Attributes</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {attributes.map((attr) => (
                  <div key={attr.id} className="space-y-2">
                    <Label htmlFor={attr.id} className="text-xs">{attr.name}</Label>
                    <Select
                      value={formData.attributes[attr.name] || ''}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        attributes: { ...prev.attributes, [attr.name]: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${attr.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {attr.values.map((val) => (
                          <SelectItem key={val} value={val}>{val}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isRentable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRentable: checked }))}
                />
                <Label>Rentable</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                />
                <Label>Published</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? 'Update' : 'Create'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
