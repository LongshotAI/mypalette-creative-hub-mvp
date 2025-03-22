
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  submitOpenCallApplication, 
  uploadSubmissionFile 
} from '@/services/api/openCall.api';

// Define form validation schema with Zod
const applicationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  project_title: z.string().min(3, { message: 'Project title must be at least 3 characters' }),
  project_description: z.string().min(20, { message: 'Project description must be at least 20 characters' }),
  artist_statement: z.string().min(20, { message: 'Artist statement must be at least 20 characters' }),
  portfolio_url: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  additional_notes: z.string().optional()
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  openCallId: string;
  onSuccess: () => void;
}

const ApplicationForm = ({ openCallId, onSuccess }: ApplicationFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string}[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: '',
      email: '',
      project_title: '',
      project_description: '',
      artist_statement: '',
      portfolio_url: '',
      additional_notes: ''
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('File type not supported. Please upload an image (JPG, PNG, GIF) or PDF');
      return;
    }
    
    try {
      setUploadingFile(true);
      setUploadError(null);
      
      const response = await uploadSubmissionFile(file, user.id, openCallId);
      
      if (response.status === 'success') {
        setUploadedFiles(prev => [
          ...prev, 
          {name: file.name, url: response.data}
        ]);
        toast.success('File uploaded successfully');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file. Please try again.');
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleSubmitApplication = async (values: ApplicationFormValues) => {
    if (!user) {
      toast.error('You must be logged in to submit an application');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formData = {
        ...values,
        files: uploadedFiles
      };
      
      const response = await submitOpenCallApplication(
        openCallId, 
        user.id, 
        formData,
        'submitted'
      );
      
      if (response.status === 'success') {
        toast.success('Application submitted successfully');
        onSuccess();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('You must be logged in to save a draft');
      return;
    }
    
    try {
      setIsDraftSaving(true);
      
      // Get current form values, even if they're not valid
      const currentValues = form.getValues();
      
      const formData = {
        ...currentValues,
        files: uploadedFiles
      };
      
      const response = await submitOpenCallApplication(
        openCallId, 
        user.id, 
        formData,
        'draft'
      );
      
      if (response.status === 'success') {
        toast.success('Draft saved successfully');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const removeFile = (fileUrl: string) => {
    setUploadedFiles(prev => prev.filter(file => file.url !== fileUrl));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitApplication)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="project_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="Title of your project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="project_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your project in detail" 
                  rows={5}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="artist_statement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist Statement</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share your artist statement" 
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolio_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://your-portfolio.com" {...field} />
              </FormControl>
              <FormDescription>
                Link to your portfolio website or social media
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Upload Files</FormLabel>
          <div className="border border-input rounded-md p-4">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-primary underline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploadingFile}
                >
                  Click to upload
                </Button> or drag and drop
              </div>
              <div className="text-xs text-muted-foreground">
                Images (JPG, PNG, GIF) or PDF up to 5MB
              </div>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                disabled={uploadingFile}
              />
              {uploadingFile && (
                <div className="flex items-center mt-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
              {uploadError && (
                <div className="text-sm text-destructive mt-2">{uploadError}</div>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium">Uploaded Files:</div>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(file.url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="additional_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information you'd like to share" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="sm:flex-1"
            onClick={handleSaveDraft}
            disabled={isDraftSaving || isSubmitting}
          >
            {isDraftSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </Button>
          <Button 
            type="submit" 
            className="sm:flex-1"
            disabled={isSubmitting || isDraftSaving}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ApplicationForm;
