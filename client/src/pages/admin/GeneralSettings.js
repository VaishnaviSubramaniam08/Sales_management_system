import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function GeneralSettings() {
    const [gst, setGst] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings/gst_rate');
            setGst(res.data.value);
        } catch (err) {
            console.error('GST Setting not found, using default 0');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        try {
            await api.post('/settings/set', {
                key: 'gst_rate',
                value: Number(gst),
                description: 'Global GST percentage for all sales'
            });
            setSuccess('Settings saved successfully');
        } catch (err) {
            setError('Failed to save settings');
        }
    };

    const styles = {
        container: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
        card: { background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
        inputGroup: { marginBottom: '15px' },
        input: { padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd', marginTop: '8px' },
        button: { padding: '12px 24px', background: '#7b5a2b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>General Settings</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <div style={styles.inputGroup}>
                    <label>Global GST Rate (%)</label>
                    <input
                        type="number"
                        value={gst}
                        onChange={e => setGst(e.target.value)}
                        style={styles.input}
                    />
                    <small style={{ color: '#666' }}>This percentage will be applied to the subtotal in the sales checkout.</small>
                </div>

                <button onClick={handleSave} style={styles.button}>Save Settings</button>
            </div>
        </div>
    );
}
