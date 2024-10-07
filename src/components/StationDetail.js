import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaClock, FaTrain, FaExternalLinkAlt } from 'react-icons/fa';

function StationDetail() {
  const { id } = useParams();
  const [liveboard, setLiveboard] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch station data on mount
  useEffect(() => {
    axios
      .get(`https://api.irail.be/liveboard/?id=BE.NMBS.${id}&format=json&arrdep=departure`)
      .then((response) => {
        setLiveboard(response.data.departures.departure);
      })
      .catch((error) => {
        console.error('Error fetching liveboard:', error);
      });

    // Check if the station is a favorite
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
    setIsFavorite(storedFavorites.includes(id));
  }, [id]);

  // Toggle favorite status for the station
  const toggleFavorite = () => {
    let updatedFavorites = [...favorites];
    if (isFavorite) {
      updatedFavorites = updatedFavorites.filter(fav => fav !== id);
    } else {
      updatedFavorites.push(id);
    }
    setFavorites(updatedFavorites);
    setIsFavorite(!isFavorite);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Calculate delay in minutes and apply color-coding
  const renderDelay = (delay) => {
    if (delay === 0) return <span className="text-green-500">On time</span>;
    const delayInMinutes = Math.floor(delay / 60);
    return (
      <span className="text-red-500">
        {delayInMinutes} min delay <FaClock className="inline ml-1" />
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Station Details</h1>

      {/* Favorite Station Button */}
      <button
        onClick={toggleFavorite}
        className={`mt-2 px-4 py-2 rounded ${isFavorite ? 'bg-yellow-500' : 'bg-gray-200'} hover:bg-yellow-600 transition duration-200 flex items-center`}
      >
        <FaStar className="mr-1" /> {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>

      {liveboard ? (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {liveboard.map((train) => (
            <div key={train.vehicle} className="p-4 border rounded hover:bg-gray-100">
              <p>
                <FaTrain className="inline mr-1" /> Train <strong>{train.vehicle}</strong> to <strong>{train.station}</strong>
              </p>
              <p>Departure time: {new Date(train.time * 1000).toLocaleTimeString()}</p>
              <p>Delay: {renderDelay(train.delay)}</p>

              {/* Buy Ticket Button */}
              <a
                href={`https://www.belgiantrain.be/en/search`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
              >
                Buy Ticket <FaExternalLinkAlt className="inline ml-1" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading train data...</p>
      )}
    </div>
  );
}

export default StationDetail;
