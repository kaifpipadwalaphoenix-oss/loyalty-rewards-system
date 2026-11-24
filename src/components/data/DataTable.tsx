import * as React from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

export interface Column<T> {
  id: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  className?: string;
  cardRender?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  sortBy,
  sortOrder = 'asc',
  onSort,
  onRowClick,
  emptyMessage = 'No records found.',
  pageSize = 20,
  currentPage = 1,
  onPageChange,
  totalCount,
  className,
  cardRender,
}: DataTableProps<T>) {
  const totalItems = totalCount !== undefined ? totalCount : data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn('w-full border border-sand-subtle bg-sand-card overflow-hidden shadow-2xs', className)}>
      {/* Mobile Card Mode (< 768px) */}
      <div className="block md:hidden divide-y divide-sand-subtle">
        {data.length === 0 ? (
          <div className="p-8 text-center text-sm font-sans text-charcoal-muted">
            {emptyMessage}
          </div>
        ) : (
          data.map((item) => (
            <div
              key={keyExtractor(item)}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }
                  : undefined
              }
              className={cn(
                'p-4 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-sand/50 active:bg-sand focus-visible:ring-2 focus-visible:ring-tide'
              )}
            >
              {cardRender ? (
                cardRender(item)
              ) : (
                <div className="space-y-2">
                  {columns.map((col) => (
                    <div key={col.id} className="flex justify-between items-baseline gap-2 text-xs">
                      <span className="font-sans font-medium text-charcoal-muted uppercase tracking-wider">
                        {col.header}
                      </span>
                      <span className="font-sans text-charcoal font-normal text-right">
                        {col.cell(item)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-sand-subtle bg-sand/60 text-charcoal-muted font-bold text-[11px] uppercase tracking-wider">
              {columns.map((col) => {
                const isSorted = sortBy === col.id;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn(
                      'py-3.5 px-4 text-xs font-sans font-semibold uppercase tracking-[0.1em] select-none',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.className
                    )}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.id)}
                        className="inline-flex items-center gap-1 hover:text-charcoal font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tide"
                        aria-label={`Sort by ${col.id}`}
                      >
                        <span>{col.header}</span>
                        {isSorted && (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-subtle">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-sm font-sans text-charcoal-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(item);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    'h-14 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-sand/40 active:bg-sand/60 focus-visible:ring-2 focus-visible:ring-tide'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        'py-3 px-4 text-charcoal font-sans',
                        col.align === 'right' && 'text-right tabular-nums',
                        col.align === 'center' && 'text-center',
                        col.className
                      )}
                    >
                      {col.cell(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-sand-subtle bg-sand/40 text-xs font-sans text-charcoal-muted">
          <span>
            Showing {startIndex}–{endIndex} of {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            <span className="px-2 font-medium">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next Page"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
