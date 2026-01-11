"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface PaginationResult<T> {
  paginatedItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsePaginationOptions {
  defaultItemsPerPage?: number;
  persistInUrl?: boolean;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): PaginationResult<T> {
  const {
    defaultItemsPerPage = 10,
    persistInUrl = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL params if persistInUrl is true
  const urlPage = persistInUrl ? parseInt(searchParams.get('page') || '1') : 1;
  const urlSize = persistInUrl ? parseInt(searchParams.get('size') || String(defaultItemsPerPage)) : defaultItemsPerPage;

  const [currentPage, setCurrentPageState] = useState(urlPage);
  const [itemsPerPage, setItemsPerPageState] = useState(urlSize);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Ensure current page is within bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPageState(totalPages);
    } else if (currentPage < 1) {
      setCurrentPageState(1);
    }
  }, [currentPage, totalPages]);

  // Update URL when page or size changes
  useEffect(() => {
    if (!persistInUrl) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage));
    params.set('size', String(itemsPerPage));
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentPage, itemsPerPage, persistInUrl, pathname, router, searchParams]);

  // Calculate paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  // Page navigation functions
  const setCurrentPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPageState(validPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setItemsPerPage = (size: number) => {
    setItemsPerPageState(size);
    setCurrentPageState(1); // Reset to first page when changing page size
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage(currentPage + 1);
  const goToPreviousPage = () => setCurrentPage(currentPage - 1);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems: items.length,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
  };
}
