
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, BarChart4 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface SimulationLog {
  id: string;
  created_at: string;
  buyer_id: string;
  buyer_name: string;
  artwork_id: string;
  artwork_title: string;
  amount: number;
  currency: string;
  status: string;
  metadata: any;
  stripe_session_id: string;
}

const SimulationLogs = () => {
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, timeframe]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Use the simulation_analytics view
      let query = supabase
        .from('simulation_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply timeframe filter if not 'all'
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (timeframe) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0); // Beginning of time
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching simulation logs:', error);
        throw error;
      }

      setLogs(data as SimulationLog[]);
    } catch (error) {
      console.error('Failed to fetch simulation logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    // Format the logs for export
    const exportData = logs.map(log => ({
      id: log.id,
      created_at: log.created_at,
      buyer: log.buyer_name || log.buyer_id,
      artwork: log.artwork_title || log.artwork_id,
      amount: `${log.currency} ${log.amount}`,
      status: log.status,
      transaction_type: log.metadata?.transaction_type || 'unknown',
      simulation_notes: log.metadata?.simulation_notes || '',
      stripe_session_id: log.stripe_session_id
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {}).join(',');
    const rows = exportData.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `simulation-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Simulation Logs</CardTitle>
        <div className="flex space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending/Abandoned</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportLogs} disabled={logs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <BarChart4 className="mx-auto h-12 w-12 mb-4" />
            <p>No simulation logs found for the selected filters.</p>
            <p className="text-sm mt-2">Try changing your filters or run a new simulation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Artwork</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{log.buyer_name || log.buyer_id}</TableCell>
                    <TableCell>{log.artwork_title || log.artwork_id}</TableCell>
                    <TableCell>{log.currency} {log.amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.metadata?.transaction_type || 'unknown'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.metadata?.simulation_notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimulationLogs;
