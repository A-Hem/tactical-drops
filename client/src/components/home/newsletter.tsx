import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-secondary rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-white">Join Our Newsletter</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Stay updated with our latest products, exclusive deals, and tactical equipment guides.
              </p>

              <form className="mt-8" onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-card text-white"
                    required
                  />
                  <Button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </Button>
                </div>
                <div className="mt-4 flex items-start space-x-2">
                  <Checkbox 
                    id="privacy" 
                    checked={privacyAgreed}
                    onCheckedChange={(checked) => setPrivacyAgreed(checked === true)}
                  />
                  <Label htmlFor="privacy" className="text-muted-foreground text-sm">
                    I agree to receive marketing emails and agree to the{" "}
                    <a href="#" className="text-accent hover:underline">
                      privacy policy
                    </a>.
                  </Label>
                </div>
              </form>
            </div>
            <div className="hidden lg:block relative">
              <img
                src="https://images.unsplash.com/photo-1550170352-cc27a9e3153b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Tactical equipment display"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
