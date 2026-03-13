import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function GeneralSettings() {
    const [gst, setGst] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [twoFactor, setTwoFactor] = useState(false);
    const [signatureFile, setSignatureFile] = useState(null);
    const [signatureUrl, setSignatureUrl] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings/gst_rate');
            setGst(res.data.value);
        } catch (err) {}
        
        try {
            const sigRes = await api.get('/settings/STORE_SIGNATURE');
            if (sigRes.data && sigRes.data.value) {
                setSignatureUrl(sigRes.data.value);
            }
        } catch (err) {}

        try {
            // Assume we can fetch user profile to check 2FA
            await api.get('/auth/users'); // This is admin list, but let's find self
            // Hardcoded for now: fetch the current user's profile
            // Better: update user model to return 2FA status
        } catch (err) {
            console.error('Settings fetch error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        try {
            const promises = [
                api.post('/settings/set', {
                    key: 'gst_rate',
                    value: Number(gst),
                    description: 'Global GST percentage for all sales'
                }),
                api.put('/auth/toggle-2fa', { enabled: twoFactor })
            ];

            if (signatureFile) {
                const formData = new FormData();
                formData.append('signature', signatureFile);
                promises.push(
                    api.post('/settings/signature', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }).then(res => {
                        if(res.data.setting) {
                            setSignatureUrl(res.data.setting.value);
                        }
                    })
                );
            }

            await Promise.all(promises);
            setSuccess('Settings saved successfully');
            setSignatureFile(null); // reset file input after save
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

                <div style={{ ...styles.inputGroup, borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Security</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 'bold' }}>
                        <input
                            type="checkbox"
                            checked={twoFactor}
                            onChange={e => setTwoFactor(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        Enable Two-Factor Authentication (2FA)
                    </label>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        If enabled, you will be required to enter a 6-digit code during login.
                    </p>
                </div>

                <div style={{ ...styles.inputGroup, borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Billing Templates</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Store Proprietor Signature</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setSignatureFile(e.target.files[0])}
                                style={{ ...styles.input, border: 'none', padding: '0', cursor: 'pointer' }}
                            />
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                Upload a PNG or JPEG of your signature with a white or transparent background to be attached dynamically to the Delivery Challans.
                            </p>
                        </div>
                        
                        {(signatureUrl || signatureFile) && (
                            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', border: '1px dashed #ccc', width: 'fit-content' }}>
                                <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Current Signature Preview:</p>
                                <img 
                                    src={signatureFile ? URL.createObjectURL(signatureFile) : `http://localhost:5000${signatureUrl}`} 
                                    alt="Admin Signature" 
                                    style={{ maxHeight: '60px', objectFit: 'contain' }} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <button onClick={handleSave} style={styles.button}>Save All Settings</button>
                </div>
            </div>
        </div>
    );
}
