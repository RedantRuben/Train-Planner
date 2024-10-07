// src/components/StationsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Ensure Link is imported
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa'; // Added FaMapMarkerAlt icon
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';
import image4 from '../assets/image4.jpg';
import image5 from '../assets/image5.jpg';
import image6 from '../assets/image6.jpg';
import image7 from '../assets/image7.jpg';
import image8 from '../assets/image8.jpg';
import image9 from '../assets/image9.jpg';
import image10 from '../assets/image10.jpg';

const images = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10];

function StationsList() {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stationsPerPage] = useState(20);
  const [userLocation, setUserLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Fetch stations on load
  useEffect(() => {
    axios.get('https://api.irail.be/stations/?format=json&lang=en')
      .then(response => {
        // Ensure each station has a unique id
        const uniqueStations = response.data.station.filter((station, index, self) =>
          index === self.findIndex((s) => (
            s.id === station.id
          ))
        );
        setStations(uniqueStations);
        setFilteredStations(uniqueStations);
      })
      .catch(error => {
        console.error('Error fetching stations:', error);
      });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location', error);
        }
      );
    }

    // Fetch favorites from localStorage
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  // Sort stations by proximity once location is available
  useEffect(() => {
    if (userLocation && stations.length > 0) {
      const sortedStations = [...stations].sort((a, b) => {
        const distanceA = getDistanceFromLatLonInKm(
          userLocation.latitude, userLocation.longitude,
          parseFloat(a.locationY), parseFloat(a.locationX)
        );
        const distanceB = getDistanceFromLatLonInKm(
          userLocation.latitude, userLocation.longitude,
          parseFloat(b.locationY), parseFloat(b.locationX)
        );
        return distanceA - distanceB;
      });
      setFilteredStations(sortedStations);
    }
  }, [userLocation, stations]);

  // Function to calculate the distance between two coordinates (Haversine formula)
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleSearch = (query) => {
    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStations(filtered);
    setCurrentPage(1); // Reset to first page on search
  };

  const indexOfLastStation = currentPage * stationsPerPage;
  const indexOfFirstStation = indexOfLastStation - stationsPerPage;
  const currentStations = filteredStations.slice(indexOfFirstStation, indexOfLastStation);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  // Toggle favorite status for the station
  const toggleFavorite = (id) => {
    let updatedFavorites = [...favorites];
    if (updatedFavorites.includes(id)) {
      updatedFavorites = updatedFavorites.filter(fav => fav !== id);
    } else {
      updatedFavorites.push(id);
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaMapMarkerAlt className="mr-2 text-blue-500" />
        Belgium Train Stations
      </h1>
      <SearchBar onSearch={handleSearch} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentStations.map(station => (
          <div key={station.id} className="p-6 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img src={getRandomImage()} alt="Station" className="w-full h-48 object-cover rounded mb-4" />
            <div>
              <h2 className="text-2xl font-semibold flex items-center">
                {station.name}
                <FaStar
                  className={`ml-2 cursor-pointer ${favorites.includes(station.id) ? 'text-yellow-400' : 'text-gray-400'}`}
                  onClick={() => toggleFavorite(station.id)}
                  title={favorites.includes(station.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                />
              </h2>
              <p className="text-gray-600 mt-2">Region: {station.standardname.split('-')[0] || "N/A"}</p>
              <div className="flex space-x-3 mt-4">
                <Link
                  to={`/station/${station.id}`}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  View Station
                </Link>
                <button
                  onClick={() => toggleFavorite(station.id)}
                  className={`flex items-center px-4 py-2 rounded transition-colors duration-200 ${
                    favorites.includes(station.id)
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  <FaStar className="mr-2" />
                  {favorites.includes(station.id) ? 'Unfavorite' : 'Favorite'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        stationsPerPage={stationsPerPage}
        totalStations={filteredStations.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
}

export default StationsList;
