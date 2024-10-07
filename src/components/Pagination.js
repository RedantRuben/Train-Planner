import React from 'react';

function Pagination({ stationsPerPage, totalStations, paginate, currentPage }) {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalStations / stationsPerPage);

  const startPage = Math.max(1, currentPage - 3);
  const endPage = Math.min(totalPages, currentPage + 3);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-4 flex justify-center items-center space-x-2">
      {currentPage > 1 && (
        <button
          onClick={() => paginate(currentPage - 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          &lt;
        </button>
      )}

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`px-3 py-1 rounded ${number === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {number}
        </button>
      ))}

      {currentPage < totalPages && (
        <button
          onClick={() => paginate(currentPage + 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          &gt;
        </button>
      )}
    </nav>
  );
}

export default Pagination;
