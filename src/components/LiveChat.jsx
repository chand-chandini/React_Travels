import React, { useState, useEffect } from 'react'
import { MessageCircle, X, Send, Minimize2, Maximize2, Phone, Mail, HelpCircle, Zap } from 'lucide-react'

const LiveChat = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [showFAQs, setShowFAQs] = useState(false)

    // FAQ Data
    const faqs = [
        { question: "How to cancel my booking?", answer: "Go to 'My Bookings', select the booking and click 'Cancel Booking'. Refund will be processed as per cancellation policy." },
        { question: "What is the refund policy?", answer: "100% refund if cancelled 48+ hours before, 75% for 24-48 hours, 50% for 12-24 hours, 25% for 2-12 hours, no refund for less than 2 hours." },
        { question: "How to download ticket?", answer: "After successful booking, click 'Download Ticket' button in the confirmation modal or find it in 'My Bookings'." },
        { question: "Can I change my seat?", answer: "Seat changes are not allowed after booking. You would need to cancel and rebook." },
        { question: "What payment methods are accepted?", answer: "We accept Credit/Debit Cards, UPI, Net Banking, and Wallets via Razorpay." },
        { question: "How to contact support?", answer: "You can reach us at support@bustravels.com or call +91-XXXXXXXXXX." }
    ]

    const getBusInfo = (from, to, needsAC, needsWater) => {
    // Sample bus data (you can add more buses)
    const allBuses = [
        { name: "Orange Travels AC", time: "06:30 AM", type: "AC", water: true, price: "₹450" },
        { name: "VRL AC Sleeper", time: "08:15 AM", type: "AC", water: true, price: "₹550" },
        { name: "SRS Travels", time: "10:00 AM", type: "Non-AC", water: false, price: "₹300" },
        { name: "KPN AC Volvo", time: "01:30 PM", type: "AC", water: true, price: "₹600" },
        { name: "Morning Star AC", time: "04:45 PM", type: "AC", water: false, price: "₹480" },
        { name: "Raj National", time: "07:00 PM", type: "Non-AC", water: true, price: "₹350" },
        { name: "Sharma Travels AC", time: "09:30 PM", type: "AC", water: true, price: "₹520" },
        { name: "Maharaja AC Sleeper", time: "11:00 PM", type: "AC", water: true, price: "₹580" }
    ]
    
    // Filter buses based on user requirements
    let availableBuses = [...allBuses]
    
    if (needsAC) {
        availableBuses = availableBuses.filter(bus => bus.type === "AC")
    }
    
    if (needsWater) {
        availableBuses = availableBuses.filter(bus => bus.water === true)
    }
    
    // If no buses found
    if (availableBuses.length === 0) {
        return `Sorry, no ${needsAC ? 'AC ' : ''}buses found from ${from} to ${to}${needsWater ? ' with water facility' : ''}. Please try different preferences.`
    }
    
    // Create response message
    let response = `🚍 Available buses from ${from} to ${to}:\n\n`
    
    availableBuses.forEach((bus, index) => {
        response += `${index + 1}. ${bus.name}\n`
        response += `   ⏰ Time: ${bus.time}\n`
        response += `   💺 Type: ${bus.type}\n`
        response += `   💧 Water: ${bus.water ? '✓ Provided' : '✗ Not provided'}\n`
        response += `   💰 Price: ${bus.price}\n\n`
    })
    
    response += `To book a ticket, please:\n`
    response += `• Visit our website\n`
    response += `• Click the WhatsApp button above\n`
    response += `• Or call our helpline`
    
    return response
}

    // Auto-reply responses
    const getAutoReply = (message) => {
    const msg = message.toLowerCase()
    
    // Check if user is asking about buses
    if ((msg.includes('bus') || msg.includes('route')) && (msg.includes('to') || msg.includes('from'))) {
        // Try to find "from" and "to" cities
        const words = message.split(' ')
        let fromCity = ''
        let toCity = ''
        let foundTo = false
        
        for (let i = 0; i < words.length; i++) {
            if (words[i].toLowerCase() === 'from' && words[i+1]) {
                fromCity = words[i+1]
            }
            if (words[i].toLowerCase() === 'to' && words[i+1]) {
                toCity = words[i+1]
                foundTo = true
            }
            if (!foundTo && words[i].toLowerCase() === 'rajahmundry') {
                fromCity = 'Rajahmundry'
            }
            if (words[i].toLowerCase() === 'tanuku') {
                toCity = 'Tanuku'
            }
        }
        
        // Check if they want AC or water
        const needsAC = msg.includes('ac') || msg.includes('air conditioned')
        const needsWater = msg.includes('water')
        
        // Return bus information
        if (fromCity && toCity) {
            return getBusInfo(fromCity, toCity, needsAC, needsWater)
        } else {
            return "Please tell me your source and destination. Example: 'buses from Rajahmundry to Tanuku'"
        }
    }
    
    // Keep your existing replies for other questions
    if (msg.includes('cancel') || msg.includes('refund')) {
        return "You can cancel your booking from 'My Bookings' page. Refund will be processed as per our cancellation policy. Would you like me to help you with that?"
    }
    if (msg.includes('ticket') || msg.includes('download')) {
        return "Your ticket is available in 'My Bookings' section. You can download PDF ticket from there."
    }
    if (msg.includes('payment') || msg.includes('pay')) {
        return "We accept all major cards, UPI, Net Banking, and wallets through our secure Razorpay payment gateway."
    }
    if (msg.includes('seat') || msg.includes('change')) {
        return "Seat changes aren't possible after booking. You can cancel and rebook if needed."
    }
    if (msg.includes('hello') || msg.includes('hi')) {
        return "Hello! Welcome to BusTravels support. How can I help you today? You can ask about bus routes, AC buses, water facilities, etc."
    }
    if (msg.includes('thank')) {
        return "You're welcome! Is there anything else I can help you with?"
    }
    
    return null
}
    const sendMessage = async () => {
        if (!inputMessage.trim()) return

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            time: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        
        // Show typing indicator
        setIsTyping(true)
        
        // Get auto-reply
        setTimeout(() => {
            const reply = getAutoReply(userMessage.text)
            const botMessage = {
                id: Date.now() + 1,
                text: reply || "Thank you for your message. Our support team will get back to you shortly. For urgent queries, please contact us on WhatsApp or call our helpline.",
                sender: 'bot',
                time: new Date().toLocaleTimeString()
            }
            setMessages(prev => [...prev, botMessage])
            setIsTyping(false)
        }, 1000)
    }

    const handleWhatsAppChat = () => {
        // Replace with your WhatsApp number
        const whatsappNumber = '919502219129' // Change to your number
        window.open(`https://wa.me/${whatsappNumber}?text=Hello! I need help with my bus booking.`, '_blank')
    }

    const handlePhoneCall = () => {
        window.location.href = 'tel:+919502219129'
    }

    const handleEmailSupport = () => {
        window.location.href = 'mailto:sparkybuzzing64@gmail.com'
    }

    const handleFAQClick = (faq) => {
        const botMessage = {
            id: Date.now(),
            text: faq.answer,
            sender: 'bot',
            time: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, botMessage])
        setShowFAQs(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        )
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl transition-all duration-300 z-50 ${isMinimized ? 'w-80 h-14' : 'w-96 h-[560px]'}`}>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Customer Support</h3>
                    <p className="text-xs text-blue-100">Online • Usually replies in minutes</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => setShowFAQs(!showFAQs)} className="hover:bg-white/20 p-1 rounded">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 p-1 rounded">
                        {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Quick Actions */}
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex space-x-2">
                        <button
                            onClick={handleWhatsAppChat}
                            className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition flex items-center justify-center space-x-1"
                        >
                            <Zap className="w-4 h-4" />
                            <span>WhatsApp</span>
                        </button>
                        <button
                            onClick={handlePhoneCall}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition flex items-center justify-center space-x-1"
                        >
                            <Phone className="w-4 h-4" />
                            <span>Call</span>
                        </button>
                        <button
                            onClick={handleEmailSupport}
                            className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-600 transition flex items-center justify-center space-x-1"
                        >
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                        </button>
                    </div>

                    {/* FAQ Section */}
                    {showFAQs && (
                        <div className="border-b border-gray-200 max-h-48 overflow-y-auto">
                            <div className="p-3 bg-yellow-50">
                                <p className="text-sm font-semibold text-yellow-800 mb-2">Frequently Asked Questions:</p>
                                <div className="space-y-2">
                                    {faqs.map((faq, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleFAQClick(faq)}
                                            className="w-full text-left text-sm text-gray-700 hover:text-blue-600 py-1"
                                        >
                                            • {faq.question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div className={`${isMinimized ? 'h-0' : 'h-96'} overflow-y-auto p-4 space-y-3`}>
                        {/* Welcome Message */}
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                                <p className="text-sm">👋 Hello! Welcome to BusTravels support. How can I help you today?</p>
                                <p className="text-xs text-gray-500 mt-1">Just now</p>
                            </div>
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3 max-w-[80%]`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>{msg.time}</p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            Usually replies in minutes • 24/7 Support
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}

export default LiveChat