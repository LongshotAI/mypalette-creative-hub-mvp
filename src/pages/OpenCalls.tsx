import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import OpenCallCard from '@/components/opencalls/OpenCallCard';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Sample art images
const artImages = [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579783928621-7a13d66a62b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
];

// Sample data with added images
const openCallsData = [
  { 
    id: '1',
    title: "Digital Art Exhibition 2023", 
    organization: "Modern Art Gallery", 
    deadline: "June 30, 2023", 
    category: "Exhibition", 
    imageUrl: artImages[0],
    status: "open" as const
  },
  { 
    id: '2',
    title: "Emerging Artists Grant Program", 
    organization: "Art Foundation", 
    deadline: "July 15, 2023", 
    category: "Grant", 
    imageUrl: artImages[1],
    status: "open" as const
  },
  { 
    id: '3',
    title: "NFT Collection Launch", 
    organization: "Crypto Art Collective", 
    deadline: "May 20, 2023", 
    category: "Commission", 
    imageUrl: artImages[2],
    status: "closed" as const
  },
  { 
    id: '4',
    title: "Public Art Installation", 
    organization: "City Arts Commission", 
    deadline: "August 5, 2023", 
    category: "Public Art", 
    imageUrl: artImages[3],
    status: "upcoming" as const
  },
  { 
    id: '5',
    title: "Virtual Reality Art Experience", 
    organization: "Tech Arts Initiative", 
    deadline: "July 10, 2023", 
    category: "Digital Art", 
    imageUrl: artImages[4],
    status: "open" as const
  },
  { 
    id: '6',
    title: "Environmental Art Competition", 
    organization: "Green Planet Foundation", 
    deadline: "August 30, 2023", 
    category: "Competition", 
    imageUrl: artImages[5],
    status: "upcoming" as const
  },
];

// Application steps for the stepper component
const applicationSteps = [
  { id: 1, title: "Create Account", description: "Sign up or sign in to your MyPalette account" },
  { id: 2, title: "Select Artwork", description: "Choose artwork from your portfolio" },
  { id: 3, title: "Fill Application", description: "Complete the required information" },
  { id: 4, title: "Submit", description: "Review and submit your application" }
];

