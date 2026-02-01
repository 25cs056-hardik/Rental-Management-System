import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminApplicationPage() {
  const { user, applyAdminAccess } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role === 'admin') {
    navigate('/dashboard');
    return null;
  }

  const handleRequestAccess = async () => {
    if (!window.confirm("Are you sure you want to request Admin access?\n\nThis will immediately change your role to Admin for this demo session.")) {
      return;
    }
    setError('');
    setIsLoading(true);
    const result = await applyAdminAccess();
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to request access');
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Admin Section</CardTitle>
              <CardDescription>
                Request access to the admin section to manage customers, reports, and platform settings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <p className="text-sm text-muted-foreground">
            As an admin you will be able to view all customers, manage platform-wide reports, and access admin-only settings.
          </p>
          <Button onClick={handleRequestAccess} className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Confirm and request admin access'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <b>Note:</b> In this demo, access is granted immediately. In production, this would require approval.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
