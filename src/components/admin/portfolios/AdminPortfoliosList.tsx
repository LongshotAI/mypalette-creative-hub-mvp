
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Trash2 } from 'lucide-react';
import { getReadableDate, truncateText } from '@/lib/utils';
import { Link } from 'react-router-dom';
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

interface AdminPortfoliosListProps {
  portfolios: PortfolioWithOwner[];
  loading: boolean;
  onDeletePortfolio: (id: string) => Promise<void>;
  onRefetch?: () => Promise<void>;
}

const AdminPortfoliosList = ({ portfolios, loading, onDeletePortfolio, onRefetch }: AdminPortfoliosListProps) => {
  const [portfolioToDelete, setPortfolioToDelete] = useState<PortfolioWithOwner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (portfolio: PortfolioWithOwner) => {
    try {
      setDeleting(true);
      await onDeletePortfolio(portfolio.id);
    } finally {
      setDeleting(false);
      setPortfolioToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No portfolios found</p>
      </div>
    );
  }

  return (
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
          {portfolios.map((portfolio) => (
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
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => setPortfolioToDelete(portfolio)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <AlertDialog open={portfolioToDelete !== null} onOpenChange={(open) => {
        if (!open) setPortfolioToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the portfolio "{portfolioToDelete?.name}" and all its artworks?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => portfolioToDelete && handleDelete(portfolioToDelete)}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

export default AdminPortfoliosList;
