import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Registerform from './components/Registerform';
import Loginform from './components/Loginform';
import BusList from './components/BusList';
import BusSeats from './components/BusSeats';
import UserBookings from './components/UserBookings';
import UserDashboard from './components/UserDashboard';
import Wrapper from './components/Wrapper';
import LiveChat from './components/LiveChat';

const App = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
    }
  }, []);

  const handleLogin = (token, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    setToken(token);
    setUserId(userId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
  };

  return (
    <Router>
      <Wrapper handleLogout={handleLogout} token={token}>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<BusList />} />
          <Route path='/register' element={<Registerform />} />
          <Route path='/login' element={<Loginform onLogin={handleLogin} />} />
          
          {/* Protected Routes - Require Login */}
          <Route path='/bus/:busId' element={
            token ? <BusSeats token={token} /> : <Navigate to="/login" />
          } />
          
          <Route path='/my-bookings' element={
            token ? <UserBookings token={token} userId={userId} /> : <Navigate to="/login" />
          } />
          
          <Route path='/dashboard' element={
            token ? <UserDashboard token={token} userId={userId} /> : <Navigate to="/login" />
          } />
        </Routes>
      </Wrapper>
      <LiveChat />
    </Router>
  );
};

export default App;