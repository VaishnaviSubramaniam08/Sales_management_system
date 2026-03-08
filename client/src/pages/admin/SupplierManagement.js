import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function SupplierManagement() {
    const [suppliers, setSuppliers] = useState([]);
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            setSuppliers(res.data);
        } catch (err) {
            setError('Failed to fetch suppliers');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/suppliers/add', { name, contactPerson, phone, email, address, category });
            setSuccess('Supplier added successfully');
            setName('');
            setContactPerson('');
            setPhone('');
            setEmail('');
            setAddress('');
            setCategory('');
            fetchSuppliers();
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding supplier');
        }
    };

    const styles = {
        container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
        form: { background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
        input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
        button: { padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', gridColumn: 'span 2' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
        th: { textAlign: 'left', padding: '12px', background: '#7b5a2b', color: '#fff' },
        td: { padding: '12px', borderBottom: '1px solid #eee' }
    };

    return (
        <div style={styles.container}>
            <h2>Supplier Management</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleAdd} style={styles.form}>
                <input placeholder="Supplier Name" value={name} onChange={e => setName(e.target.value)} style={styles.input} required />
                <input placeholder="Contact Person" value={contactPerson} onChange={e => setContactPerson(e.target.value)} style={styles.input} />
                <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} required />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} />
                <input placeholder="Category (e.g. Fabric)" value={category} onChange={e => setCategory(e.target.value)} style={styles.input} />
                <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} style={styles.input} />
                <button type="submit" style={styles.button}>Add Supplier</button>
            </form>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Balance (Owed)</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map(s => (
                        <tr key={s._id}>
                            <td style={styles.td}>{s.name}</td>
                            <td style={styles.td}>{s.phone}</td>
                            <td style={styles.td}>{s.category}</td>
                            <td style={styles.td}>₹{s.balance}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
