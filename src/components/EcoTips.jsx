import React from 'react';

const EcoTips = () => {
  const tips = [
    {
      icon: '🚲',
      bg: '#d4edda',
      title: 'Cycle to work twice a week',
      description: 'Replaces short car trips under 5 km',
      savings: 'Save ~18 kg CO₂/month'
    },
    {
      icon: '🌡️',
      bg: '#fef3d4',
      title: 'Lower thermostat by 2°C',
      description: 'Small change, big impact on heating bills',
      savings: 'Save ~12 kg CO₂/month'
    },
    {
      icon: '🥦',
      bg: '#dceefb',
      title: 'Try 3 meat-free days per week',
      description: 'Significantly cuts food-related emissions',
      savings: 'Save ~22 kg CO₂/month'
    },
    {
      icon: '🛁',
      bg: '#fde8e8',
      title: 'Switch baths to 5-min showers',
      description: 'Reduces water heating energy by up to 70%',
      savings: 'Save ~8 kg CO₂/month'
    }
  ];

  return (
    <div className="card">
      <div className="card-title">💡 Eco Tips For You <a>Refresh ↻</a></div>
      <div className="tips-list">
        {tips.map((tip, index) => (
          <div key={index} className="tip-card">
            <div className="tip-icon" style={{ background: tip.bg }}>{tip.icon}</div>
            <div className="tip-body">
              <p>{tip.title}</p>
              <small>{tip.description}</small>
              <span className="tip-save">{tip.savings}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EcoTips;
