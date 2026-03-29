import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="inline-block w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
      <p className="text-green-800 font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
