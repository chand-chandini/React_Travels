import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Bus, Clock, MapPin, ArrowRight, Eye } from 'lucide-react'
import SearchFilters from './SearchFilters'
import RatingStars from './RatingStars'

const BusList = () => {
    const [allBuses, setAllBuses] = useState([])
    const [filteredBuses, setFilteredBuses] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/buses/`)
                setAllBuses(response.data)
                setFilteredBuses(response.data)
                setLoading(false)
            } catch (error) {
                console.log('Error fetching buses:', error)
                setLoading(false)
            }
        }
        fetchBuses()
    }, [])

    const handleSearch = (filters) => {
        let filtered = [...allBuses]

        if (filters.origin && filters.origin.trim() !== '') {
            filtered = filtered.filter(bus => 
                bus.origin.toLowerCase().includes(filters.origin.toLowerCase())
            )
        }

        if (filters.destination && filters.destination.trim() !== '') {
            filtered = filtered.filter(bus => 
                bus.destination.toLowerCase().includes(filters.destination.toLowerCase())
            )
        }

        if (filters.busType && filters.busType !== 'all') {
            filtered = filtered.filter(bus => 
                bus.bus_type?.toLowerCase() === filters.busType.toLowerCase()
            )
        }

        if (filters.priceRange) {
            filtered = filtered.filter(bus => 
                bus.price >= filters.priceRange[0] && bus.price <= filters.priceRange[1]
            )
        }

        setFilteredBuses(filtered)
    }

    const handleViewSeats = (id) => {
        navigate(`/bus/${id}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading buses...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Buses</h1>
                    <p className="text-gray-600">Find and book your next journey with us</p>
                </div>

                {/* SearchFilters Component - For searching/filtering */}
                <SearchFilters onSearch={handleSearch} />

                <div className="mb-4">
                    <p className="text-gray-600">
                        Found <span className="font-bold text-blue-600">{filteredBuses.length}</span> buses
                    </p>
                </div>

                {filteredBuses.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <Bus className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No buses found</h3>
                        <p className="text-gray-600">Try adjusting your search filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBuses.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-white">{item.bus_name}</h2>
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                                            {item.number}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">From</p>
                                                <p className="font-semibold text-gray-900">{item.origin}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-5 h-5 text-red-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">To</p>
                                                <p className="font-semibold text-gray-900">{item.destination}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Start Time</p>
                                                <p className="text-sm font-medium text-gray-900">{item.start_time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Reach Time</p>
                                                <p className="text-sm font-medium text-gray-900">{item.reach_time}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* RatingStars Component - Show rating */}
                                    <div className="flex justify-between items-center pt-2">
                                        <RatingStars 
                                            rating={item.average_rating || 4} 
                                            readonly={true}
                                        />
                                        <span className="text-xs text-gray-500">
                                            {item.total_reviews || 128} reviews
                                        </span>
                                    </div>
                                    
                                    {item.price && (
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Price per seat</p>
                                            <p className="text-xl font-bold text-blue-600">₹{item.price}</p>
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleViewSeats(item.id)}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <Eye className="w-5 h-5" />
                                        <span>View Seats</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BusList