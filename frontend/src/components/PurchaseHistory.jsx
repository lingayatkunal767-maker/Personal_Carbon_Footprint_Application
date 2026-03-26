const PurchaseHistory = ({ userId }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/marketplace/history/${userId}`)
            .then(res => setHistory(res.data))
            .catch(err => console.error(err));
    }, [userId]);

    return (
        <div className="history-section">
            <h3>Your Offsetting History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Initiative</th>
                        <th>Offset Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(tx => (
                        <tr key={tx.id}>
                            <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                            <td>{tx.item.name}</td>
                            <td>-{tx.item.offsetValue} kg</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};