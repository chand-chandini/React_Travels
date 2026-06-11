import React, { useState } from 'react'
import { Search, Filter, Calendar, Users, MapPin, X } from 'lucide-react'

const SearchFilters = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
    busType: 'all',
    priceRange: [0, 1000]
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const clearFilters = () => {
    setFilters({
      origin: '',
      destination: '',
      date: '',
      passengers: 1,
      busType: 'all',
      priceRange: [0, 1000]
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="origin"
              value={filters.origin}
              onChange={handleChange}
              placeholder="Departure City"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="destination"
              value={filters.destination}
              onChange={handleChange}
              placeholder="Arrival City"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passengers
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="passengers"
              min="1"
              max="10"
              value={filters.passengers}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
        >
          <Filter className="w-5 h-5" />
          <span>Advanced Filters</span>
        </button>

        <div className="space-x-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear All
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
          >
            Search Buses
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus Type
              </label>
              <select
                name="busType"
                value={filters.busType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="ac">AC</option>
                <option value="non-ac">Non-AC</option>
                <option value="sleeper">Sleeper</option>
                <option value="seater">Seater</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (₹)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters({...filters, priceRange: [parseInt(e.target.value), filters.priceRange[1]]})}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFilters