import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  createOpenCallSubmission, 
  updateOpenCallSubmission,
  getOpenCallSubmission
} from '@/services/api/openCall.api';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X } from 'lucide-react';

interface ApplicationFormProps {
  openCallId: string;
  initialData?: any | null;
  onSubmit?: (status: string, submissionId?: string) => void;
  onCancel?: () => void;
}

interface FileUpload {
  name: string;
  url: string;
}

const ApplicationForm = ({ 
  openCallId, 
  initialData = null, 
  onSubmit, 
  onCancel 
}: ApplicationFormProps) => {
  const { user } = useAuth();
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [artistStatement, setArtistStatement] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [email, setEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (initialData) {
      setProjectTitle(initialData.project_title || '');
      setProjectDescription(initialData.project_description || '');
      setArtistStatement(initialData.artist_statement || '');
      setAdditionalNotes(initialData.additional_notes || '');
      setEmail(initialData.email || '');
      setPortfolioUrl(initialData.portfolio_url || '');
      setFiles(initialData.files || []);
      setDraftId(initialData.id || null);
    } else if (user) {
      fetchExistingDraft();
    }
  }, [initialData, user]);

  const fetchExistingDraft = async () => {
    try {
      const response = await getOpenCallSubmission(openCallId, user?.id || '');
      if (response.status === 'success' && response.data) {
        const draft = response.data;
        setDraftId(draft.id);
        setProjectTitle(draft.submission_data.project_title || '');
        setProjectDescription(draft.submission_data.project_description || '');
        setArtistStatement(draft.submission_data.artist_statement || '');
        setAdditionalNotes(draft.submission_data.additional_notes || '');
        setEmail(draft.submission_data.email || '');
        setPortfolioUrl(draft.submission_data.portfolio_url || '');
        setFiles(draft.submission_data.files || []);
      }
    } catch (error) {
      console.error('Error fetching existing draft:', error);
    }
  };

  const getFormData = useCallback(() => ({
    project_title: projectTitle,
    project_description: projectDescription,
    artist_statement: artistStatement,
    additional_notes: additionalNotes,
    email: email,
    portfolio_url: portfolioUrl,
    files: files
  }), [projectTitle, projectDescription, artistStatement, additionalNotes, email, portfolioUrl, files]);

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('You must be logged in to save a draft');
      return;
    }

    try {
      setIsSaving(true);
      
      const formData = getFormData();
      
      // Save as draft
      const response = user && draftId
        ? await updateOpenCallSubmission(draftId, formData, 'draft')
        : await createOpenCallSubmission(openCallId, user.id, formData, 'draft');
      
      if (response.status === 'success') {
        setDraftId(response.data as string);
        setLastSaved(new Date());
        toast.success('Draft saved successfully');
        if (typeof onSubmit === 'function') {
          onSubmit('draft', response.data as string);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit an application');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formData = getFormData();
      
      // Submit application
      const response = draftId
        ? await updateOpenCallSubmission(draftId, formData, 'submitted')
        : await createOpenCallSubmission(openCallId, user.id, formData, 'submitted');
      
      if (response.status === 'success') {
        toast.success('Application submitted successfully');
        if (typeof onSubmit === 'function') {
          onSubmit('submitted', response.data as string);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.map(file => {
      const reader = new FileReader()

      reader.onload = () => {
        // Convert the file to base64
        const binaryStr = reader.result as string;
        const newFile = {
          name: file.name,
          url: binaryStr
        };
        setFiles(prevFiles => [...prevFiles, newFile]);
      }
      reader.readAsDataURL(file)

      return file;
    })
  }, [])
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  const removeFile = (fileToRemove: FileUpload) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileToRemove.name));
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-4">
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
              onChange={(e) => setProjectTitle(e.target.value)}
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
              onChange={(e) => setProjectDescription(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artist Statement</CardTitle>
          <CardDescription>
            Share your perspective and artistic vision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="artist_statement">Statement</Label>
            <Textarea
              id="artist_statement"
              placeholder="Share your thoughts and artistic vision"
              rows={5}
              value={artistStatement}
              onChange={(e) => setArtistStatement(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Provide any extra details or links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              placeholder="Anything else you'd like to share?"
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="portfolio_url">Portfolio URL</Label>
            <Input
              type="url"
              id="portfolio_url"
              placeholder="Link to your online portfolio"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Uploads</CardTitle>
          <CardDescription>
            Attach relevant files to support your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div {...getRootProps()} className="dropzone border rounded-md p-4 flex flex-col items-center justify-center">
            <input {...getInputProps()} />
            {
              isDragActive ?
                <p>Drop the files here ...</p> :
                <>
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Drag 'n' drop some files here, or click to select files</p>
                </>
            }
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Uploaded Files:</h4>
              <ul className="mt-2 space-y-2">
                {files.map((file) => (
                  <li key={file.name} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" type="button" onClick={handleSaveDraft} disabled={isSaving || isSubmitting}>
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <div>
          {lastSaved && (
            <p className="text-sm text-muted-foreground italic mr-4 inline-block">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ApplicationForm;
