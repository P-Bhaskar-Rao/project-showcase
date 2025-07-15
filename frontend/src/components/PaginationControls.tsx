import React from "react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ page, totalPages, onPageChange }: PaginationControlsProps) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-emerald-600 text-white' : 'bg-white'}`}
          onClick={() => onPageChange(p)}
          disabled={p === page}
        >
          {p}
        </button>
      ))}
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls; 