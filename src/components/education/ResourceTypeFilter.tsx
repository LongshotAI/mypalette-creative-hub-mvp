
import React from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResourceTypeFilterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ResourceTypeFilter = ({ activeTab, onTabChange }: ResourceTypeFilterProps) => {
  return (
    <div className="mb-8">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
        <div className="flex justify-center">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="guide">Guides</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default ResourceTypeFilter;
