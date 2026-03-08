import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function ExpenseTracker() {
    const [expenses, setExpenses] = useState([]);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Miscellaneous');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categories = ["Rent", "Salary", "Electricity", "Water", "Maintenance", "Marketing", "Miscellaneous"];

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (err) {
            setError('Failed to fetch expenses');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/expenses/add', { title, category, amount: Number(amount), description, date });
            setSuccess('Expense recorded successfully');
            setTitle('');
            setAmount('');
            setDescription('');
            fetchExpenses();
        } catch (err) {
            setError('Error recording expense');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
        } catch (err) {
            setError('Failed to delete');
        }
    };

    const styles = {
        container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
        form: { background: '#fdf6ed', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
        input: { padding: '10px', borderRadius: '6px', border: '1px solid #d4cbbd' },
        button: { padding: '10px 20px', background: '#7b5a2b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #7b5a2b' },
        td: { padding: '12px', borderBottom: '1px solid #eee' }
    };

    return (
        <div style={styles.container}>
            <h2>Expense Tracker</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleAdd} style={styles.form}>
                <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
                <select value={category} onChange={e => setCategory(e.target.value)} style={styles.input}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={styles.input} required />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} required />
                <input placeholder="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} style={{ ...styles.input, gridColumn: 'span 2' }} />
                <button type="submit" style={styles.button}>Record Expense</button>
            </form>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Title</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map(exp => (
                        <tr key={exp._id}>
                            <td style={styles.td}>{new Date(exp.date).toLocaleDateString()}</td>
                            <td style={styles.td}>{exp.title}</td>
                            <td style={styles.td}>{exp.category}</td>
                            <td style={styles.td}>₹{exp.amount}</td>
                            <td style={styles.td}>
                                <button onClick={() => handleDelete(exp._id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
