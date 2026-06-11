import React from 'react'
import { X, Download, CheckCircle, Bus, Calendar, Clock, MapPin, Armchair } from 'lucide-react'
import html2pdf from 'html2pdf.js'

const BookingConfirmation = ({ booking, onClose }) => {
  const downloadTicket = () => {
    const element = document.getElementById('ticket-content')
    const opt = {
      margin: 1,
      filename: `ticket_${booking.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(element).save()
  }

  // Safely access nested properties with fallbacks
  const busDetails = booking.bus || {}
  const seatDetails = booking.seat || {}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Booking Confirmed!</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div id="ticket-content" className="p-6">
          {/* Ticket Header */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl">
              <Bus className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-2xl font-bold">BusTravels Ticket</h3>
              <p className="text-sm">Booking ID: #{booking.id}</p>
            </div>
          </div>

          {/* Journey Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="font-semibold text-lg">{busDetails.origin || 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {busDetails.start_time || 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">To</p>
                <p className="font-semibold text-lg">{busDetails.destination || 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {busDetails.reach_time || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Bus Name</p>
                <p className="font-semibold">{busDetails.bus_name || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Bus Number</p>
                <p className="font-semibold">{busDetails.number || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Seat Number</p>
                <p className="font-semibold text-xl text-blue-600">{seatDetails.seat_number || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Travel Date</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Price if available */}
            {busDetails.price && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="font-bold text-xl text-blue-600">₹{busDetails.price}</p>
              </div>
            )}
          </div>

          {/* Passenger Details */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Passenger Details</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p><span className="text-gray-500">Name:</span> {booking.user || 'Guest'}</p>
              <p><span className="text-gray-500">Booking Time:</span> {booking.booking_time ? new Date(booking.booking_time).toLocaleString() : new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
            <p className="font-semibold mb-1">Terms & Conditions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Please report 30 minutes before departure</li>
              <li>Carry a valid ID proof</li>
              <li>This ticket is non-transferable</li>
              <li>No refunds on cancellation</li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex space-x-3">
          <button
            onClick={downloadTicket}
            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download Ticket (PDF)</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Add this missing import at the top
import { ArrowRight } from 'lucide-react'

export default BookingConfirmation