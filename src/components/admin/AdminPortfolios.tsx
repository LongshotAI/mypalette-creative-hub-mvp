
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Eye, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getReadableDate, truncateText } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface PortfolioWithOwner {
  id: string;
  name: string;
  description: string;
  template: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  owner_name: string;
  owner_email: string;
  artwork_count: number;
}

const AdminPortfolios = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolioToDelete, setPortfolioToDelete] = useState<PortfolioWithOwner | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        // Get all portfolios with join to profiles for owner information
        const { data, error } = await supabase
          .from('portfolios')
          .select(`
            *,
            profiles:user_id (
              full_name,
              username,
              email
            )
          `);
        
        if (error) {
          throw error;
        }

        // Get artwork count for each portfolio
        const portfoliosWithCounts = await Promise.all(
          data.map(async (portfolio) => {
            const { count, error: countError } = await supabase
              .from('artworks')
              .select('*', { count: 'exact', head: true })
              .eq('portfolio_id', portfolio.id);
            
            return {
              ...portfolio,
              owner_name: portfolio.profiles?.full_name || portfolio.profiles?.username || 'Unknown',
              owner_email: portfolio.profiles?.email || 'Unknown',
              artwork_count: count || 0
            };
          })
        );
        
        setPortfolios(portfoliosWithCounts);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        toast.error('Failed to load portfolios');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleDeletePortfolio = async (id: string) => {
    try {
      setLoading(true);
      
      // First delete all artworks in the portfolio
      const { error: artworksError } = await supabase
        .from('artworks')
        .delete()
        .eq('portfolio_id', id);
      
      if (artworksError) {
        throw artworksError;
      }
      
      // Then delete the portfolio
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setPortfolios(portfolios.filter(p => p.id !== id));
      toast.success('Portfolio deleted successfully');
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('Failed to delete portfolio');
    } finally {
      setLoading(false);
      setPortfolioToDelete(null);
    }
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    const searchLower = searchTerm.toLowerCase();
    return (
      portfolio.name.toLowerCase().includes(searchLower) ||
      (portfolio.description && portfolio.description.toLowerCase().includes(searchLower)) ||
      portfolio.owner_name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Portfolios</CardTitle>
        <CardDescription>
          View and manage all portfolios on the platform
        </CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search portfolios..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Artworks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPortfolios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No portfolios found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPortfolios.map((portfolio) => (
                    <TableRow key={portfolio.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{portfolio.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {portfolio.description ? truncateText(portfolio.description, 50) : 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{portfolio.owner_name}</p>
                          <p className="text-sm text-muted-foreground">{portfolio.owner_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{portfolio.template}</Badge>
                      </TableCell>
                      <TableCell>
                        {portfolio.is_public ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200">Public</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Private</Badge>
                        )}
                      </TableCell>
                      <TableCell>{portfolio.artwork_count}</TableCell>
                      <TableCell>{getReadableDate(portfolio.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                          >
                            <Link to={`/portfolio/${portfolio.id}`} target="_blank">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => setPortfolioToDelete(portfolio)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the portfolio "{portfolioToDelete?.name}" and all its artworks?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => portfolioToDelete && handleDeletePortfolio(portfolioToDelete.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPortfolios;
