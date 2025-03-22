
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getReadableDate } from '@/lib/utils';
import { getOpenCallSubmissions } from '@/services/api/openCall.api';
import AdminSubmissionsList from './AdminSubmissionsList';

interface OpenCall {
  id: string;
  title: string;
  organization: string;
  description: string;
  requirements: string;
  category: string;
  status: 'open' | 'closed' | 'draft';
  deadline: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

interface AdminOpenCallDetailProps {
  openCall: OpenCall;
  onBack: () => void;
}

const AdminOpenCallDetail = ({ openCall, onBack }: AdminOpenCallDetailProps) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, [openCall.id]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await getOpenCallSubmissions(openCall.id);
      
      if (response.status === 'success') {
        setSubmissions(response.data || []);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubmissions = () => {
    if (activeTab === 'all') {
      return submissions;
    }
    return submissions.filter((sub: any) => sub.status === activeTab);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Open</Badge>;
      case 'closed':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Closed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Open Calls
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{openCall.title}</CardTitle>
            <CardDescription>
              By {openCall.organization} • {getStatusBadge(openCall.status)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Category</div>
              <Badge variant="outline">{openCall.category}</Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Deadline</div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {getReadableDate(openCall.deadline)}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <div className="text-sm font-medium mb-2">Description</div>
              <div className="text-sm whitespace-pre-line">
                {openCall.description || 'No description provided.'}
              </div>
            </div>
            
            {openCall.requirements && (
              <div>
                <div className="text-sm font-medium mb-2">Requirements</div>
                <div className="text-sm whitespace-pre-line">
                  {openCall.requirements}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {submissions.length}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="text-sm">Drafts</div>
                <div className="font-medium">
                  {submissions.filter((s: any) => s.status === 'draft').length}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Submitted</div>
                <div className="font-medium">
                  {submissions.filter((s: any) => s.status === 'submitted').length}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Under Review</div>
                <div className="font-medium">
                  {submissions.filter((s: any) => s.status === 'under_review').length}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Accepted</div>
                <div className="font-medium">
                  {submissions.filter((s: any) => s.status === 'accepted').length}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Rejected</div>
                <div className="font-medium">
                  {submissions.filter((s: any) => s.status === 'rejected').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Submissions</CardTitle>
          <CardDescription>
            Review and manage artist submissions for this open call
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="under_review">Under Review</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          <AdminSubmissionsList
            submissions={getFilteredSubmissions()}
            loading={loading}
            onRefetch={fetchSubmissions}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOpenCallDetail;
