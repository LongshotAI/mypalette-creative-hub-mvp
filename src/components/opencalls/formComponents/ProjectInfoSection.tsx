
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";

interface ProjectInfoSectionProps {
  projectTitle: string;
  projectDescription: string;
  onProjectTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProjectDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProjectInfoSection = ({
  projectTitle,
  projectDescription,
  onProjectTitleChange,
  onProjectDescriptionChange
}: ProjectInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
        <CardDescription>
          Tell us about your project for this open call
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="project_title">Project Title</Label>
          <Input
            id="project_title"
            placeholder="e.g., The Future of Art"
            value={projectTitle}
            onChange={onProjectTitleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="project_description">Project Description</Label>
          <Textarea
            id="project_description"
            placeholder="Describe your project in detail"
            rows={3}
            value={projectDescription}
            onChange={onProjectDescriptionChange}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInfoSection;
