import Layout from "@/components/layout/layout";
import { Shield, Target, Users, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <Layout>
      <div className="bg-card py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white">About JustDrops.xyz</h1>
          <div className="w-24 h-1 bg-accent mx-auto mt-4"></div>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            Premium tactical gear and equipment for law enforcement, security professionals, and enthusiasts.
          </p>
        </div>
      </div>

      <div className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">Our Story</h2>
              <div className="w-16 h-1 bg-accent mt-4 mb-6"></div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded by professionals with extensive experience in law enforcement and tactical operations, 
                  JustDrops.xyz was established to provide high-quality tactical gear and equipment to those who
                  depend on reliable tools for their safety and performance.
                </p>
                <p>
                  Our journey began with a simple mission: to offer premium-grade tactical equipment that meets
                  the rigorous demands of professionals in the field. We specialize in Leupold Mark 4 optics and 
                  other essential tactical gear trusted by law enforcement agencies and security professionals worldwide.
                </p>
                <p>
                  What started as a small operation has grown into a trusted source for tactical equipment, 
                  built on a foundation of expertise, quality, and customer satisfaction. We personally test and 
                  evaluate each product in our catalog to ensure it meets our exacting standards.
                </p>
              </div>
            </div>
            <div className="relative h-80 md:h-full">
              <img 
                src="https://images.unsplash.com/photo-1551754655-cd27e38d2076?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                alt="Tactical equipment" 
                className="rounded-lg shadow-xl object-cover w-full h-full"
              />
            </div>
          </div>
          
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center">Our Values</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 mb-12"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card rounded-xl p-6 shadow-lg text-center">
                <div className="bg-accent/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <Quality className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">Quality</h3>
                <p className="mt-2 text-muted-foreground">
                  We never compromise on the quality of our products. Every item in our inventory is rigorously tested and meets industry standards.
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-lg text-center">
                <div className="bg-accent/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <Reliability className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">Reliability</h3>
                <p className="mt-2 text-muted-foreground">
                  Our customers depend on their equipment in critical situations. We only offer products proven to perform consistently under pressure.
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-lg text-center">
                <div className="bg-accent/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <Expertise className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">Expertise</h3>
                <p className="mt-2 text-muted-foreground">
                  With years of professional experience, our team provides informed recommendations and support for all your tactical needs.
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-lg text-center">
                <div className="bg-accent/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <Integrity className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">Integrity</h3>
                <p className="mt-2 text-muted-foreground">
                  We believe in honest business practices, transparent policies, and building lasting relationships with our customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Our Commitment</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            At JustDrops.xyz, we're committed to providing the highest quality tactical gear and exceptional customer service. 
            We stand behind every product we sell and aim to exceed the expectations of the professionals who rely on our equipment.
          </p>
          <div className="mt-10">
            <Link href="/products">
              <Button className="btn-primary">Explore Our Products</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="ml-4 btn-secondary">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Custom icons
function Quality(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Award {...props} />
  );
}

function Reliability(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Shield {...props} />
  );
}

function Expertise(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Target {...props} />
  );
}

function Integrity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <Users {...props} />
  );
}
