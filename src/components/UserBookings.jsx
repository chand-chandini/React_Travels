import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, Bus, Armchair, Clock, AlertCircle, Ticket, XCircle, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

const UserBookings = ({ token, userId }) => {
    const [bookings, setBookings] = useState([])
    const [bookingError, setBookingError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [cancelReason, setCancelReason] = useState('')

    useEffect(() => {
        fetchBookings()
    }, [userId, token])

    const fetchBookings = async () => {
        if (!token || !userId) {
            setLoading(false)
            return
        }
        try {
            const response = await axios.get(`http://localhost:8000/api/user/${userId}/bookings/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setBookings(response.data)
            setLoading(false)
        } catch (error) {
            console.log("Error fetching bookings:", error)
            setBookingError(error.response?.data?.message || "Failed to fetch bookings")
            setLoading(false)
        }
    }

    const handleCancelBooking = async () => {
        if (!selectedBooking) return
        
        setCancelling(selectedBooking.id)
        try {
            const response = await axios.post(
                `http://localhost:8000/api/bookings/${selectedBooking.id}/cancel/`,
                { reason: cancelReason },
                { headers: { Authorization: `Token ${token}` } }
            )
            
            if (response.data.refund) {
                const refund = response.data.refund
                alert(`${response.data.message}\n\nRefund Amount: ₹${refund.amount}\nRefund Percentage: ${refund.percentage}%\nStatus: ${refund.status}`)
            } else {
                alert(response.data.message)
            }
            
            setShowCancelModal(false)
            setCancelReason('')
            setSelectedBooking(null)
            fetchBookings() // Refresh the list
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to cancel booking')
        } finally {
            setCancelling(null)
        }
    }

    const getRefundStatusBadge = (booking) => {
        if (booking.refund_status === 'completed' && booking.refund_amount > 0) {
            return (
                <div className="bg-green-100 p-2 rounded-lg">
                    <p className="text-sm text-green-700">
                        <strong>Refunded:</strong> ₹{booking.refund_amount}
                    </p>
                </div>
            )
        } else if (booking.refund_status === 'completed' && booking.refund_amount === 0) {
            return (
                <div className="bg-gray-100 p-2 rounded-lg">
                    <p className="text-sm text-gray-700">No refund applicable</p>
                </div>
            )
        } else if (booking.refund_status === 'processing') {
            return (
                <div className="bg-yellow-100 p-2 rounded-lg">
                    <p className="text-sm text-yellow-700">Refund processing...</p>
                </div>
            )
        } else if (booking.refund_status === 'failed') {
            return (
                <div className="bg-red-100 p-2 rounded-lg">
                    <p className="text-sm text-red-700">Refund failed. Contact support.</p>
                </div>
            )
        }
        return null
    }

    if (!token || !userId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-600 mb-6">Please login to view your bookings</p>
                    <Link to="/login" className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold">
                        <span>Go to Login</span>
                    </Link>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your bookings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                        <Ticket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
                    <p className="text-gray-600">View and manage your bookings</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                        <p className="text-gray-600 mb-6">You haven't booked any tickets yet.</p>
                        <Link to="/" className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold">
                            <span>Browse Buses</span>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                <div className={`px-6 py-3 ${booking.status === 'cancelled' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                                    <div className="flex justify-between items-center">
                                        <p className="text-white font-semibold">Booking ID: #{booking.id}</p>
                                        {booking.status === 'cancelled' ? (
                                            <span className="bg-red-700 text-white px-3 py-1 rounded-full text-sm">Cancelled</span>
                                        ) : (
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">{booking.status}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3">
                                            <Bus className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Bus</p>
                                                <p className="font-semibold text-gray-900">{booking.bus}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Armchair className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Seat Number</p>
                                                <p className="font-semibold text-gray-900">{booking.seat?.seat_number || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <DollarSign className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Amount Paid</p>
                                                <p className="font-semibold text-gray-900">₹{booking.total_amount}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Booking Date</p>
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(booking.booking_time).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Refund Info */}
                                    {booking.status === 'cancelled' && getRefundStatusBadge(booking)}
                                    
                                    {/* Cancel Button */}
                                    {booking.status !== 'cancelled' && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking)
                                                    setShowCancelModal(true)
                                                }}
                                                className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                <span>Cancel Booking</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Booking Modal */}
            {showCancelModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this booking?
                        </p>
                        
                        {/* Cancellation Policy */}
                        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-yellow-800 mb-2">Cancellation Policy:</p>
                            <ul className="text-xs text-yellow-700 space-y-1">
                                <li>• 100% refund if cancelled 48+ hours before departure</li>
                                <li>• 75% refund if cancelled 24-48 hours before</li>
                                <li>• 50% refund if cancelled 12-24 hours before</li>
                                <li>• 25% refund if cancelled 2-12 hours before</li>
                                <li>• No refund if cancelled less than 2 hours before</li>
                            </ul>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for cancellation (optional)
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Tell us why you're cancelling..."
                            />
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false)
                                    setSelectedBooking(null)
                                    setCancelReason('')
                                }}
                                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                disabled={cancelling === selectedBooking.id}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                            >
                                {cancelling === selectedBooking.id ? 'Processing...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserBookings