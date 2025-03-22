import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader2, CalendarIcon } from "lucide-react";

interface OpenCallFormProps {
  initialValues?: {
    id?: string;
    title: string;
    organization: string;
    description: string;
    requirements: string;
    category: string;
    status: 'open' | 'closed' | 'draft';
    deadline: string;
    image_url?: string;
  };
  onCancel: () => void;
  onSubmitSuccess: () => void;
}

const OpenCallForm = ({ initialValues, onCancel, onSubmitSuccess }: OpenCallFormProps) => {
  const isEdit = !!initialValues?.id;
  const [formData, setFormData] = useState({
    id: initialValues?.id || '',
    title: initialValues?.title || '',
    organization: initialValues?.organization || '',
    description: initialValues?.description || '',
    requirements: initialValues?.requirements || '',
    category: initialValues?.category || 'Exhibition',
    status: initialValues?.status || 'draft',
    deadline: initialValues?.deadline || '',
    image_url: initialValues?.image_url || ''
  });
  
  const [date, setDate] = useState<Date | undefined>(
    initialValues?.deadline ? new Date(initialValues.deadline) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Please select a deadline date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDate = date.toISOString();
      
      if (isEdit) {
        // Update existing open call
        const { error } = await supabase
          .from('open_calls')
          .update({
            title: formData.title,
            organization: formData.organization,
            description: formData.description,
            requirements: formData.requirements,
            category: formData.category,
            status: formData.status,
            deadline: formattedDate,
            image_url: formData.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.id);
          
        if (error) throw error;
        
        toast.success('Open call updated successfully');
      } else {
        // Create new open call
        const { error } = await supabase
          .from('open_calls')
          .insert([{
            title: formData.title,
            organization: formData.organization,
            description: formData.description,
            requirements: formData.requirements,
            category: formData.category,
            status: formData.status,
            deadline: formattedDate,
            image_url: formData.image_url
          }]);
          
        if (error) throw error;
        
        toast.success('Open call created successfully');
      }
      
      onSubmitSuccess();
    } catch (error) {
      console.error('Error saving open call:', error);
      toast.error('Failed to save open call');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="e.g., Summer Exhibition 2023" 
          required
          value={formData.title}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="organization">Organization</Label>
        <Input 
          id="organization" 
          name="organization" 
          placeholder="e.g., City Gallery" 
          required
          value={formData.organization}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Exhibition">Exhibition</SelectItem>
              <SelectItem value="Residency">Residency</SelectItem>
              <SelectItem value="Competition">Competition</SelectItem>
              <SelectItem value="Grant">Grant</SelectItem>
              <SelectItem value="Fellowship">Fellowship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleSelectChange('status', value as 'open' | 'closed' | 'draft')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL (Optional)</Label>
        <Input 
          id="image_url" 
          name="image_url" 
          placeholder="https://example.com/image.jpg" 
          value={formData.image_url || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Describe the opportunity" 
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea 
          id="requirements" 
          name="requirements" 
          placeholder="List eligibility criteria and requirements" 
          rows={3}
          value={formData.requirements || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Open Call' : 'Create Open Call'}
        </Button>
      </div>
    </form>
  );
};

export default OpenCallForm;
