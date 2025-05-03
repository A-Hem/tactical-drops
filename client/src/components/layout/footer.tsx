import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!privacyAgreed) {
      toast({
        title: "Error",
        description: "Please agree to our privacy policy",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/newsletter", { email });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "You have been subscribed to our newsletter",
          variant: "default",
        });
        setEmail("");
        setPrivacyAgreed(false);
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to subscribe",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-card pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center">
              <span className="text-accent font-bold text-2xl">
                JustDrops<span className="text-white">.xyz</span>
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground">
              Premium tactical gear and equipment for law enforcement, security professionals, and enthusiasts.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products/category/rifle-scopes" className="text-muted-foreground hover:text-accent transition-colors">
                  Rifle Scopes
                </Link>
              </li>
              <li>
                <Link href="/products/category/tactical-gear" className="text-muted-foreground hover:text-accent transition-colors">
                  Tactical Gear
                </Link>
              </li>
              <li>
                <Link href="/products/category/law-enforcement" className="text-muted-foreground hover:text-accent transition-colors">
                  Law Enforcement
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-accent transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-muted-foreground hover:text-accent transition-colors">
                  Featured Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="text-accent mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  123 Tactical Way, Suite 456<br />Phoenix, AZ 85001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="text-accent mr-3 h-5 w-5 flex-shrink-0" />
                <a
                  href="tel:+18005551234"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  (800) 555-1234
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="text-accent mr-3 h-5 w-5 flex-shrink-0" />
                <a
                  href="mailto:info@justdrops.xyz"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  info@justdrops.xyz
                </a>
              </li>
              <li className="flex items-center">
                <Clock className="text-accent mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-muted-foreground">Mon-Fri: 9AM-5PM EST</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} JustDrops.xyz. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="h-8 w-auto opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
              </svg>
            </div>
            <div className="h-6 w-auto opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div className="h-6 w-auto opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <path d="M6 15h.01M8 15h.01M10 15h.01" />
              </svg>
            </div>
            <div className="h-6 w-auto opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="h-6 w-auto opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
