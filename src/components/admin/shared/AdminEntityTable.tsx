
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface AdminEntityTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  keyField: keyof T;
  emptyMessage?: string;
}

function AdminEntityTable<T>({ 
  data, 
  columns, 
  loading = false, 
  keyField,
  emptyMessage = "No items found" 
}: AdminEntityTableProps<T>) {
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={String(item[keyField])}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {typeof column.accessor === 'function' 
                    ? column.accessor(item)
                    : String(item[column.accessor] || '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default AdminEntityTable;
