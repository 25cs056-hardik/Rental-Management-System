import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RentalOrder } from '@/types';
import { formatCurrency, formatDate } from '@/data/mockData';
import { Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { orders } = useData();

  const myOrders = orders.filter(o => o.customerId === user?.id);
  const activeOrders = myOrders.filter(o => o.status === 'active');
  const pendingReturns = activeOrders.filter(o => {
    if (!o.returnDate) return false;
    return new Date(o.returnDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  });

  const columns = [
    {
      key: 'id',
      header: 'Order ID',
      sortable: true,
      render: (order: RentalOrder) => (
        <span className="font-mono text-sm">{order.id}</span>
      ),
    },
    {
      key: 'lines',
      header: 'Items',
      render: (order: RentalOrder) => (
        <div>
          {order.lines.slice(0, 2).map((line, i) => (
            <p key={i} className="text-sm">{line.productName}</p>
          ))}
          {order.lines.length > 2 && (
            <p className="text-xs text-muted-foreground">+{order.lines.length - 2} more</p>
          )}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (order: RentalOrder) => formatCurrency(order.total),
    },
    {
      key: 'returnDate',
      header: 'Return Date',
      render: (order: RentalOrder) => order.returnDate ? formatDate(order.returnDate) : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: RentalOrder) => <StatusBadge status={order.status} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track your rental orders and returns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{myOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {myOrders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={pendingReturns.length > 0 ? 'border-warning' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold">{pendingReturns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Return Reminder */}
      {pendingReturns.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Upcoming Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingReturns.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg bg-background p-3"
                >
                  <div>
                    <p className="font-medium">{order.lines[0]?.productName}</p>
                    <p className="text-sm text-muted-foreground">Order {order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-warning">
                      Return by {order.returnDate ? formatDate(order.returnDate) : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Late fee: ₹500/day
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={myOrders}
            columns={columns}
            searchKeys={['id']}
            emptyMessage="No orders found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
