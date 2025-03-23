
import React from 'react';
import { Palette, ShoppingBag, Megaphone, BookOpen, Users } from 'lucide-react';
import { GlareCard } from '@/components/ui/glare-card';
import { motion } from 'framer-motion';

const WhyChooseSection: React.FC = () => {
  const benefits = [
    {
      icon: <Palette className="h-8 w-8 text-brand-green" />,
      title: "Personalized Portfolios",
      description: "Complete control over your online art portfolio with interactive templates",
      color: "text-brand-green"
    },
    {
      icon: <ShoppingBag className="h-8 w-8 text-brand-blue" />,
      title: "Seamless Art Sales",
      description: "Sell your physical artwork directly to collectors without platform fees",
      color: "text-brand-blue"
    },
    {
      icon: <Megaphone className="h-8 w-8 text-brand-red" />,
      title: "Open Call Applications",
      description: "Discover and apply to exhibitions, grants, and art opportunities",
      color: "text-brand-red"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      title: "Education & Resources",
      description: "Access guides and tutorials about digital art and Web3 technologies",
      color: "text-purple-500"
    },
    {
      icon: <Users className="h-8 w-8 text-amber-500" />,
      title: "Artist Community",
      description: "Connect with other artists, share work, and grow your network",
      color: "text-amber-500"
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white opacity-60 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Why Artists Choose MyPalette
          </h2>
          <p className="text-muted-foreground">
            A complete platform designed for artists to showcase, sell, and advance their creative careers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlareCard 
                className="bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 h-full"
                iconColor={benefit.color}
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-medium mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </GlareCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
