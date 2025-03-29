
// This file will likely be read-only in your app, but we need to add some sample data

// Sample images
const resourceImages = [
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579783928621-7a13d66a62b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1602532305019-3dbbd482dae9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
];

// Add some descriptions for the resources
const resourceDescriptions = [
  "Learn advanced techniques for digital art composition and color theory. This comprehensive guide covers everything from basic principles to professional workflows.",
  "A step-by-step guide to mastering perspective in your artwork. Perfect for beginners and intermediate artists looking to improve their technical skills.",
  "Discover the secrets of successful artists and how they built their careers in the digital age. Includes interviews with industry professionals.",
  "This video tutorial series walks you through the entire process of creating professional-quality digital illustrations from concept to final piece.",
  "Explore the fascinating world of generative art and learn how to create your own algorithmic masterpieces using simple coding techniques.",
  "A comprehensive guide to art marketing in the digital age. Learn how to build your brand, find your audience, and sell your artwork online.",
  "Everything you need to know about NFTs and digital art marketplaces. This guide covers creation, minting, selling, and legal considerations.",
  "Master the fundamentals of color theory and composition to take your artwork to the next level. Includes practical exercises and examples."
];

// Sample education resources for mock data
const mockEducationResources = [
  {
    id: "1",
    title: "Digital Art Composition Masterclass",
    type: "article",
    category: "Digital Art",
    description: resourceDescriptions[0],
    author: "Elena Rodriguez",
    image_url: resourceImages[0],
    is_published: true,
    created_at: "2023-05-15T10:30:00Z",
    external_url: "https://example.com/masterclass"
  },
  {
    id: "2",
    title: "Perspective in Digital Illustration",
    type: "video",
    category: "Digital Art",
    description: resourceDescriptions[1],
    author: "Michael Chen",
    image_url: resourceImages[1],
    is_published: true,
    created_at: "2023-06-20T14:45:00Z",
    external_url: "https://example.com/perspective"
  },
  {
    id: "3",
    title: "Artist Career Building",
    type: "guide",
    category: "Marketing",
    description: resourceDescriptions[2],
    author: "Sarah Johnson",
    image_url: resourceImages[2],
    is_published: true,
    created_at: "2023-07-05T09:15:00Z",
    external_url: "https://example.com/career"
  },
  {
    id: "4",
    title: "Digital Illustration from Concept to Completion",
    type: "video",
    category: "Digital Art",
    description: resourceDescriptions[3],
    author: "David Park",
    image_url: resourceImages[3],
    is_published: true,
    created_at: "2023-08-12T11:20:00Z",
    external_url: "https://example.com/illustration"
  },
  {
    id: "5",
    title: "Introduction to Generative Art",
    type: "article",
    category: "Digital Art",
    description: resourceDescriptions[4],
    author: "Maya Patel",
    image_url: resourceImages[4],
    is_published: true,
    created_at: "2023-09-08T16:30:00Z",
    external_url: "https://example.com/generative"
  },
  {
    id: "6",
    title: "Art Marketing in the Digital Age",
    type: "guide",
    category: "Marketing",
    description: resourceDescriptions[5],
    author: "Alex Turner",
    image_url: resourceImages[5],
    is_published: false,
    created_at: "2023-10-22T13:40:00Z",
    external_url: "https://example.com/marketing"
  },
  {
    id: "7",
    title: "NFTs and Digital Art Marketplace Guide",
    type: "guide",
    category: "NFTs",
    description: resourceDescriptions[6],
    author: "Jordan Lee",
    image_url: resourceImages[6],
    is_published: true,
    created_at: "2023-11-15T10:10:00Z",
    external_url: "https://example.com/nfts"
  },
  {
    id: "8",
    title: "Color Theory for Digital Artists",
    type: "article",
    category: "Digital Art",
    description: resourceDescriptions[7],
    author: "Nina Simone",
    image_url: resourceImages[7],
    is_published: true,
    created_at: "2023-12-05T15:25:00Z",
    external_url: "https://example.com/color"
  }
];

// This will enhance any function that returns education resources
export const enhanceEducationResourcesWithImages = (resources) => {
  return resources.map((resource, index) => ({
    ...resource,
    image_url: resource.image_url || resourceImages[index % resourceImages.length],
    description: resource.description || resourceDescriptions[index % resourceDescriptions.length]
  }));
};

// Function to get education resources with filtering
export const getEducationResources = async (
  searchQuery = '',
  resourceType = 'all',
  category = 'all'
) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredResources = [...mockEducationResources];
  
  // Filter by published status (for regular users)
  filteredResources = filteredResources.filter(resource => resource.is_published);
  
  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredResources = filteredResources.filter(resource =>
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.author.toLowerCase().includes(query)
    );
  }
  
  // Filter by resource type
  if (resourceType !== 'all') {
    filteredResources = filteredResources.filter(resource => 
      resource.type === resourceType
    );
  }
  
  // Filter by category
  if (category !== 'all') {
    filteredResources = filteredResources.filter(resource => 
      resource.category === category
    );
  }
  
  return {
    status: 'success',
    data: filteredResources
  };
};

// Get all education resources for admin (including drafts)
export const getAdminEducationResources = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    status: 'success',
    data: mockEducationResources
  };
};

// Function to toggle favorite status
export const toggleFavoriteResource = async (resourceId, userId, isFavorite) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log(`Toggling favorite status for resource ${resourceId} by user ${userId}. Current status: ${isFavorite}`);
  
  return {
    status: 'success',
    data: { resourceId, userId, isFavorite: !isFavorite }
  };
};

// Get user's favorite resource IDs
export const getUserFavorites = async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // For demo purposes, return some random favorites
  const sampleFavorites = mockEducationResources
    .filter(() => Math.random() > 0.5)
    .map(resource => resource.id);
  
  return {
    status: 'success',
    data: sampleFavorites
  };
};

// Get user's favorite resources (full objects)
export const getFavoriteResources = async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get favorite IDs
  const response = await getUserFavorites(userId);
  const favoriteIds = response.data || [];
  
  // Filter resources by favorite IDs
  const favoriteResources = mockEducationResources
    .filter(resource => favoriteIds.includes(resource.id));
  
  return {
    status: 'success',
    data: favoriteResources
  };
};

// Create a new education resource
export const createEducationResource = async (resourceData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const newResource = {
    ...resourceData,
    id: Math.random().toString(36).substring(2, 11),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('Created new education resource:', newResource);
  
  return {
    status: 'success',
    data: newResource
  };
};

// Update an existing education resource
export const updateEducationResource = async (resourceId, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Find the resource to update (in a real app, this would be a database query)
  const resourceIndex = mockEducationResources.findIndex(r => r.id === resourceId);
  
  if (resourceIndex === -1) {
    return {
      status: 'error',
      error: { message: 'Resource not found' }
    };
  }
  
  const updatedResource = {
    ...mockEducationResources[resourceIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  console.log('Updated education resource:', updatedResource);
  
  return {
    status: 'success',
    data: updatedResource
  };
};

// Delete an education resource
export const deleteEducationResource = async (resourceId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Deleted education resource with ID:', resourceId);
  
  return {
    status: 'success',
    data: { id: resourceId }
  };
};
