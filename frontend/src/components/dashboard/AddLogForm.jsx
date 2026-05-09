import React, { useState } from 'react';
import apiClient from '../../api/apiClient';

const AddLogForm = ({ onLogAdded }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [transport, setTransport] = useState('');
    const [food, setFood] = useState('');
    const [energy, setEnergy] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await apiClient.post('/carbon/logs', {
                date,
                transportEmission: transport,
                foodEmission: food,
                energyEmission: energy
            });
            // Reset form and notify parent to refetch logs
            setDate(new Date().toISOString().split('T')[0]);
            setTransport('');
            setFood('');
            setEnergy('');
            if (onLogAdded) onLogAdded();
        } catch (err) {
            setError('Failed to add log. Please check your values.');
        }
    };

    return (
        <div>
            <h3>Add New Carbon Log</h3>
            <form onSubmit={handleSubmit}>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <input type="number" value={transport} onChange={e => setTransport(e.target.value)} placeholder="Transport Emission" min="0" step="0.01" required />
                <input type="number" value={food} onChange={e => setFood(e.target.value)} placeholder="Food Emission" min="0" step="0.01" required />
                <input type="number" value={energy} onChange={e => setEnergy(e.target.value)} placeholder="Energy Emission" min="0" step="0.01" required />
                <button type="submit">Add Log</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

export default AddLogForm;
