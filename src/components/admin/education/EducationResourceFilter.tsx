
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EducationResourceFilterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const EducationResourceFilter = ({ 
  activeTab, 
  onTabChange 
}: EducationResourceFilterProps) => {
  return (
    <Tabs 
      defaultValue="all" 
      value={activeTab} 
      onValueChange={onTabChange} 
      className="mb-6"
    >
      <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="published">Published</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
        <TabsTrigger value="articles">Articles</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
        <TabsTrigger value="guides">Guides</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default EducationResourceFilter;
