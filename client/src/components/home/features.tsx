import { Truck, ShieldCheck, Medal, Headset } from "lucide-react";

const Features = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Truck className="text-accent text-2xl h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Fast Shipping</h3>
            <p className="mt-2 text-muted-foreground">
              Orders ship within 24-48 hours with tracking provided
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="text-accent text-2xl h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Secure Payments</h3>
            <p className="mt-2 text-muted-foreground">
              Secure checkout with Square payment processing
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Medal className="text-accent text-2xl h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Quality Guarantee</h3>
            <p className="mt-2 text-muted-foreground">
              All products tested and verified for quality
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Headset className="text-accent text-2xl h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Expert Support</h3>
            <p className="mt-2 text-muted-foreground">
              Professional assistance for product selection and use
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
