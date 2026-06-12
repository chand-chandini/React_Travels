import React, { useState } from 'react'
import { Tag, CheckCircle, XCircle, Percent } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://bus-travel-api.onrender.com/api'

const CouponInput = ({ amount, token, onCouponApplied }) => {
    const [couponCode, setCouponCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await axios.post(
                `${API_URL}/validate-coupon/`,
                { 
                    code: couponCode,
                    amount: parseFloat(amount) || 0
                },
                { headers: { Authorization: `Token ${token}` } }
            )

            if (response.data.valid) {
                onCouponApplied({
                    code: response.data.code,
                    discount_percent: response.data.discount_percent,
                    discount_amount: parseFloat(response.data.discount_amount),
                    final_amount: parseFloat(response.data.final_amount)
                })
                setError(null)
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Invalid coupon code')
            onCouponApplied(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
                <Tag className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-700">Apply Coupon</span>
            </div>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
                <button
                    onClick={applyCoupon}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition flex items-center space-x-1 text-sm"
                >
                    {loading ? '...' : <><Percent className="w-4 h-4" /><span>Apply</span></>}
                </button>
            </div>

            {error && (
                <div className="mt-2 text-red-600 text-xs flex items-center space-x-1">
                    <XCircle className="w-3 h-3" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}

export default CouponInput