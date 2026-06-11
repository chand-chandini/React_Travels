import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { Bus, MapPin, Clock, ChevronLeft, Armchair, XCircle, Star, CreditCard } from 'lucide-react'
import BookingConfirmation from './BookingConfirmation'
import RatingStars from './RatingStars'
import CouponInput from './CouponInput'

const BusSeats = ({ token }) => {
    const [bus, setBus] = useState(null)
    const [seats, setSeats] = useState([])
    const [loading, setLoading] = useState(true)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [confirmedBooking, setConfirmedBooking] = useState(null)
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [userRating, setUserRating] = useState(0)
    const [hasRated, setHasRated] = useState(false)
    const [selectedSeat, setSelectedSeat] = useState(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const { busId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        fetchBusDetails()
    }, [busId])

    const fetchBusDetails = async () => {
        try {
            const response = await axios(`http://localhost:8000/api/buses/${busId}`)
            setBus(response.data)
            setSeats(response.data.seats || [])
            setLoading(false)
        } catch (error) {
            console.log('Error:', error)
            setLoading(false)
        }
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const initiatePayment = async (seatId) => {
        if (!token) {
            alert("Please login first")
            navigate('/login')
            return
        }
        setSelectedSeat(seatId)
        setAppliedCoupon(null)
        setShowPaymentModal(true)
    }

    const handleCouponApplied = (couponData) => {
        setAppliedCoupon(couponData)
    }

    const calculateFinalPrice = () => {
        if (!bus?.price) return 0
        const originalPrice = parseFloat(bus.price)
        if (appliedCoupon && appliedCoupon.final_amount) {
            return parseFloat(appliedCoupon.final_amount)
        }
        return originalPrice
    }

    const finalPrice = calculateFinalPrice()
    const originalPrice = bus?.price ? parseFloat(bus.price) : 0
    const discountAmount = originalPrice - finalPrice

    const processPayment = async () => {
        if (!selectedSeat) return
        
        setProcessing(true)
        
        try {
            const finalAmount = finalPrice
            
            // Step 1: Create booking with authentication header and coupon
            const bookingResponse = await axios.post("http://localhost:8000/api/booking/",
                { 
                    seat: selectedSeat,
                    passenger_name: localStorage.getItem('username') || '',
                    passenger_phone: '',
                    coupon_code: appliedCoupon?.code || null,
                    total_amount: finalAmount
                },
                { 
                    headers: { 
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            )
            
            const bookingId = bookingResponse.data.booking?.id || bookingResponse.data.id
            const amount = finalAmount
            
            // Step 2: Load Razorpay
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                alert('Payment gateway failed to load')
                setProcessing(false)
                return
            }
            
            // Step 3: Create order with authentication header
            const orderResponse = await axios.post("http://localhost:8000/api/payments/create-order/",
                { 
                    booking_id: bookingId, 
                    amount: amount 
                },
                { 
                    headers: { 
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            )
            
            // Step 4: Open Razorpay
            const options = {
                key: orderResponse.data.key,
                amount: orderResponse.data.amount,
                currency: 'INR',
                name: 'BusTravels',
                description: `${bus.bus_name} - Seat ${seats.find(s => s.id === selectedSeat)?.seat_number}${appliedCoupon ? ` (${appliedCoupon.discount_percent}% off)` : ''}`,
                order_id: orderResponse.data.order_id,
                handler: async (response) => {
                    // Step 5: Verify payment with authentication header
                    const verifyResponse = await axios.post("http://localhost:8000/api/payments/callback/", 
                        response,
                        { 
                            headers: { 
                                'Authorization': `Token ${token}`,
                                'Content-Type': 'application/json'
                            } 
                        }
                    )
                    
                    if (verifyResponse.data.status === 'success') {
                        // Get booked seat
                        const bookedSeat = seats.find(seat => seat.id === selectedSeat)
                        
                        // Show confirmation
                        const completeBooking = {
                            id: bookingId,
                            booking_time: new Date().toISOString(),
                            user: localStorage.getItem('username') || 'Guest',
                            seat: bookedSeat,
                            bus: {
                                bus_name: bus.bus_name,
                                number: bus.number,
                                origin: bus.origin,
                                destination: bus.destination,
                                start_time: bus.start_time,
                                reach_time: bus.reach_time,
                                price: bus.price
                            },
                            discount: appliedCoupon ? {
                                code: appliedCoupon.code,
                                percent: appliedCoupon.discount_percent,
                                amount: appliedCoupon.discount_amount
                            } : null,
                            paid_amount: finalAmount
                        }
                        
                        setConfirmedBooking(completeBooking)
                        setShowConfirmation(true)
                        setShowPaymentModal(false)
                        
                        // Update seats
                        setSeats(prevSeats =>
                            prevSeats.map(seat =>
                                seat.id === selectedSeat ? { ...seat, is_booked: true } : seat
                            )
                        )
                    } else {
                        alert('Payment verification failed')
                    }
                    setProcessing(false)
                },
                modal: {
                    ondismiss: () => {
                        setProcessing(false)
                        setShowPaymentModal(false)
                    }
                }
            }
            
            const razorpay = new window.Razorpay(options)
            razorpay.open()
            
        } catch (error) {
            console.error('Payment error:', error)
            if (error.response?.status === 403) {
                alert('Session expired. Please login again.')
                navigate('/login')
            } else {
                alert(error.response?.data?.error || 'Payment failed. Please try again.')
            }
            setProcessing(false)
            setShowPaymentModal(false)
        }
    }

    const handleRatingSubmit = async () => {
        try {
            await axios.post(`http://localhost:8000/api/reviews/`, 
                { bus: busId, rating: userRating, comment: '' },
                { headers: { 'Authorization': `Token ${token}` } }
            )
            alert("Thank you for your rating!")
            setShowRatingModal(false)
            setHasRated(true)
        } catch(error) {
            alert("Failed to submit rating")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading seats...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/')} className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {bus && (
                    <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-white">{bus.bus_name}</h1>
                                    <p className="text-blue-100">Bus: {bus.number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-blue-100">Price</p>
                                    <p className="text-2xl font-bold text-white">₹{bus.price}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">From</p>
                                <p className="font-semibold">{bus.origin}</p>
                                <p className="text-sm">{bus.start_time}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">To</p>
                                <p className="font-semibold">{bus.destination}</p>
                                <p className="text-sm">{bus.reach_time}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-center mb-4">Select Your Seat</h2>
                    <div className="flex justify-center space-x-4 mb-6">
                        <div className="flex items-center"><div className="w-6 h-6 bg-green-500 rounded mr-2"></div><span>Available</span></div>
                        <div className="flex items-center"><div className="w-6 h-6 bg-red-500 rounded mr-2"></div><span>Booked</span></div>
                    </div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-w-2xl mx-auto">
                        {seats.map((seat) => (
                            <button
                                key={seat.id}
                                onClick={() => !seat.is_booked && initiatePayment(seat.id)}
                                disabled={seat.is_booked}
                                className={`p-3 rounded-lg text-center transition-all ${
                                    seat.is_booked 
                                        ? 'bg-red-100 cursor-not-allowed' 
                                        : 'bg-green-100 hover:bg-green-200 hover:scale-105'
                                }`}
                            >
                                <Armchair className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs">{seat.seat_number}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="text-center">
                            <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Complete Payment</h3>
                            <p className="text-gray-600 mb-2">
                                Bus: {bus?.bus_name}<br/>
                                Seat: {seats.find(s => s.id === selectedSeat)?.seat_number}
                            </p>
                            
                            {/* Coupon Input */}
                            {!appliedCoupon && (
                                <CouponInput 
                                    amount={originalPrice} 
                                    token={token}
                                    onCouponApplied={handleCouponApplied}
                                />
                            )}
                            
                            {/* Price Breakdown */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                {appliedCoupon ? (
                                    <>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Original Price:</span>
                                            <span className="font-semibold">₹{originalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2 text-green-600">
                                            <span>Discount ({appliedCoupon.discount_percent}%):</span>
                                            <span>-₹{discountAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Coupon Code:</span>
                                            <span className="font-semibold text-purple-600">{appliedCoupon.code}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <div className="flex justify-between font-bold">
                                                <span>Final Amount:</span>
                                                <span className="text-blue-600 text-lg">₹{finalPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setAppliedCoupon(null)}
                                            className="mt-2 text-sm text-red-500 hover:text-red-700"
                                        >
                                            Remove Coupon
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex justify-between font-bold">
                                        <span>Amount to Pay:</span>
                                        <span className="text-blue-600 text-lg">₹{originalPrice.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={processPayment}
                                disabled={processing}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all mt-4"
                            >
                                {processing ? 'Processing...' : `Pay ₹${finalPrice.toFixed(2)}`}
                            </button>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false)
                                    setAppliedCoupon(null)
                                }}
                                className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                            <p className="text-xs text-gray-400 mt-4">Test Card: 4111 1111 1111 1111</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && confirmedBooking && (
                <BookingConfirmation booking={confirmedBooking} onClose={() => setShowConfirmation(false)} />
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Your Journey</h3>
                        <p className="text-gray-600 mb-4">How was your experience with {bus?.bus_name}?</p>
                        <div className="flex justify-center mb-6">
                            <RatingStars 
                                rating={userRating}
                                onRatingChange={setUserRating}
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRatingSubmit}
                                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BusSeats