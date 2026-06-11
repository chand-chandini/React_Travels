import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bus, LogOut, LogIn, User, Ticket, Home, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Wrapper = ({ token, handleLogout, children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const navigate = useNavigate()

    const logout = () => {
        handleLogout()
        navigate('/')
        setIsMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                                    <Bus className="h-6 w-6 text-white" />
                                </div>
                                <span className="font-bold text-xl text-gray-800">BusTickets</span>
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Home
                            </Link>
                            {token && (
                                <Link to="/my-bookings" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1">
                                    <Ticket className="w-4 h-4" />
                                    <span>My Bookings</span>
                                </Link>
                            )}
                            {token ? (
                                <button 
                                    onClick={logout}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <Link to="/login">
                                    <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all">
                                        <LogIn className="w-4 h-4" />
                                        <span>Login</span>
                                    </button>
                                </Link>
                            )}
                        </div>
                        
                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-700 hover:text-blue-600 focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link 
                                to="/" 
                                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            {token && (
                                <Link 
                                    to="/my-bookings" 
                                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    My Bookings
                                </Link>
                            )}
                            {token ? (
                                <button 
                                    onClick={logout}
                                    className="w-full text-left text-red-600 hover:text-red-700 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="text-blue-600 hover:text-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            
            {/* Main Content */}
            <main>{children}</main>
        </div>
    )
}

export default Wrapper