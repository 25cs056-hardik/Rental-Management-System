import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { Invoice, InvoiceStatus, PaymentMethod } from '@/types';
import { formatCurrency, formatDate, defaultCompanySettings } from '@/data/mockData';
import { Eye, Download, CreditCard, Printer } from 'lucide-react';
import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InvoicesPage() {
  const { user } = useAuth();
  const { invoices, updateInvoice, companySettings } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const printRef = useRef<HTMLDivElement>(null);

  // Filter invoices for customers
  const displayInvoices = user?.role === 'customer'
    ? invoices.filter(inv => inv.customerId === user.id)
    : invoices;

  const columns = [
    {
      key: 'id',
      header: 'Invoice #',
      sortable: true,
      render: (invoice: Invoice) => (
        <span className="font-mono text-sm">{invoice.id}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'total',
      header: 'Amount',
      sortable: true,
      render: (invoice: Invoice) => formatCurrency(invoice.total),
    },
    {
      key: 'amountDue',
      header: 'Due',
      render: (invoice: Invoice) => (
        <span className={invoice.amountDue > 0 ? 'text-warning font-medium' : 'text-success'}>
          {formatCurrency(invoice.amountDue)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (invoice: Invoice) => formatDate(invoice.dueDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (invoice: Invoice) => <StatusBadge status={invoice.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (invoice: Invoice) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInvoice(invoice);
              setIsDetailOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {invoice.amountDue > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInvoice(invoice);
                setPaymentAmount(invoice.amountDue);
                setIsPaymentOpen(true);
              }}
            >
              <CreditCard className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handlePayment = () => {
    if (!selectedInvoice) return;

    const newAmountPaid = selectedInvoice.amountPaid + paymentAmount;
    const newAmountDue = selectedInvoice.total - newAmountPaid;
    
    const newStatus: InvoiceStatus = newAmountDue <= 0 ? 'paid' : 'partial';

    updateInvoice(selectedInvoice.id, {
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
      status: newStatus,
      paymentMethod,
      paidAt: newStatus === 'paid' ? new Date() : undefined,
    });

    setIsPaymentOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">View and manage invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
            <p className="text-2xl font-bold">
              {formatCurrency(displayInvoices.reduce((sum, inv) => sum + inv.total, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(displayInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold text-warning">
              {formatCurrency(displayInvoices.reduce((sum, inv) => sum + inv.amountDue, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-destructive">
              {displayInvoices.filter(inv => inv.status === 'overdue').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={displayInvoices}
            columns={columns}
            searchKeys={['id', 'customerName']}
            emptyMessage="No invoices found"
          />
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader className="no-print">
                <DialogTitle className="flex items-center justify-between">
                  <span>Invoice {selectedInvoice.id}</span>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div ref={printRef} className="space-y-6 py-4">
                {/* Company Header */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-bold">{companySettings.name}</h2>
                  <p className="text-sm text-muted-foreground">{companySettings.address}</p>
                  <p className="text-sm text-muted-foreground">GSTIN: {companySettings.gstin}</p>
                  <p className="text-sm text-muted-foreground">
                    {companySettings.phone} | {companySettings.email}
                  </p>
                </div>

                {/* Invoice Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Bill To</p>
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                    <p className="text-sm text-muted-foreground">ID: {selectedInvoice.customerId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.createdAt)}</p>
                    <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Item</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Rate</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-2">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.rentalPeriod} | {formatDate(item.startDate)} - {formatDate(item.endDate)}
                            </p>
                          </td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.pricePerPeriod)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18% GST)</span>
                      <span>{formatCurrency(selectedInvoice.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Deposit</span>
                      <span>{formatCurrency(selectedInvoice.securityDeposit)}</span>
                    </div>
                    {selectedInvoice.lateFee > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>Late Fee</span>
                        <span>{formatCurrency(selectedInvoice.lateFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>Paid</span>
                      <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Balance Due</span>
                      <span className={selectedInvoice.amountDue > 0 ? 'text-warning' : 'text-success'}>
                        {formatCurrency(selectedInvoice.amountDue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between border-t pt-4">
                  <StatusBadge status={selectedInvoice.status} />
                  {selectedInvoice.paidAt && (
                    <p className="text-sm text-muted-foreground">
                      Paid on {formatDate(selectedInvoice.paidAt)} via {selectedInvoice.paymentMethod}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="no-print">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                {selectedInvoice.amountDue > 0 && (
                  <Button onClick={() => {
                    setPaymentAmount(selectedInvoice.amountDue);
                    setIsDetailOpen(false);
                    setIsPaymentOpen(true);
                  }}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Due</span>
                  <span className="font-bold">{formatCurrency(selectedInvoice.amountDue)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  max={selectedInvoice.amountDue}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>
              Pay {formatCurrency(paymentAmount)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
