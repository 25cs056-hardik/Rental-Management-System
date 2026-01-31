import { useData } from '@/contexts/DataContext';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Quotation, QuotationStatus } from '@/types';
import { formatCurrency, formatDate } from '@/data/mockData';
import { Eye, Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function QuotationsPage() {
  const { quotations, updateQuotation, convertQuotationToOrder } = useData();
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const columns = [
    {
      key: 'id',
      header: 'Quote #',
      sortable: true,
      render: (quotation: Quotation) => (
        <span className="font-mono text-sm">{quotation.id}</span>
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
      render: (quotation: Quotation) => (
        <span>{quotation.lines.length} item(s)</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (quotation: Quotation) => formatCurrency(quotation.total),
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      sortable: true,
      render: (quotation: Quotation) => formatDate(quotation.validUntil),
    },
    {
      key: 'status',
      header: 'Status',
      render: (quotation: Quotation) => <StatusBadge status={quotation.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (quotation: Quotation) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedQuotation(quotation);
              setIsDetailOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleStatusChange = (quotationId: string, newStatus: QuotationStatus) => {
    if (newStatus === 'accepted') {
      const order = convertQuotationToOrder(quotationId);
      if (order) {
        toast({
          title: 'Order Created',
          description: `Quotation converted to order ${order.id}`,
        });
      }
    } else {
      updateQuotation(quotationId, { status: newStatus });
    }
    setIsDetailOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Quotations</h1>
        <p className="text-muted-foreground">Manage customer quotations and convert to orders</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={quotations}
            columns={columns}
            searchKeys={['id', 'customerName']}
            emptyMessage="No quotations found"
          />
        </CardContent>
      </Card>

      {/* Quotation Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedQuotation && (
            <>
              <DialogHeader>
                <DialogTitle>Quotation {selectedQuotation.id}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedQuotation.status} />
                  <p className="text-sm text-muted-foreground">
                    Valid until: {formatDate(selectedQuotation.validUntil)}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Customer</h4>
                  <p>{selectedQuotation.customerName}</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-4">Items</h4>
                  <div className="space-y-3">
                    {selectedQuotation.lines.map((line) => (
                      <div key={line.id} className="flex justify-between border-b pb-3 last:border-0">
                        <div>
                          <p className="font-medium">{line.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {line.quantity}x • {line.rentalPeriod}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(line.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedQuotation.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18%)</span>
                      <span>{formatCurrency(selectedQuotation.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(selectedQuotation.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedQuotation.status === 'sent' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusChange(selectedQuotation.id, 'rejected')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(selectedQuotation.id, 'accepted')}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept & Create Order
                    </Button>
                  </>
                )}
                {selectedQuotation.status === 'draft' && (
                  <Button
                    onClick={() => handleStatusChange(selectedQuotation.id, 'sent')}
                  >
                    Send to Customer
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
