import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Receipt,
  Settings,
  Users,
  Store,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  BarChart3,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { NotificationPopover } from '@/components/notifications/NotificationPopover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ('admin' | 'vendor' | 'customer')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'vendor'] },
  { label: 'Products', href: '/products', icon: Package, roles: ['admin', 'vendor'] },
  { label: 'Orders', href: '/orders', icon: FileText, roles: ['admin', 'vendor'] },
  { label: 'Quotations', href: '/quotations', icon: FileText, roles: ['admin', 'vendor'] },
  { label: 'Invoices', href: '/invoices', icon: Receipt, roles: ['admin', 'vendor', 'customer'] },
  { label: 'Customers', href: '/customers', icon: Users, roles: ['admin'] },
  { label: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'vendor'] },
  { label: 'Shop', href: '/shop', icon: Store, roles: ['customer'] },
  { label: 'My Orders', href: '/my-orders', icon: FileText, roles: ['customer'] },
  { label: 'Vendor', href: '/vendor', icon: Building2, roles: ['customer'] },
  { label: 'Admin', href: '/admin', icon: ShieldCheck, roles: ['customer', 'vendor'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'vendor', 'customer'] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const { getItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleRoleSwitch = async (role: 'admin' | 'vendor' | 'customer') => {
    await switchRole(role);
    if (role === 'customer') {
      navigate('/shop');
    } else {
      navigate('/dashboard');
    }
  };

  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = getItemCount();

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Package className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-semibold">RentFlow</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs capitalize text-sidebar-foreground/70">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold capitalize">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Cart for customers */}
            {user?.role === 'customer' && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Notifications */}
            <NotificationPopover />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>

                {/* Role Switcher Submenu for Demo */}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Switch Role (Demo)
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => handleRoleSwitch('admin')}
                  disabled={user?.role === 'admin'}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin
                  {user?.role === 'admin' && <span className="ml-auto text-xs">Current</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleRoleSwitch('vendor')}
                  disabled={user?.role === 'vendor'}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Vendor
                  {user?.role === 'vendor' && <span className="ml-auto text-xs">Current</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleRoleSwitch('customer')}
                  disabled={user?.role === 'customer'}
                >
                  <User className="mr-2 h-4 w-4" />
                  Customer
                  {user?.role === 'customer' && <span className="ml-auto text-xs">Current</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
