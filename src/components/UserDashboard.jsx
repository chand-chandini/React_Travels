import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react'
import axios from 'axios'

const UserDashboard = ({ token, userId }) => {
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [userId, token])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/user/${userId}/profile/`, {
        headers: { Authorization: `Token ${token}` }
      })
      setUser(response.data)
      setFormData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/user/${userId}/profile/`, formData, {
        headers: { Authorization: `Token ${token}` }
      })
      setUser(response.data)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">My Profile</h2>
            <p className="text-blue-100">Manage your account details</p>
          </div>
          <button
            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Username</p>
            {isEditing ? (
              <input
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full border rounded-lg px-3 py-1"
              />
            ) : (
              <p className="font-semibold">{user?.username}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
          <div className="bg-blue-100 p-3 rounded-full">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Email</p>
            {isEditing ? (
              <input
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-1"
              />
            ) : (
              <p className="font-semibold">{user?.email}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
          <div className="bg-blue-100 p-3 rounded-full">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Phone Number</p>
            {isEditing ? (
              <input
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-1"
                placeholder="Add phone number"
              />
            ) : (
              <p className="font-semibold">{user?.phone || 'Not added'}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Address</p>
            {isEditing ? (
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border rounded-lg px-3 py-1"
                rows="2"
                placeholder="Add your address"
              />
            ) : (
              <p className="font-semibold">{user?.address || 'Not added'}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setIsEditing(false)
                setFormData(user)
              }}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard
