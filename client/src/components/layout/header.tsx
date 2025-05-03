import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Menu, ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const [location] = useLocation();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileProductsMenu, setShowMobileProductsMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-accent font-bold text-2xl">
                JustDrops<span className="text-white">.xyz</span>
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-accent">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-card border-r border-border w-72">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-accent font-bold text-2xl">
                    JustDrops<span className="text-white">.xyz</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-2">
                  <SheetClose asChild>
                    <Link href="/" className="block px-3 py-2 text-white font-medium hover:text-accent">
                      Home
                    </Link>
                  </SheetClose>
                  
                  <div>
                    <button 
                      className="w-full text-left px-3 py-2 text-white font-medium hover:text-accent flex justify-between items-center"
                      onClick={() => setShowMobileProductsMenu(!showMobileProductsMenu)}
                    >
                      Products 
                      <ChevronDown className={`h-4 w-4 transition-transform ${showMobileProductsMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showMobileProductsMenu && (
                      <div className="pl-4">
                        <SheetClose asChild>
                          <Link href="/products/category/rifle-scopes" className="block px-3 py-2 text-foreground/70 hover:text-accent">
                            Rifle Scopes
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/products/category/tactical-gear" className="block px-3 py-2 text-foreground/70 hover:text-accent">
                            Tactical Gear
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/products/category/law-enforcement" className="block px-3 py-2 text-foreground/70 hover:text-accent">
                            Law Enforcement
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                  
                  <SheetClose asChild>
                    <Link href="/about" className="block px-3 py-2 text-white font-medium hover:text-accent">
                      About
                    </Link>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Link href="/contact" className="block px-3 py-2 text-white font-medium hover:text-accent">
                      Contact
                    </Link>
                  </SheetClose>
                  
                  <div className="pt-4">
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        className="bg-secondary text-white w-full pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button 
                        type="submit" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`text-white hover:text-accent font-medium ${location === '/' ? 'text-accent' : ''}`}
            >
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center text-white hover:text-accent font-medium ${location.includes('/products') ? 'text-accent' : ''}`}>
                Products <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-secondary border-border">
                <DropdownMenuItem asChild>
                  <Link href="/products/category/rifle-scopes" className="cursor-pointer text-foreground/70 hover:text-accent focus:text-accent">
                    Rifle Scopes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/category/tactical-gear" className="cursor-pointer text-foreground/70 hover:text-accent focus:text-accent">
                    Tactical Gear
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/category/law-enforcement" className="cursor-pointer text-foreground/70 hover:text-accent focus:text-accent">
                    Law Enforcement
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products" className="cursor-pointer text-foreground/70 hover:text-accent focus:text-accent">
                    All Products
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link 
              href="/about" 
              className={`text-white hover:text-accent font-medium ${location === '/about' ? 'text-accent' : ''}`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-white hover:text-accent font-medium ${location === '/contact' ? 'text-accent' : ''}`}
            >
              Contact
            </Link>
          </nav>

          {/* Search & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="bg-secondary text-white px-4 py-2 rounded-lg w-64 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-white hover:text-accent">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-accent text-primary px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Cart Button */}
          <div className="md:hidden">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-white hover:text-accent">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-accent text-primary px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
