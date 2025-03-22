
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Eye, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { getReadableDate } from '@/lib/utils';
import { toast } from 'sonner';
import { updateSubmission, deleteSubmission } from '@/services/api/openCall.api';

export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';

interface Submission {
  id: string;
  open_call_id: string;
  user_id: string;
  status: SubmissionStatus;
  submission_data: any;
  created_at: string;
  updated_at: string;
  feedback?: string;
  profiles?: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
  };
}

interface AdminSubmissionsListProps {
  submissions: Submission[];
  loading: boolean;
  onRefetch: () => Promise<void>;
}

const AdminSubmissionsList = ({ 
  submissions, 
  loading, 
  onRefetch 
}: AdminSubmissionsListProps) => {
  const [viewSubmission, setViewSubmission] = useState<Submission | null>(null);
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleStatusChange = async (submissionId: string, status: SubmissionStatus) => {
    try {
      setIsUpdating(true);
      const response = await updateSubmission(submissionId, { status });
      
      if (response.status === 'success') {
        toast.success('Status updated successfully');
        onRefetch();
      } else {
        throw new Error(response.error?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await deleteSubmission(submissionToDelete.id);
      
      if (response.status === 'success') {
        toast.success('Submission deleted successfully');
        onRefetch();
      } else {
        throw new Error(response.error?.message || 'Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    } finally {
      setIsDeleting(false);
      setSubmissionToDelete(null);
    }
  };

  const handleSaveFeedback = async () => {
    if (!viewSubmission) return;
    
    try {
      setIsUpdating(true);
      const response = await updateSubmission(viewSubmission.id, { feedback });
      
      if (response.status === 'success') {
        toast.success('Feedback saved successfully');
        onRefetch();
      } else {
        throw new Error(response.error?.message || 'Failed to save feedback');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Submitted</Badge>;
      case 'under_review':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Under Review</Badge>;
      case 'accepted':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const viewSubmissionDetails = (submission: Submission) => {
    setViewSubmission(submission);
    setFeedback(submission.feedback || '');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">No submissions found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={submission.profiles?.avatar_url || ''} alt={submission.profiles?.full_name || 'User'} />
                      <AvatarFallback>
                        {submission.profiles?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{submission.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{submission.profiles?.username || ''}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {submission.submission_data.project_title || 'Untitled Project'}
                </TableCell>
                <TableCell>
                  <Select 
                    defaultValue={submission.status} 
                    onValueChange={(value) => handleStatusChange(submission.id, value as SubmissionStatus)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{getReadableDate(submission.created_at)}</TableCell>
                <TableCell>
                  {submission.submission_data.files && submission.submission_data.files.length > 0 ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {submission.submission_data.files.length} file(s)
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">No files</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => viewSubmissionDetails(submission)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => setSubmissionToDelete(submission)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Submission Details Dialog */}
      <Dialog open={!!viewSubmission} onOpenChange={(open) => !open && setViewSubmission(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Reviewing application for {viewSubmission?.submission_data.project_title || 'Untitled Project'}
            </DialogDescription>
          </DialogHeader>
          
          {viewSubmission && (
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                      <div>{getStatusBadge(viewSubmission.status)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Applicant</h3>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={viewSubmission.profiles?.avatar_url || ''} alt={viewSubmission.profiles?.full_name || 'User'} />
                          <AvatarFallback>
                            {viewSubmission.profiles?.full_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{viewSubmission.profiles?.full_name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{viewSubmission.profiles?.username || ''}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact</h3>
                      <div>{viewSubmission.submission_data.email || 'No email provided'}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Submitted</h3>
                      <div>{getReadableDate(viewSubmission.created_at)}</div>
                    </div>
                    {viewSubmission.submission_data.portfolio_url && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Portfolio</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(viewSubmission.submission_data.portfolio_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Portfolio
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Project Title</h3>
                    <p className="text-lg font-medium">{viewSubmission.submission_data.project_title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Project Description</h3>
                    <p className="text-sm">{viewSubmission.submission_data.project_description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Artist Statement</h3>
                <div className="bg-slate-50 p-4 rounded-md text-sm">
                  {viewSubmission.submission_data.artist_statement}
                </div>
              </div>

              {viewSubmission.submission_data.additional_notes && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Additional Notes</h3>
                  <div className="bg-slate-50 p-4 rounded-md text-sm">
                    {viewSubmission.submission_data.additional_notes}
                  </div>
                </div>
              )}

              {viewSubmission.submission_data.files && viewSubmission.submission_data.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Attached Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewSubmission.submission_data.files.map((file: any, index: number) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <FileText className="h-8 w-8 text-blue-500" />
                        <span className="text-xs truncate max-w-full">{file.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-2">Feedback to Applicant</h3>
                <Textarea 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback on this submission"
                  rows={4}
                />
                <Button 
                  className="mt-2" 
                  onClick={handleSaveFeedback}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Feedback'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!submissionToDelete} onOpenChange={(open) => !open && setSubmissionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? 
              This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteSubmission}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSubmissionsList;
