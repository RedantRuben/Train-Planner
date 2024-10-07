import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        className="p-2 border rounded w-full"
        placeholder="Search for a station..."
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
}

export default SearchBar;
