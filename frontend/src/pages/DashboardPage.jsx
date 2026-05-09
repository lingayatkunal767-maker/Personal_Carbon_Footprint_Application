import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Header from '../components/layout/Header';
import ProfileCard from '../components/dashboard/ProfileCard';
import CarbonLogList from '../components/dashboard/CarbonLogList';
import AddLogForm from '../components/dashboard/AddLogForm';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            <Header />
            <h2>Welcome, {user?.name}!</h2>
            <ProfileCard />
            {/* Placeholder Cards */}
            <div>Goals Card Placeholder</div>
            <div>Leaderboard Placeholder</div>
            <div>Eco Badges Placeholder</div>
            <hr />
            <AddLogForm />
            <CarbonLogList />
        </div>
    );
};

export default DashboardPage;
