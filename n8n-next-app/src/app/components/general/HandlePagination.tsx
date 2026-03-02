"use client";

import React, { Dispatch, SetStateAction } from 'react'

import { Button } from '@/app/components/ui/button'



interface HandlePaginationProps {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

const HandlePagination = ({ page, setPage, totalPages }: HandlePaginationProps) => {
    if(!totalPages || totalPages <=1) return null;

    const handlePre = () => setPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

    return (
      <div className="mt-8 flex items-center justify-center gap-3">
        <Button variant="outline" onClick={handlePre} disabled={page <= 1}>
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium text-foreground">{page}</span> of{' '}
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>
        <Button variant="outline" onClick={handleNext} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    )
}

export default HandlePagination

