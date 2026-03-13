import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function PurchaseOrderManagement() {
    const [pos, setPos] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [clothes, setClothes] = useState([]);
    
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [poRes, supRes, clothRes] = await Promise.all([
                api.get('purchase-orders'),
                api.get('suppliers'),
                api.get('clothes')
            ]);
            setPos(poRes.data);
            setSuppliers(supRes.data);
            setClothes(clothRes.data);
        } catch (err) {
            setError('Failed to fetch data');
        }
    };

    const handleAddItem = (clothId) => {
        const cloth = clothes.find(c => c._id === clothId);
        if (!cloth) return;
        // Check if already in list
        if (orderItems.find(item => item.clothId === clothId)) return;
        setOrderItems([...orderItems, { clothId, name: cloth.name, quantity: 10, costPrice: cloth.costPrice || 0 }]);
    };

    const handleSuggestRestock = () => {
        const threshold = 5;
        const lowStock = clothes.filter(c => c.quantity <= (c.reorderLevel || threshold));
        
        if (lowStock.length === 0) {
            alert("No low-stock items found!");
            return;
        }

        const newItems = [...orderItems];
        lowStock.forEach(c => {
            if (!newItems.find(item => item.clothId === c._id)) {
                newItems.push({ 
                    clothId: c._id, 
                    name: c.name, 
                    quantity: 10, 
                    costPrice: c.costPrice || 0 
                });
            }
        });
        setOrderItems(newItems);
        setSuccess(`Suggested ${lowStock.length} items for restock`);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleCreatePO = async () => {
        if (!selectedSupplier || orderItems.length === 0) {
            setError('Select supplier and add items');
            return;
        }
        setLoading(true);
        try {
            const totalAmount = orderItems.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
            await api.post('purchase-orders/add', {
                supplier: selectedSupplier,
                items: orderItems,
                totalAmount,
                expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
            });
            setSuccess('Purchase Order Created');
            setOrderItems([]);
            setSelectedSupplier('');
            fetchData();
        } catch (err) {
            setError('Failed to create PO');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`purchase-orders/status/${id}`, { status });
            fetchData();
        } catch (err) {
            setError('Failed to update status');
        }
    };

    const styles = {
        container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
        card: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
        th: { textAlign: 'left', padding: '12px', background: '#f4f4f4' },
        td: { padding: '12px', borderBottom: '1px solid #eee' },
        btnSmall: { padding: '5px 10px', fontSize: '12px', cursor: 'pointer', marginLeft: '5px' }
    };

    return (
        <div style={styles.container}>
            <h2>Purchase Order Management</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <div style={styles.card}>
                <h3>Create New Order</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} style={{ padding: '10px' }}>
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    <select onChange={e => handleAddItem(e.target.value)} style={{ padding: '10px' }} value="">
                        <option value="">Add Product to Order</option>
                        {clothes.map(c => <option key={c._id} value={c._id}>{c.name} (Stock: {c.quantity})</option>)}
                    </select>
                    <button 
                        onClick={handleSuggestRestock}
                        style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        💡 Suggest Restock
                    </button>
                </div>

                {orderItems.length > 0 && (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Product</th>
                                <th style={styles.th}>Qty</th>
                                <th style={styles.th}>Cost</th>
                                <th style={styles.th}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={styles.td}>{item.name}</td>
                                    <td style={styles.td}>
                                        <input type="number" value={item.quantity} onChange={e => {
                                            const newItems = [...orderItems];
                                            newItems[idx].quantity = Number(e.target.value);
                                            setOrderItems(newItems);
                                        }} style={{ width: '60px', padding: '5px' }} />
                                    </td>
                                    <td style={styles.td}>
                                        <input 
                                            type="number" 
                                            value={item.costPrice} 
                                            onChange={e => {
                                                const newItems = [...orderItems];
                                                newItems[idx].costPrice = Number(e.target.value);
                                                setOrderItems(newItems);
                                            }} 
                                            style={{ width: '80px', padding: '5px' }} 
                                        />
                                    </td>
                                    <td style={styles.td}>₹{(item.quantity * item.costPrice).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
                <button 
                    onClick={handleCreatePO} 
                    style={{ marginTop: '15px', padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Generate Purchase Order'}
                </button>
            </div>

            <div style={styles.card}>
                <h3>Recent Orders</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>PO #</th>
                            <th style={styles.th}>Supplier</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.map(po => (
                            <tr key={po._id}>
                                <td style={styles.td}>{po.orderNumber}</td>
                                <td style={styles.td}>{po.supplier?.name}</td>
                                <td style={styles.td}>₹{po.totalAmount}</td>
                                <td style={styles.td}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px',
                                        background: po.status === 'Received' ? '#d4edda' : '#fff3cd' 
                                    }}>
                                        {po.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {po.status === 'Pending' && <button onClick={() => updateStatus(po._id, 'Sent')} style={styles.btnSmall}>Mark Sent</button>}
                                    {po.status === 'Sent' && <button onClick={() => updateStatus(po._id, 'Received')} style={styles.btnSmall}>Mark Received</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
