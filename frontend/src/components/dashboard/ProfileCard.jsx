import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const ProfileCard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    return (
        <div>
            <h3>User Profile</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
    );
};

export default ProfileCard;
