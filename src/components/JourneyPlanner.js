import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTrain, FaMapMarkerAlt, FaSearch, FaTimes } from 'react-icons/fa';
import { AiOutlineSwap } from 'react-icons/ai';
import debounce from 'lodash.debounce'; // Ensure lodash.debounce is installed

function JourneyPlanner() {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Autocomplete states
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);

  // Refs for handling clicks outside the suggestion lists
  const departureRef = useRef();
  const arrivalRef = useRef();

  // Debounced functions to fetch station suggestions
  const fetchDepartureSuggestions = debounce((query) => {
    if (query.length < 2) {
      setDepartureSuggestions([]);
      return;
    }
    axios
      .get(`https://api.irail.be/stations/?input=${query}&format=json`)
      .then((response) => {
        setDepartureSuggestions(response.data.station);
      })
      .catch((error) => {
        console.error('Error fetching departure stations:', error);
      });
  }, 300);

  const fetchArrivalSuggestions = debounce((query) => {
    if (query.length < 2) {
      setArrivalSuggestions([]);
      return;
    }
    axios
      .get(`https://api.irail.be/stations/?input=${query}&format=json`)
      .then((response) => {
        setArrivalSuggestions(response.data.station);
      })
      .catch((error) => {
        console.error('Error fetching arrival stations:', error);
      });
  }, 300);

  // Handle input changes for departure
  const handleDepartureChange = (e) => {
    const value = e.target.value;
    setDeparture(value);
    fetchDepartureSuggestions(value);
    setShowDepartureSuggestions(true);
  };

  // Handle input changes for arrival
  const handleArrivalChange = (e) => {
    const value = e.target.value;
    setArrival(value);
    fetchArrivalSuggestions(value);
    setShowArrivalSuggestions(true);
  };

  // Handle selection of a departure suggestion
  const selectDeparture = (station) => {
    setDeparture(station.name);
    setDepartureSuggestions([]);
    setShowDepartureSuggestions(false);
  };

  // Handle selection of an arrival suggestion
  const selectArrival = (station) => {
    setArrival(station.name);
    setArrivalSuggestions([]);
    setShowArrivalSuggestions(false);
  };

  // Close suggestion lists when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departureRef.current && !departureRef.current.contains(event.target)) {
        setShowDepartureSuggestions(false);
      }
      if (arrivalRef.current && !arrivalRef.current.contains(event.target)) {
        setShowArrivalSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleJourneyPlanner = () => {
    // Reset previous states
    setConnections([]);
    setError('');

    // Basic form validation
    if (!departure.trim() || !arrival.trim()) {
      setError('Please enter both departure and arrival stations.');
      return;
    }

    setLoading(true);
    axios
      .get(
        `https://api.irail.be/connections/?from=${encodeURIComponent(
          departure
        )}&to=${encodeURIComponent(arrival)}&format=json`
      )
      .then((response) => {
        const fetchedConnections = response.data.connection;
        setConnections(fetchedConnections);
        if (fetchedConnections.length === 0) {
          setError('No connections found for the given stations.');
        }
      })
      .catch((error) => {
        console.error('Error fetching journey planner:', error);
        setError('Failed to fetch connections. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Corrected formatDuration function assuming duration is in seconds
  const formatDuration = (durationStr) => {
    const durationInSeconds = parseInt(durationStr, 10);
    if (isNaN(durationInSeconds) || durationInSeconds < 0) {
      return 'N/A';
    }
    const totalMinutes = Math.floor(durationInSeconds / 60);
    const remainingSeconds = durationInSeconds % 60;

    // Optionally, include seconds if needed
    // return `${totalMinutes} mins ${remainingSeconds} secs`;

    return `${totalMinutes} mins`;
  };

  // Function to get number of transfers
  const getTransfers = (connection) => {
    // Assuming transfers are available in connection.transfers
    return connection.transfers;
  };

  // Function to swap departure and arrival
  const swapStations = () => {
    const temp = departure;
    setDeparture(arrival);
    setArrival(temp);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 flex items-center justify-center">
        <FaTrain className="mr-2" /> Journey Planner
      </h1>

      {/* Form Section */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        {/* Departure Input */}
        <div className="relative w-full md:w-1/2" ref={departureRef}>
          <div className="flex items-center">
            <FaMapMarkerAlt className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Departure station"
              value={departure}
              onChange={handleDepartureChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onFocus={() => setShowDepartureSuggestions(true)}
            />
            {departure && (
              <FaTimes
                className="absolute right-3 text-gray-400 cursor-pointer"
                onClick={() => {
                  setDeparture('');
                  setDepartureSuggestions([]);
                }}
              />
            )}
          </div>
          {/* Departure Suggestions */}
          {showDepartureSuggestions && departureSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {departureSuggestions.map((station, index) => (
                <li
                  key={index}
                  onClick={() => selectDeparture(station)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {station.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Swap Button */}
        <button
          onClick={swapStations}
          className="mt-4 md:mt-0 p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200"
          title="Swap Departure and Arrival"
        >
          <AiOutlineSwap size={24} />
        </button>

        {/* Arrival Input */}
        <div className="relative w-full md:w-1/2" ref={arrivalRef}>
          <div className="flex items-center">
            <FaMapMarkerAlt className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Arrival station"
              value={arrival}
              onChange={handleArrivalChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onFocus={() => setShowArrivalSuggestions(true)}
            />
            {arrival && (
              <FaTimes
                className="absolute right-3 text-gray-400 cursor-pointer"
                onClick={() => {
                  setArrival('');
                  setArrivalSuggestions([]);
                }}
              />
            )}
          </div>
          {/* Arrival Suggestions */}
          {showArrivalSuggestions && arrivalSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {arrivalSuggestions.map((station, index) => (
                <li
                  key={index}
                  onClick={() => selectArrival(station)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {station.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Plan Journey Button */}
        <button
          onClick={handleJourneyPlanner}
          className="w-full md:w-auto px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200 flex items-center justify-center"
        >
          <FaSearch className="mr-2" /> Plan Journey
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span className="ml-2 text-blue-600">Loading...</span>
        </div>
      )}

      {/* Display connections */}
      {!loading && connections.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-500 flex items-center">
            <FaTrain className="mr-2" /> Available Connections
          </h2>
          <ul className="space-y-4">
            {connections.map((connection, index) => (
              <li
                key={index}
                className="p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  {/* Departure Information */}
                  <div>
                    <p className="text-lg font-medium text-gray-800 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-green-500" />{' '}
                      {connection.departure.station}
                    </p>
                    <p className="text-sm text-gray-500">
                      Departure:{' '}
                      {new Date(connection.departure.time * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <span className="text-xl text-gray-400">→</span>

                  {/* Arrival Information */}
                  <div>
                    <p className="text-lg font-medium text-gray-800 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-red-500" />{' '}
                      {connection.arrival.station}
                    </p>
                    <p className="text-sm text-gray-500">
                      Arrival:{' '}
                      {new Date(connection.arrival.time * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-2 flex justify-between text-sm text-gray-600">
                  <span>
                    <strong>Duration:</strong> {formatDuration(connection.duration)}
                  </span>
                  <span>
                    <strong>Transfers:</strong> {getTransfers(connection)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default JourneyPlanner;
