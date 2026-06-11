import React, { useState } from 'react'
import { X, CreditCard, Wallet, Building2 } from 'lucide-react'

const PaymentModal = ({ amount, busDetails, onPaymentSuccess, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setProcessing(true)
    
    // For demo purposes - integrate with actual Razorpay
    // In production, get order ID from your backend
    const res = await loadRazorpayScript()
    
    if (!res) {
      alert('Razorpay SDK failed to load. Check your internet connection.')
      setProcessing(false)
      return
    }

    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // Get from Razorpay Dashboard
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'BusTravels',
      description: `Bus Ticket Booking - ${busDetails.bus_name}`,
      image: '/bus-logo.png',
      handler: function (response) {
        // Payment successful
        onPaymentSuccess(response)
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#3B82F6'
      }
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
    setProcessing(false)
  }

  const methods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI', icon: Wallet },
    { id: 'netbanking', name: 'Net Banking', icon: Building2 },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Payment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600">₹{amount}</p>
          </div>

          <div className="space-y-3 mb-6">
            <p className="font-semibold mb-2">Select Payment Method</p>
            {methods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <method.icon className="w-5 h-5 mr-3 text-gray-600" />
                <span>{method.name}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay ₹${amount}`}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal