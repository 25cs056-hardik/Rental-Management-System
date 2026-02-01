import { useAuth } from '@/contexts/AuthContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useData } from '@/contexts/DataContext';
import {
  getDashboardMetrics,
  getRevenueChartData,
  getTopProductsData,
  formatCurrency,
  formatDate
} from '@/data/mockData';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { orders, products } = useData();
  const metrics = getDashboardMetrics(user?.role);
  const revenueData = getRevenueChartData(user?.role);
  const topProducts = getTopProductsData(user?.role);

  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'active');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          {user?.role === 'vendor' ? `Vendor Portal` : `Platform Overview`}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's what's happening with {user?.role === 'vendor' ? 'your shop' : 'the platform'} today.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Active Rentals"
          value={metrics.activeRentals}
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          icon={Package}
        />
        <MetricCard
          title={user?.role === 'vendor' ? "My Customers" : "Total Customers"}
          value={metrics.totalCustomers}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Pending Returns"
          value={metrics.pendingReturns}
          icon={Clock}
        />
        <MetricCard
          title="Overdue"
          value={metrics.overdueReturns}
          icon={AlertTriangle}
          className={metrics.overdueReturns > 0 ? 'border-destructive' : ''}
        />
      </div>

      {/* Vendor Quick Actions */}
      {user?.role === 'vendor' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/products'}>
              <Package className="h-6 w-6" />
              Manage Products
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/orders'}>
              <FileText className="h-6 w-6" />
              View Orders
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/quotations'}>
              <FileText className="h-6 w-6" />
              Create Quote
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/reports'}>
              <BarChart3 className="h-6 w-6" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {user?.role === 'vendor' ? "Top Rented Items" : "Top Rented Products"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => {
                const available = product.quantityOnHand - product.quantityWithCustomer;
                const status = available <= 0 ? 'out' : available <= 2 ? 'low' : 'available';
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {available} available / {product.quantityOnHand} total
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Returns Alert */}
      {pendingOrders.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Upcoming Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg bg-warning/10 p-3"
                >
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      Order {order.id} - {order.lines.length} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      Return: {order.returnDate ? formatDate(order.returnDate) : 'N/A'}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
