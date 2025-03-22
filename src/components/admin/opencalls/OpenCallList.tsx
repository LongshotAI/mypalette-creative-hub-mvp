
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { getReadableDate } from '@/lib/utils';

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
  submission_count?: number;
}

interface OpenCallListProps {
  openCalls: OpenCall[];
  onViewSubmissions: (call: OpenCall) => void;
  onEditCall: (call: OpenCall) => void;
  onDeleteCall: (id: string) => void;
}

const OpenCallList = ({ 
  openCalls, 
  onViewSubmissions, 
  onEditCall, 
  onDeleteCall 
}: OpenCallListProps) => {
  
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Submissions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {openCalls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No open calls found
              </TableCell>
            </TableRow>
          ) : (
            openCalls.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="font-medium">{call.title}</TableCell>
                <TableCell>{call.organization}</TableCell>
                <TableCell>{call.category}</TableCell>
                <TableCell>{getStatusBadge(call.status)}</TableCell>
                <TableCell>{getReadableDate(call.deadline)}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    className="px-2 py-1 h-auto"
                    onClick={() => onViewSubmissions(call)}
                  >
                    {call.submission_count || 0}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewSubmissions(call)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditCall(call)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => onDeleteCall(call.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OpenCallList;
