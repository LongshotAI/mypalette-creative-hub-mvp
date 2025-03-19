
import React from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar } from 'lucide-react';

// Placeholder component for open call cards
const OpenCallCard = ({ 
  title, 
  organization, 
  deadline, 
  category, 
  imageUrl,
  status
}: { 
  title: string; 
  organization: string; 
  deadline: string; 
  category: string; 
  imageUrl: string;
  status: 'open' | 'closed' | 'upcoming';
}) => {
  const statusStyles = {
    open: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    upcoming: "bg-blue-100 text-blue-800"
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
      <div className="aspect-[3/2] bg-gray-100 overflow-hidden relative">
        <div 
          className="w-full h-full bg-gray-200 flex items-center justify-center"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!imageUrl && (
            <span className="text-gray-400">Image placeholder</span>
          )}
        </div>
        <div className={`absolute top-3 left-3 ${statusStyles[status]} px-3 py-1 rounded-full text-xs font-medium uppercase`}>
          {status}
        </div>
      </div>
      
      <div className="p-5">
        <div className="text-xs font-medium text-muted-foreground mb-1">{category}</div>
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">By {organization}</p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Deadline: {deadline}</span>
        </div>
        
        <Button 
          className="w-full rounded-md" 
          variant={status === 'open' ? 'default' : 'outline'}
          disabled={status !== 'open'}
        >
          {status === 'open' ? 'Apply Now' : status === 'upcoming' ? 'Coming Soon' : 'Closed'}
        </Button>
      </div>
    </div>
  );
};

const OpenCalls = () => {
  // Sample data
  const openCalls = [
    { 
      title: "Digital Art Exhibition 2023", 
      organization: "Modern Art Gallery", 
      deadline: "June 30, 2023", 
      category: "Exhibition", 
      imageUrl: "",
      status: "open" as const
    },
    { 
      title: "Emerging Artists Grant Program", 
      organization: "Art Foundation", 
      deadline: "July 15, 2023", 
      category: "Grant", 
      imageUrl: "",
      status: "open" as const
    },
    { 
      title: "NFT Collection Launch", 
      organization: "Crypto Art Collective", 
      deadline: "May 20, 2023", 
      category: "Commission", 
      imageUrl: "",
      status: "closed" as const
    },
    { 
      title: "Public Art Installation", 
      organization: "City Arts Commission", 
      deadline: "August 5, 2023", 
      category: "Public Art", 
      imageUrl: "",
      status: "upcoming" as const
    },
    { 
      title: "Virtual Reality Art Experience", 
      organization: "Tech Arts Initiative", 
      deadline: "July 10, 2023", 
      category: "Digital Art", 
      imageUrl: "",
      status: "open" as const
    },
    { 
      title: "Environmental Art Competition", 
      organization: "Green Planet Foundation", 
      deadline: "August 30, 2023", 
      category: "Competition", 
      imageUrl: "",
      status: "upcoming" as const
    },
  ];

  return (
    <DefaultLayout>
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Open Calls</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover and apply for exhibitions, grants, and creative opportunities
            </p>
            
            {/* Search bar */}
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search opportunities..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          {/* Status Tabs */}
          <Tabs defaultValue="open" className="mb-8">
            <div className="flex justify-center">
              <TabsList className="bg-secondary">
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openCalls.map((call, index) => (
                  <OpenCallCard 
                    key={index}
                    title={call.title}
                    organization={call.organization}
                    deadline={call.deadline}
                    category={call.category}
                    imageUrl={call.imageUrl}
                    status={call.status}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="open" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openCalls
                  .filter(call => call.status === 'open')
                  .map((call, index) => (
                    <OpenCallCard 
                      key={index}
                      title={call.title}
                      organization={call.organization}
                      deadline={call.deadline}
                      category={call.category}
                      imageUrl={call.imageUrl}
                      status={call.status}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openCalls
                  .filter(call => call.status === 'upcoming')
                  .map((call, index) => (
                    <OpenCallCard 
                      key={index}
                      title={call.title}
                      organization={call.organization}
                      deadline={call.deadline}
                      category={call.category}
                      imageUrl={call.imageUrl}
                      status={call.status}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="closed" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openCalls
                  .filter(call => call.status === 'closed')
                  .map((call, index) => (
                    <OpenCallCard 
                      key={index}
                      title={call.title}
                      organization={call.organization}
                      deadline={call.deadline}
                      category={call.category}
                      imageUrl={call.imageUrl}
                      status={call.status}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button variant="secondary" className="rounded-full">All Categories</Button>
            <Button variant="outline" className="rounded-full">Exhibition</Button>
            <Button variant="outline" className="rounded-full">Grant</Button>
            <Button variant="outline" className="rounded-full">Competition</Button>
            <Button variant="outline" className="rounded-full">Commission</Button>
            <Button variant="outline" className="rounded-full">Residency</Button>
          </div>
          
          {/* Submit button */}
          <div className="text-center mt-12 p-8 bg-gray-50 rounded-xl border border-gray-100 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">Are you hosting an open call?</h3>
            <p className="text-muted-foreground mb-6">
              Submit your opportunity to reach talented artists from around the world
            </p>
            <Button size="lg" className="rounded-full px-8">
              Submit an Open Call
            </Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default OpenCalls;
