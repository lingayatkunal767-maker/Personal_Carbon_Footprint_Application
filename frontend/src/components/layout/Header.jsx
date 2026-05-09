import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Header = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.6rem',
        padding: '0.9rem 1rem',
        background: '#f0f0f0'
    };

    const titleStyle = {
        margin: 0,
        fontSize: 'clamp(1.15rem, 3.8vw, 1.5rem)',
        lineHeight: 1.2
    };

    const buttonStyle = {
        padding: '0.5rem 0.85rem',
        fontSize: '0.9rem'
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={headerStyle}>
            <h1 style={titleStyle}>CarbonCalc</h1>
            <button style={buttonStyle} onClick={handleLogout}>Logout</button>
        </header>
    );
};

export default Header;
