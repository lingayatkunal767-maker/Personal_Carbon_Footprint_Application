import React from 'react';

const HeroBanner = ({ userName }) => {
  return (
    <div className="hero">
      <div className="hero-deco"></div>
      <h1>Welcome back, {userName}! 👋</h1>
      <p>Your Carbon Footprint Tracker — track your impact, earn rewards, and make a difference!</p>
    </div>
  );
};

export default HeroBanner;
