import { cn } from '@/lib/utils';
import { OrderStatus, QuotationStatus, InvoiceStatus } from '@/types';

type StatusType = OrderStatus | QuotationStatus | InvoiceStatus | 'published' | 'unpublished' | 'available' | 'low' | 'out';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Order statuses
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', className: 'bg-info/10 text-info' },
  confirmed: { label: 'Confirmed', className: 'bg-primary/10 text-primary' },
  active: { label: 'Active', className: 'bg-success/10 text-success' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
  
  // Quotation statuses
  accepted: { label: 'Accepted', className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
  expired: { label: 'Expired', className: 'bg-warning/10 text-warning' },
  
  // Invoice statuses
  paid: { label: 'Paid', className: 'bg-success/10 text-success' },
  partial: { label: 'Partial', className: 'bg-warning/10 text-warning' },
  overdue: { label: 'Overdue', className: 'bg-destructive/10 text-destructive' },
  
  // Product statuses
  published: { label: 'Published', className: 'bg-success/10 text-success' },
  unpublished: { label: 'Unpublished', className: 'bg-muted text-muted-foreground' },
  
  // Stock statuses
  available: { label: 'In Stock', className: 'bg-success/10 text-success' },
  low: { label: 'Low Stock', className: 'bg-warning/10 text-warning' },
  out: { label: 'Out of Stock', className: 'bg-destructive/10 text-destructive' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
