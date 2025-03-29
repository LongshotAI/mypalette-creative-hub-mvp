
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

// This will enhance any function that returns education resources
export const enhanceEducationResourcesWithImages = (resources) => {
  return resources.map((resource, index) => ({
    ...resource,
    image_url: resource.image_url || resourceImages[index % resourceImages.length],
    description: resource.description || resourceDescriptions[index % resourceDescriptions.length]
  }));
};
