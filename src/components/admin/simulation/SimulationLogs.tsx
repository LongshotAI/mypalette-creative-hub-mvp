
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, Search, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type SimulationLog = {
  id: string;
  created_at: string;
  transaction_type: string;
  status: string;
  buyer_name: string;
  artwork_title: string;
  amount: number;
  currency: string;
  simulation_notes: string;
  metadata: any;
};

const SimulationLogs = () => {
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Query the simulated orders with additional data
      let query = supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          amount,
          currency,
          metadata,
          buyer_id,
          artwork_id,
          artworks:artwork_id (
            title,
            portfolios:portfolio_id (
              profiles:user_id (
                full_name,
                username
              )
            )
          ),
          profiles:buyer_id (
            full_name,
            username
          )
        `, { count: 'exact' })
        .eq('is_simulation', true)
        .order('created_at', { ascending: false });

      // Apply filters if set
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        // Query based on metadata->transaction_type field
        query = query.eq('metadata->>transaction_type', typeFilter);
      }

      // Apply search filter if provided
      if (searchQuery) {
        // We'll make this simple for now - just search by ID
        // In a real implementation, you'd likely want to search across multiple fields
        query = query.ilike('id', `%${searchQuery}%`);
      }

      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Format the logs data
      const formattedLogs = data?.map(log => ({
        id: log.id,
        created_at: log.created_at,
        transaction_type: log.metadata?.transaction_type || 'unknown',
        status: log.status,
        buyer_name: log.profiles?.full_name || log.profiles?.username || 'Unknown User',
        artwork_title: log.artworks?.title || 'Unknown Artwork',
        amount: log.amount,
        currency: log.currency,
        simulation_notes: log.metadata?.simulation_notes || '',
        metadata: log.metadata
      })) || [];

      setLogs(formattedLogs);
      
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / pageSize));
      }

    } catch (error) {
      console.error('Error fetching simulation logs:', error);
      toast.error('Failed to load simulation logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter, typeFilter, searchQuery]);

  const handleExport = () => {
    try {
      // Convert logs to CSV format
      const headers = ['ID', 'Date', 'Type', 'Status', 'Buyer', 'Artwork', 'Amount', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          log.id,
          new Date(log.created_at).toISOString(),
          log.transaction_type,
          log.status,
          log.buyer_name.replace(/,/g, ' '), // Remove commas to avoid CSV issues
          log.artwork_title.replace(/,/g, ' '),
          `${log.currency} ${log.amount}`,
          log.simulation_notes.replace(/,/g, ' ').replace(/\n/g, ' ')
        ].join(','))
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `simulation-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <Badge variant="outline" className="border-green-200 text-green-800">
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="border-red-200 text-red-800">
            Failed
          </Badge>
        );
      case 'abandoned':
        return (
          <Badge variant="outline" className="border-amber-200 text-amber-800">
            Abandoned
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {type}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Logs</CardTitle>
        <CardDescription>
          View and export logs of all simulated transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters and actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={handleExport} disabled={logs.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Logs table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No simulation logs found.</p>
              <p className="text-sm mt-1">Try adjusting your filters or run a new simulation.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Artwork</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>{log.artwork_title}</TableCell>
                        <TableCell>{log.buyer_name}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: log.currency,
                          }).format(log.amount)}
                        </TableCell>
                        <TableCell>{getTypeBadge(log.transaction_type)}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <span className="truncate block max-w-[200px]" title={log.simulation_notes}>
                            {log.simulation_notes || '—'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{logs.length}</span> of{" "}
                  <span className="font-medium">{totalCount}</span> records
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationLogs;
