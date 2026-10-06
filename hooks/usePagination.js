"use client";

import { useState } from "react";

export default function usePagination(items, initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const changePageSize = (nextPageSize) => {
    setPageSize(nextPageSize);
    setPage(1);
  };
  const goToFirstPage = () => setPage(1);

  return {
    currentPage,
    pageSize,
    visibleItems,
    setPage,
    changePageSize,
    goToFirstPage,
  };
}
