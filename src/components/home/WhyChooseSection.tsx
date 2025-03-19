
import React from 'react';
import { Palette, ShoppingBag, Megaphone, BookOpen, Users } from 'lucide-react';

const WhyChooseSection: React.FC = () => {
  const benefits = [
    {
      icon: <Palette className="h-8 w-8 text-brand-green" />,
      title: "Personalized Portfolios",
      description: "Complete control over your online art portfolio with interactive templates"
    },
    {
      icon: <ShoppingBag className="h-8 w-8 text-brand-blue" />,
      title: "Seamless Art Sales",
      description: "Sell your physical artwork directly to collectors without platform fees"
    },
    {
      icon: <Megaphone className="h-8 w-8 text-brand-red" />,
      title: "Open Call Applications",
      description: "Discover and apply to exhibitions, grants, and art opportunities"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      title: "Education & Resources",
      description: "Access guides and tutorials about digital art and Web3 technologies"
    },
    {
      icon: <Users className="h-8 w-8 text-amber-500" />,
      title: "Artist Community",
      description: "Connect with other artists, share work, and grow your network"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-3 animate-fade-up">
            Why Artists Choose MyPalette
          </h2>
          <p className="text-muted-foreground animate-fade-up animate-delay-100">
            A complete platform designed for artists to showcase, sell, and advance their creative careers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="relative group bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-medium mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
              
              {/* Subtle background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
