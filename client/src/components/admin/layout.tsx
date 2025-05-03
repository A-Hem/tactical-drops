import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FileText,
  Settings,
  Users,
  CreditCard,
  Truck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <Button
        onClick={onClick}
        variant={active ? 'default' : 'ghost'}
        className={`w-full justify-start ${active ? 'bg-accent' : ''}`}
      >
        {icon}
        <span className="ml-2">{label}</span>
        {active && <ChevronRight className="ml-auto h-4 w-4" />}
      </Button>
    </Link>
  );
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current authenticated user
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Navigation items
  const navItems = [
    { href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { href: '/admin/orders', icon: <CreditCard className="h-5 w-5" />, label: 'Orders' },
    { href: '/admin/orders/process', icon: <Package className="h-5 w-5" />, label: 'Process Orders' },
    { href: '/admin/inventory', icon: <ShoppingBag className="h-5 w-5" />, label: 'Inventory' },
    { href: '/admin/products', icon: <FileText className="h-5 w-5" />, label: 'Products' },
    { href: '/admin/shipping/create-label', icon: <Truck className="h-5 w-5" />, label: 'Shipping' },
    { href: '/admin/users', icon: <Users className="h-5 w-5" />, label: 'Users' },
    { href: '/admin/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!userData) {
    window.location.href = '/admin/login';
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-col border-r min-h-screen fixed">
        <div className="p-4 border-b">
          <Link href="/admin/dashboard">
            <div className="flex items-center space-x-2 font-bold text-xl">
              <ShoppingBag className="h-6 w-6" />
              <span>JustDrops Admin</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={location === item.href}
            />
          ))}
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">{userData?.username}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-1" />
                Store
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background z-30 flex items-center px-4">
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" />
                JustDrops Admin
              </SheetTitle>
            </SheetHeader>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={location === item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                />
              ))}
            </nav>
            <div className="p-4 border-t mt-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">{userData?.username}</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/" onClick={() => setIsMobileNavOpen(false)}>
                    <Home className="h-4 w-4 mr-1" />
                    Store
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center mx-auto">
          <ShoppingBag className="h-5 w-5 mr-2" />
          <h1 className="font-bold text-lg">JustDrops Admin</h1>
        </div>
        
        <div className="ml-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-1" />
              Store
            </Link>
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}