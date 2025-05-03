import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { imageUrls } from "@/lib/images";

const Hero = () => {
  return (
    <section className="relative bg-card">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Professional Tactical Gear and Equipment
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Premium optics and tactical equipment for law enforcement and security professionals.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#featured">
                <Button className="btn-primary">Shop Now</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="btn-secondary">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-64 sm:h-80 lg:h-96">
            <img
              src={imageUrls.hero}
              alt="Tactical Rifle with Scope"
              className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
