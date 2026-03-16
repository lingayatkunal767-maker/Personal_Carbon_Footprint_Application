import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const CarbonLogList = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/carbon/logs');
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    if (loading) return <p>Loading logs...</p>;

    return (
        <div>
            <h3>Carbon Footprint Log</h3>
            {logs.length === 0 ? (
                <p>No logs found. Add one to get started!</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Transport</th>
                            <th>Food</th>
                            <th>Energy</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{log.date}</td>
                                <td>{log.transportEmission}</td>
                                <td>{log.foodEmission}</td>
                                <td>{log.energyEmission}</td>
                                <td>{log.totalEmission}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CarbonLogList;
