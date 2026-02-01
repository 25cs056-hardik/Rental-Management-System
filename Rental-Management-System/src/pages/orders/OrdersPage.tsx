import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
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
import { RentalOrder, OrderStatus } from '@/types';
import { formatCurrency, formatDate } from '@/data/mockData';
import { Eye, FileText, Truck, RotateCcw, Receipt } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['confirmed', 'cancelled'],
  confirmed: ['active', 'cancelled'],
  active: ['completed'],
  completed: [],
  cancelled: [],
};

export default function OrdersPage() {
  const { orders, updateOrder, addInvoice, companySettings } = useData();
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'lines',
      header: 'Items',
      render: (order: RentalOrder) => (
        <span>{order.lines.length} item(s)</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (order: RentalOrder) => formatCurrency(order.total),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (order: RentalOrder) => formatDate(order.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: RentalOrder) => <StatusBadge status={order.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: RentalOrder) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
              setIsDetailOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrder(orderId, { status: newStatus });
    
    // Auto-create invoice when order becomes active
    if (newStatus === 'active') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        
        addInvoice({
          orderId: order.id,
          customerId: order.customerId,
          customerName: order.customerName,
          items: order.lines,
          subtotal: order.subtotal,
          tax: order.tax,
          securityDeposit: order.securityDeposit,
          lateFee: 0,
          total: order.total + order.securityDeposit,
          amountPaid: order.securityDeposit,
          amountDue: order.total,
          status: 'partial',
          dueDate,
        });
      }
    }
  };

  const handlePickup = (order: RentalOrder) => {
    updateOrder(order.id, { 
      status: 'active',
      pickupDate: new Date()
    });
  };

  const handleReturn = (order: RentalOrder) => {
    const actualReturn = new Date();
    const scheduledReturn = order.returnDate ? new Date(order.returnDate) : actualReturn;
    
    let lateFee = 0;
    if (actualReturn > scheduledReturn) {
      const daysLate = Math.ceil((actualReturn.getTime() - scheduledReturn.getTime()) / (1000 * 60 * 60 * 24));
      lateFee = daysLate * companySettings.lateFeePerDay;
    }
    
    updateOrder(order.id, { 
      status: 'completed',
      actualReturnDate: actualReturn,
      lateFee
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Rental Orders</h1>
        <p className="text-muted-foreground">Manage rental orders and track their status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(['draft', 'confirmed', 'active', 'completed'] as OrderStatus[]).map((status) => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground capitalize">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={orders}
            columns={columns}
            searchKeys={['id', 'customerName']}
            emptyMessage="No orders found"
          />
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order {selectedOrder.id}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  {statusFlow[selectedOrder.status].length > 0 && (
                    <Select
                      value=""
                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value as OrderStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusFlow[selectedOrder.status].map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Customer Info */}
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <p className="text-sm">{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">ID: {selectedOrder.customerId}</p>
                </div>

                {/* Order Lines */}
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.lines.map((line) => (
                      <div key={line.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div>
                          <p className="font-medium">{line.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {line.quantity}x • {line.rentalPeriod} • {formatDate(line.startDate)} - {formatDate(line.endDate)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(line.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18%)</span>
                      <span>{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Deposit</span>
                      <span>{formatCurrency(selectedOrder.securityDeposit)}</span>
                    </div>
                    {selectedOrder.lateFee > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>Late Fee</span>
                        <span>{formatCurrency(selectedOrder.lateFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total + selectedOrder.securityDeposit + selectedOrder.lateFee)}</span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Scheduled Pickup</p>
                    <p className="font-medium">{selectedOrder.pickupDate ? formatDate(selectedOrder.pickupDate) : 'Not set'}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Scheduled Return</p>
                    <p className="font-medium">{selectedOrder.returnDate ? formatDate(selectedOrder.returnDate) : 'Not set'}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedOrder.status === 'confirmed' && (
                  <Button onClick={() => handlePickup(selectedOrder)}>
                    <Truck className="mr-2 h-4 w-4" />
                    Process Pickup
                  </Button>
                )}
                {selectedOrder.status === 'active' && (
                  <Button onClick={() => handleReturn(selectedOrder)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Process Return
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
