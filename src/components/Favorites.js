import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaTrash } from 'react-icons/fa';
import axios from 'axios';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  useEffect(() => {
    if (favorites.length > 0) {
      const fetchStations = async () => {
        try {
          const promises = favorites.map(id => axios.get(`https://api.irail.be/stations/?format=json&id=${id}&lang=en`));
          const responses = await Promise.all(promises);
          const stationsData = responses.map(response => response.data.station[0]);
          setFavoriteStations(stationsData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching favorite stations:', error);
          setLoading(false);
        }
      };
      fetchStations();
    } else {
      setFavoriteStations([]);
      setLoading(false);
    }
  }, [favorites]);

  const removeFavorite = (id) => {
    const updatedFavorites = favorites.filter((fav) => fav !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  if (loading) {
    return <p className="text-center mt-6">Loading favorites...</p>;
  }

  if (favorites.length === 0) {
    return <p className="text-center mt-6">No favorite stations added yet.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaStar className="mr-2 text-yellow-400" />
        Your Favorite Stations
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {favoriteStations.map((station) => (
          <div key={station.id} className="p-6 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold flex items-center">
              {station.name}
              <FaStar className="ml-2 text-yellow-400" />
            </h2>
            <p className="text-gray-600 mt-2">Region: {station.standardname.split('-')[0] || 'N/A'}</p>
            <div className="flex space-x-3 mt-4">
              <Link
                to={`/station/${station.id}`}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
              >
                View Station
              </Link>
              <button
                onClick={() => removeFavorite(station.id)}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
              >
                <FaTrash className="mr-2" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
