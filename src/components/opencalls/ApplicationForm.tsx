
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  submitOpenCallApplication, 
  updateSubmission,
  getSubmission
} from '@/services/api/openCall.api';

// Import our new component sections
import ProjectInfoSection from './formComponents/ProjectInfoSection';
import ArtistStatementSection from './formComponents/ArtistStatementSection';
import AdditionalInfoSection from './formComponents/AdditionalInfoSection';
import FileUploadSection from './formComponents/FileUploadSection';
import FormActions from './formComponents/FormActions';

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
      const response = await getSubmission(openCallId);
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
      
      const response = user && draftId
        ? await updateSubmission(draftId, { submission_data: formData, status: 'draft' })
        : await submitOpenCallApplication(openCallId, user.id, formData, 'draft');
      
      if (response.status === 'success') {
        // Handle the case where we get a string ID back
        if (draftId === null && response.data) {
          // Make sure we're handling response.data properly as a string or undefined
          if (typeof response.data === 'string') {
            setDraftId(response.data);
          }
        }
        setLastSaved(new Date());
        toast.success('Draft saved successfully');
        if (typeof onSubmit === 'function') {
          // Ensure we pass a string or undefined for submissionId, not a boolean
          const submissionId = draftId || (typeof response.data === 'string' ? response.data : undefined);
          onSubmit('draft', submissionId);
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
      
      const response = draftId
        ? await updateSubmission(draftId, { submission_data: formData, status: 'submitted' })
        : await submitOpenCallApplication(openCallId, user.id, formData, 'submitted');
      
      if (response.status === 'success') {
        toast.success('Application submitted successfully');
        if (typeof onSubmit === 'function') {
          // Ensure we pass a string or undefined for submissionId, not a boolean
          const submissionId = draftId || (typeof response.data === 'string' ? response.data : undefined);
          onSubmit('submitted', submissionId);
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

  // Handler functions for child components
  const handleFilesChange = (newFiles: FileUpload[]) => {
    setFiles(newFiles);
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-4">
      <ProjectInfoSection 
        projectTitle={projectTitle}
        projectDescription={projectDescription}
        onProjectTitleChange={(e) => setProjectTitle(e.target.value)}
        onProjectDescriptionChange={(e) => setProjectDescription(e.target.value)}
      />

      <ArtistStatementSection 
        artistStatement={artistStatement}
        onArtistStatementChange={(e) => setArtistStatement(e.target.value)}
      />

      <AdditionalInfoSection 
        additionalNotes={additionalNotes}
        email={email}
        portfolioUrl={portfolioUrl}
        onAdditionalNotesChange={(e) => setAdditionalNotes(e.target.value)}
        onEmailChange={(e) => setEmail(e.target.value)}
        onPortfolioUrlChange={(e) => setPortfolioUrl(e.target.value)}
      />

      <FileUploadSection 
        files={files}
        onFilesChange={handleFilesChange}
      />

      <FormActions 
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        lastSaved={lastSaved}
      />
    </form>
  );
};

export default ApplicationForm;
