import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  FileText, 
  MailOpen, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated) {
            setUser(data.user);
          } else {
            setLocation('/admin/login');
          }
        } else {
          setLocation('/admin/login');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'There was a problem checking your login status.',
        });
        setLocation('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await apiRequest('/api/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Logout Successful',
          description: 'You have been logged out successfully.',
        });
        setLocation('/admin/login');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Error',
        description: 'There was a problem logging out.',
      });
    }
  };

  // Navigation items
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: <LayoutDashboard className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Products', 
      path: '/admin/products', 
      icon: <ShoppingBag className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Categories', 
      path: '/admin/categories', 
      icon: <Tag className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Blog Posts', 
      path: '/admin/blog/posts', 
      icon: <FileText className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Blog Categories', 
      path: '/admin/blog/categories', 
      icon: <Tag className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Messages', 
      path: '/admin/messages', 
      icon: <MailOpen className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Users', 
      path: '/admin/users', 
      icon: <Users className="h-4 w-4 mr-2" /> 
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu toggle */}
      {isMobile && (
        <div className="fixed top-0 right-0 p-4 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setNavOpen(!navOpen)}
            className="bg-white shadow-md rounded-full"
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-white ${isMobile 
          ? navOpen 
            ? 'fixed inset-y-0 left-0 w-60 z-40 shadow-lg transform translate-x-0 transition-transform duration-200 ease-in-out' 
            : 'fixed inset-y-0 left-0 w-60 z-40 shadow-lg transform -translate-x-full transition-transform duration-200 ease-in-out'
          : 'w-60 border-r'}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">JustDrops Admin</h1>
          </div>
          
          <ScrollArea className="flex-1">
            <nav className="px-2 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Button
                      variant={location === item.path ? "secondary" : "ghost"}
                      className={`w-full justify-start ${location === item.path ? 'bg-gray-100' : ''}`}
                      onClick={() => {
                        setLocation(item.path);
                        if (isMobile) setNavOpen(false);
                      }}
                    >
                      {item.icon}
                      {item.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className={`flex-1 ${isMobile && navOpen ? 'blur-sm' : ''}`}>
        <header className="bg-white border-b p-4">
          <h1 className="text-xl font-bold">{title}</h1>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}