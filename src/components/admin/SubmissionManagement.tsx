
import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getAllSubmissions, updateSubmissionStatus } from '@/lib/supabase';
import { Loader2, RefreshCcw, Eye } from 'lucide-react';
import { SubmissionWithDetails } from '@/types/admin';

const SubmissionManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const loadSubmissions = async () => {
    setLoading(true);
    const data = await getAllSubmissions();
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleUpdateClick = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setNewStatus(submission.status);
    setFeedback(submission.feedback || '');
    setIsUpdateDialogOpen(true);
  };

  const handleViewClick = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSubmission || !newStatus) return;

    const success = await updateSubmissionStatus(
      selectedSubmission.id, 
      newStatus,
      feedback || null
    );
    
    if (success) {
      toast.success(`Submission status updated successfully`);
      loadSubmissions();
    } else {
      toast.error('Failed to update submission status');
    }
    
    setIsUpdateDialogOpen(false);
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Submission Management</h2>
        <Button variant="outline" onClick={loadSubmissions} className="gap-2">
          <RefreshCcw size={16} />
          Refresh
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Open Call</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-mono text-xs">{submission.id.substring(0, 8)}</TableCell>
                  <TableCell>{submission.user_email || 'Unknown'}</TableCell>
                  <TableCell>{submission.open_call_title || 'Unknown'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewClick(submission)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateClick(submission)}
                      >
                        Update
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Submission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Submission</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium mb-1">Applicant:</p>
                <p className="text-sm">{selectedSubmission?.user_email}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Open Call:</p>
                <p className="text-sm">{selectedSubmission?.open_call_title}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Status:</p>
                <p className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${selectedSubmission ? getStatusBadgeColor(selectedSubmission.status) : ''}`}>
                    {selectedSubmission?.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Submitted:</p>
                <p className="text-sm">{selectedSubmission ? new Date(selectedSubmission.created_at).toLocaleString() : ''}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Feedback:</p>
              <p className="text-sm">{selectedSubmission?.feedback || 'No feedback provided yet'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Submission Data:</p>
              <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-xs whitespace-pre-wrap">
                  {selectedSubmission ? JSON.stringify(selectedSubmission.submission_data, null, 2) : ''}
                </pre>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Submission Status</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm mb-1">Applicant: {selectedSubmission?.user_email}</p>
              <p className="text-sm">Open Call: {selectedSubmission?.open_call_title}</p>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Submission Status</label>
              <Select 
                value={newStatus} 
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Feedback (optional)</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to the applicant"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionManagement;
