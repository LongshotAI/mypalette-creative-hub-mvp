
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAdminEducationResources } from "@/services/api/education.api";
import AdminEducationList from "./education/AdminEducationList";

interface EducationResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  author: string;
  external_url?: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

const AdminEducation = () => {
  const [resources, setResources] = useState<EducationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await getAdminEducationResources();
      
      if (response.status === 'success') {
        setResources(response.data || []);
      } else {
        // Instead of directly accessing response.message, handle the error more safely
        throw new Error(response.error?.message || 'Failed to load resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load education resources');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResources = () => {
    switch (activeTab) {
      case 'published':
        return resources.filter(r => r.is_published);
      case 'drafts':
        return resources.filter(r => !r.is_published);
      case 'articles':
        return resources.filter(r => r.type === 'article');
      case 'videos':
        return resources.filter(r => r.type === 'video');
      case 'guides':
        return resources.filter(r => r.type === 'guide');
      default:
        return resources;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Education Resources</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
          <CardDescription>
            Manage educational resources for artists and collectors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading && resources.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AdminEducationList
              resources={getFilteredResources()}
              loading={loading}
              onRefetch={fetchResources}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEducation;
