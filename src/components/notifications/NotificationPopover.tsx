
import { Bell, Check, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

type NotificationType = 'info' | 'warning' | 'success';

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: NotificationType;
}

// Mock data for demonstration
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Welcome to RentFlow',
    description: 'Get started by setting up your profile.',
    date: '2 hours ago',
    read: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'System Maintenance',
    description: 'Scheduled maintenance tonight at 2 AM.',
    date: '5 hours ago',
    read: false,
    type: 'warning',
  },
  {
    id: '3',
    title: 'Order Completed',
    description: 'Order #1234 has been successfully completed.',
    date: '1 day ago',
    read: true,
    type: 'success',
  },
];

export function NotificationPopover() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <p className="text-xs leading-none text-muted-foreground">
              You have {unreadCount} unread messages
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    notifications.map((notification) => (
                    <DropdownMenuItem
                        key={notification.id}
                        className="flex cursor-pointer flex-col items-start gap-1 p-4"
                        onClick={() => markAsRead(notification.id)}
                    >
                        <div className="flex w-full items-start gap-2">
                            <span className="mt-0.5 flex h-2 w-2 shrink-0 translate-y-1 rounded-full bg-primary" 
                                style={{ opacity: notification.read ? 0 : 1 }}
                            />
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">
                                        {notification.title}
                                    </p>
                                    {getIcon(notification.type)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {notification.description}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {notification.date}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuItem>
                    ))
                )}
            </ScrollArea>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
