import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import HeroBanner from './components/HeroBanner';
import StatSummaryRow from './components/StatSummaryRow';
import ProfileCard from './components/ProfileCard';
import GoalsCard from './components/GoalsCard';
import CarbonFootprintLog from './components/CarbonFootprintLog';
import EmissionsBreakdown from './components/EmissionsBreakdown';
import MonthlyComparison from './components/MonthlyComparison';
import RecentActivity from './components/RecentActivity';
import EcoTips from './components/EcoTips';
import LeaderboardCard from './components/LeaderboardCard';
import EcoBadgesCard from './components/EcoBadgesCard';
import NotificationsPanel from './components/NotificationsPanel';
import LogActivityModal from './components/LogActivityModal';
import './Dashboard.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('John');
  const [userEmail, setUserEmail] = useState('');
  const [memberSince, setMemberSince] = useState('Jan 12, 2022');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Authentication guard - check if user is logged in
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    const currentUser = localStorage.getItem('current_user');
    
    if (!authToken || !currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    
    try {
      const user = JSON.parse(currentUser);
      setUserName(user.name || 'John');
      setUserEmail(user.email || '');
      
      // Set member since date
      const memberDate = user.memberSince || 'Jan 12, 2022';
      setMemberSince(memberDate);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleToggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleCloseNotifications = () => {
    setNotificationsOpen(false);
  };

  return (
    <div>
      {/* Top Navigation Bar */}
      <TopBar 
        onLogout={handleLogout} 
        onOpenModal={handleOpenModal}
        onOpenNotifications={handleToggleNotifications}
      />
      
      {/* Hero Banner */}
      <HeroBanner userName={userName} />
      
      {/* Statistics Summary Row */}
      <StatSummaryRow />
      
      {/* Main 2-Column Grid */}
      <div className="grid">
        {/* Left Column - Profile */}
        <ProfileCard 
          userName={userName}
          userEmail={userEmail}
          memberSince={memberSince}
        />
        
        {/* Right Column - Goals */}
        <GoalsCard />
        
        {/* Left Column - Carbon Footprint Log */}
        <CarbonFootprintLog />
        
        {/* Right Column - Emissions Breakdown */}
        <EmissionsBreakdown />
        
        {/* Left Column - Monthly Comparison */}
        <MonthlyComparison />
        
        {/* Right Column - Recent Activity */}
        <RecentActivity />
        
        {/* Left Column - Eco Tips */}
        <EcoTips />
        
        {/* Right Column - Leaderboard + Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <LeaderboardCard />
          <EcoBadgesCard />
        </div>
      </div>
      
      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={notificationsOpen}
        onClose={handleCloseNotifications}
      />
      
      {/* Log Activity Modal */}
      <LogActivityModal 
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
