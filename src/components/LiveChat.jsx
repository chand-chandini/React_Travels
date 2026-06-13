import React, { useState } from 'react'
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

    // Send message to Groq API (free, fast, works in browser)
    const sendToGroq = async (userMessage) => {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY
        
        // Check if API key is available
        if (!apiKey) {
            console.error('Groq API key is missing!')
            return "Sorry, the AI service is not configured. Please contact support or use WhatsApp for help."
        }

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a bus travel assistant for BusTravels. Help users with:
                            - Bus routes (Vizag-Hyderabad, Vizag-Rajahmundry, Rajahmundry-Tanuku)
                            - Cancellation and refund policies
                            - Ticket booking and download
                            - Seat changes
                            - Payment methods
                            
                            Keep answers VERY SHORT and CONCISE (max 2-3 sentences).`
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('API Error:', errorData)
                return "Sorry, I'm having trouble right now. Please try again or contact WhatsApp support."
            }

            const data = await response.json()
            
            if (data.error) {
                console.error('API Error:', data.error)
                return "Sorry, having trouble. Please contact WhatsApp support."
            }
            
            return data.choices[0].message.content
        } catch (error) {
            console.error('AI API error:', error)
            return "Sorry, having trouble connecting. Please try again or contact us on WhatsApp."
        }
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
        
        // Get AI response from Groq
        const aiReply = await sendToGroq(userMessage.text)
        
        const botMessage = {
            id: Date.now() + 1,
            text: aiReply,
            sender: 'bot',
            time: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
    }

    const handleWhatsAppChat = () => {
        const whatsappNumber = '919502219129'
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
                className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
            >
                <MessageCircle className="w-5 h-5" />
            </button>
        )
    }

    return (
        <div className={`fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl transition-all duration-300 z-50 ${isMinimized ? 'w-72 h-12' : 'w-80 h-[480px]'}`}>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-t-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-sm">AI Support</h3>
                    <p className="text-xs text-blue-100">AI Assistant • 24/7</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => setShowFAQs(!showFAQs)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all duration-200" title="FAQ">
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsMinimized(!isMinimized)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all duration-200" title={isMinimized ? "Expand" : "Minimize"}>
                        {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all duration-200 hover:scale-105" title="Close chat">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Quick Actions */}
                    <div className="p-2 bg-gray-50 border-b border-gray-200 flex space-x-1.5">
                        <button onClick={handleWhatsAppChat} className="flex-1 bg-green-500 text-white py-1.5 rounded-md text-xs font-semibold hover:bg-green-600 transition flex items-center justify-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>WhatsApp</span>
                        </button>
                        <button onClick={handlePhoneCall} className="flex-1 bg-blue-500 text-white py-1.5 rounded-md text-xs font-semibold hover:bg-blue-600 transition flex items-center justify-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                        </button>
                        <button onClick={handleEmailSupport} className="flex-1 bg-purple-500 text-white py-1.5 rounded-md text-xs font-semibold hover:bg-purple-600 transition flex items-center justify-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                        </button>
                    </div>

                    {/* FAQ Section */}
                    {showFAQs && (
                        <div className="border-b border-gray-200 max-h-36 overflow-y-auto">
                            <div className="p-2 bg-yellow-50">
                                <p className="text-xs font-semibold text-yellow-800 mb-1">FAQs:</p>
                                <div className="space-y-1">
                                    {faqs.map((faq, index) => (
                                        <button key={index} onClick={() => handleFAQClick(faq)} className="w-full text-left text-xs text-gray-700 hover:text-blue-600 py-0.5">
                                            • {faq.question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div className="h-72 overflow-y-auto p-3 space-y-2">
                        {/* Welcome Message */}
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-2 max-w-[85%]">
                                <p className="text-xs">👋 Hi! I'm your AI travel assistant. Ask me anything about buses, routes, bookings, or refunds!</p>
                                <p className="text-xs text-gray-500 mt-0.5">Just now</p>
                            </div>
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-2 max-w-[85%]`}>
                                    <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                                    <p className={`text-xs mt-0.5 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>{msg.time}</p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-2">
                                    <div className="flex space-x-0.5">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-2 border-t border-gray-200">
                        <div className="flex space-x-1.5">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask me anything..."
                                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button onClick={sendMessage} className="bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 transition">
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-1">
                            Powered by AI
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}

export default LiveChat