const OpenCalls = () => {
  const { user } = useAuth();
  const [openCalls, setOpenCalls] = useState(openCallsData);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('open');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  
  // Fetch open calls based on filters
  useEffect(() => {
    const fetchOpenCalls = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would fetch from Supabase here
        // For now, we'll use the sample data and filter it
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        let filtered = [...openCallsData];
        
        // Filter by status
        if (activeStatus !== 'all') {
          filtered = filtered.filter(call => call.status === activeStatus);
        }
        
        // Filter by category
        if (activeCategory !== 'all') {
          filtered = filtered.filter(call => call.category === activeCategory);
        }
        
        // Filter by search query
        if (searchQuery) {
          filtered = filtered.filter(call => 
            call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            call.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
            call.category.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setOpenCalls(filtered);
      } catch (error) {
        console.error('Error fetching open calls:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOpenCalls();
  }, [activeStatus, activeCategory, searchQuery]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle apply button click
  const handleApplyClick = (id: string) => {
    if (!user) {
      toast.error('Please sign in to apply for open calls');
      return;
    }
    
    setActiveCallId(id);
    setActiveStep(1);
    setApplyDialogOpen(true);
  };
  
  // Get active call details
  const getActiveCall = () => {
    return openCalls.find(call => call.id === activeCallId);
  };
  
  // Handle next step in application
  const handleNextStep = () => {
    if (activeStep < applicationSteps.length) {
      setActiveStep(activeStep + 1);
    } else {
      // Submit application
      toast.success('Application submitted successfully!');
      setApplyDialogOpen(false);
    }
  };
  
  // Handle previous step in application
  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

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
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {/* Status Tabs */}
          <Tabs defaultValue="open" value={activeStatus} onValueChange={setActiveStatus} className="mb-8">
            <div className="flex justify-center">
              <TabsList className="bg-secondary">
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : openCalls.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No open calls found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setActiveStatus('open');
                      setActiveCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {openCalls.map((call) => (
                    <OpenCallCard 
                      key={call.id}
                      id={call.id}
                      title={call.title}
                      organization={call.organization}
                      deadline={call.deadline}
                      category={call.category}
                      imageUrl={call.imageUrl}
                      status={call.status}
                      onApplyClick={handleApplyClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs>
          
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button 
              variant={activeCategory === 'all' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveCategory('all')}
            >
              All Categories
            </Button>
            <Button 
              variant={activeCategory === 'Exhibition' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveCategory(activeCategory === 'Exhibition' ? 'all' : 'Exhibition')}
            >
              Exhibition
            </Button>
            <Button 
              variant={activeCategory === 'Grant' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveCategory(activeCategory === 'Grant' ? 'all' : 'Grant')}
            >
              Grant
            </Button>
            <Button 
              variant={activeCategory === 'Competition' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveCategory(activeCategory === 'Competition' ? 'all' : 'Competition')}
            >
              Competition
            </Button>
            <Button 
              variant={activeCategory === 'Commission' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveCategory(activeCategory === 'Commission' ? 'all' : 'Commission')}
            >
              Commission
            </Button>
            <Button 
              variant={activeCategory === 'Residency' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveCategory(activeCategory === 'Residency' ? 'all' : 'Residency')}
            >
              Residency
            </Button>
          </div>
          
          {/* Application Dialog */}
          <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Apply for {getActiveCall()?.title}</DialogTitle>
                <DialogDescription>
                  Submit your application to {getActiveCall()?.organization}
                </DialogDescription>
              </DialogHeader>
              
              {/* Application Steps */}
              <div className="py-4">
                {/* Step Indicator */}
                <div className="flex mb-8">
                  {applicationSteps.map((step, index) => (
                    <div key={step.id} className="flex-1 relative">
                      <div className={`
                        flex flex-col items-center
                        ${index > 0 ? 'ml-4' : ''}
                      `}>
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center 
                          ${step.id === activeStep 
                            ? 'bg-primary text-white' 
                            : step.id < activeStep 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-gray-200 text-gray-500'}
                        `}>
                          {step.id}
                        </div>
                        <div className={`
                          text-xs mt-1 text-center
                          ${step.id === activeStep 
                            ? 'text-primary font-medium' 
                            : 'text-muted-foreground'}
                        `}>
                          {step.title}
                        </div>
                      </div>
                      
                      {/* Connector line */}
                      {index < applicationSteps.length - 1 && (
                        <div className={`
                          absolute w-full h-[2px] top-4 left-1/2
                          ${step.id < activeStep ? 'bg-primary' : 'bg-gray-200'}
                        `} />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Step Content */}
                <div className="mb-8">
                  {activeStep === 1 && (
                    <div className="text-center p-4">
                      <h3 className="text-lg font-medium mb-2">Welcome to the Application Process</h3>
                      <p className="text-muted-foreground mb-4">
                        You're signed in as <span className="font-medium">{user?.email}</span>.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Application deadline: {getActiveCall()?.deadline}
                      </p>
                    </div>
                  )}
                  
                  {activeStep === 2 && (
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-4">Select Artwork to Submit</h3>
                      <p className="text-muted-foreground mb-6">
                        Choose artwork from your portfolio to include in your application.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Placeholder for artwork selection */}
                        <div className="border rounded p-2 flex items-center justify-center h-32 bg-gray-50">
                          <p className="text-sm text-muted-foreground">Add from portfolio</p>
                        </div>
                        <div className="border rounded p-2 flex items-center justify-center h-32 bg-gray-50">
                          <p className="text-sm text-muted-foreground">Add from portfolio</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeStep === 3 && (
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-4">Complete Application Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Artist Statement
                          </label>
                          <textarea 
                            className="w-full px-3 py-2 border rounded-md"
                            rows={4}
                            placeholder="Tell us about your artwork and why you're applying..."
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            References
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Enter references or previous exhibitions..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeStep === 4 && (
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-4">Review & Submit</h3>
                      <div className="space-y-4">
                        <p className="text-muted-foreground mb-2">
                          Please review your application before submitting. Once submitted, you can track its status in your dashboard.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium mb-2">Application Summary</h4>
                          <ul className="text-sm space-y-2">
                            <li><span className="text-muted-foreground">Open Call:</span> {getActiveCall()?.title}</li>
                            <li><span className="text-muted-foreground">Organization:</span> {getActiveCall()?.organization}</li>
                            <li><span className="text-muted-foreground">Deadline:</span> {getActiveCall()?.deadline}</li>
                            <li><span className="text-muted-foreground">Artwork Count:</span> 2</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                {activeStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    Back
                  </Button>
                )}
                <div className={`flex ${activeStep === 1 ? 'justify-end w-full' : ''}`}>
                  <Button onClick={handleNextStep}>
                    {activeStep < applicationSteps.length ? 'Continue' : 'Submit Application'}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
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
