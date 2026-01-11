"use client";

export function calculatePageSize(
  layoutType: 'list' | 'grid-2' | 'grid-3' | 'expanded' = 'list',
  viewportHeight?: number
): number {
  // Use window height if not provided
  const height = viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 768);
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;

  // Breakpoints
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  // Base page sizes by layout and device
  const pageSizes = {
    list: {
      mobile: 5,
      tablet: 10,
      desktop: 20,
    },
    'grid-2': {
      mobile: 4,
      tablet: 10,
      desktop: 12,
    },
    'grid-3': {
      mobile: 3,
      tablet: 9,
      desktop: 15,
    },
    expanded: {
      mobile: 3,
      tablet: 6,
      desktop: 8,
    },
  };

  let baseSize: number;

  if (isMobile) {
    baseSize = pageSizes[layoutType].mobile;
  } else if (isTablet) {
    baseSize = pageSizes[layoutType].tablet;
  } else {
    baseSize = pageSizes[layoutType].desktop;
  }

  // Adjust for tall screens
  if (height > 900) {
    baseSize = Math.ceil(baseSize * 1.25);
  }

  // For grid layouts, ensure size is a multiple of columns
  if (layoutType === 'grid-2') {
    baseSize = Math.ceil(baseSize / 2) * 2;
  } else if (layoutType === 'grid-3') {
    baseSize = Math.ceil(baseSize / 3) * 3;
  }

  return Math.max(3, baseSize); // Minimum 3 items
}

export function useResponsivePageSize(
  layoutType: 'list' | 'grid-2' | 'grid-3' | 'expanded' = 'list'
): number {
  if (typeof window === 'undefined') {
    // SSR default
    return layoutType === 'list' ? 20 : 12;
  }

  return calculatePageSize(layoutType, window.innerHeight);
}
