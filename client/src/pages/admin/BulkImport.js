import React, { useState } from 'react';
import api from '../../api/axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function BulkImport() {
    const [fileType, setFileType] = useState('clothes');
    const [importedData, setImportedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setResults(null);
        setError('');
        
        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

        if (isExcel) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                processJsonData(json);
            };
            reader.readAsArrayBuffer(file);
        } else {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processJsonData(results.data);
                },
                error: (err) => {
                    setError("CSV Parsing Error: " + err.message);
                }
            });
        }
    };

    const processJsonData = (data) => {
        // Robust header mapping
        const mapped = data.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
                const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
                newRow[normalizedKey] = row[key];
            });
            return newRow;
        });
        setImportedData(mapped);
    };

    const handleImport = async () => {
        if (importedData.length === 0) return alert('No valid data loaded.');
        setLoading(true);
        setResults(null);
        setError('');

        try {
            const endpoint = fileType === 'clothes' ? 'clothes/bulk-import' : 'customers/bulk-import';
            const res = await api.post(endpoint, { items: importedData });
            setResults(res.data.details);
            setImportedData([]);
            // Clear file input
            document.getElementById('file-input').value = '';
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
        card: { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', color: '#333' },
        instructions: { background: '#fdf6ed', padding: '15px', borderRadius: '10px', fontSize: '13px', color: '#7b5a2b', marginBottom: '25px', border: '1px solid #faead1' },
        inputGroup: { marginBottom: '20px' },
        button: { padding: '12px 30px', background: '#7b5a2b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
        resultCard: { marginTop: '30px', padding: '20px', borderRadius: '12px', background: '#f8f9fa' },
        successText: { color: '#2f855a', fontWeight: 'bold' },
        failText: { color: '#c53030', fontWeight: 'bold' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
        th: { textAlign: 'left', padding: '10px', borderBottom: '2px solid #dee2e6' },
        td: { padding: '10px', borderBottom: '1px solid #eee', fontSize: '13px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ marginTop: 0 }}>📦 Bulk Import (CSV / Excel)</h2>
                
                <div style={styles.instructions}>
                    <strong>Instructions:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>Supports <b>.csv</b> and <b>.xlsx</b> files.</li>
                        <li>First row must be headers (Case-insensitive).</li>
                        <li><b>Clothes headers:</b> name, category, price, costPrice, quantity, barcode, size, color</li>
                        <li><b>Customers headers:</b> name, phone, email</li>
                    </ul>
                </div>

                <div style={styles.inputGroup}>
                    <p style={{ fontWeight: '600', marginBottom: '10px' }}>What are you importing?</p>
                    <label style={{ marginRight: '20px', cursor: 'pointer' }}>
                        <input type="radio" checked={fileType === 'clothes'} onChange={() => { setFileType('clothes'); setImportedData([]); setResults(null); }} /> Clothes
                    </label>
                    <label style={{ cursor: 'pointer' }}>
                        <input type="radio" checked={fileType === 'customers'} onChange={() => { setFileType('customers'); setImportedData([]); setResults(null); }} /> Customers
                    </label>
                </div>

                <div style={styles.inputGroup}>
                    <input 
                        id="file-input"
                        type="file" 
                        accept=".csv, .xlsx, .xls" 
                        onChange={handleFileUpload} 
                        style={{ display: 'block', padding: '10px', border: '1px dashed #7b5a2b', borderRadius: '8px', width: '97%' }} 
                    />
                </div>

                {importedData.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '14px', color: '#2f855a', fontWeight: '500' }}>✅ {importedData.length} rows loaded from file.</p>
                        <button onClick={handleImport} style={styles.button} disabled={loading}>
                            {loading ? 'Processing...' : `Start Import`}
                        </button>
                    </div>
                )}

                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>❌ {error}</p>}

                {results && (
                    <div style={styles.resultCard}>
                        <h3>Import Results</h3>
                        <div style={{ display: 'flex', gap: '30px', marginBottom: '15px' }}>
                            <div>Total: <b>{results.total}</b></div>
                            <div style={styles.successText}>Success: {results.success}</div>
                            <div style={styles.failText}>Failed: {results.failed}</div>
                        </div>

                        {results.failures.length > 0 && (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <p style={styles.failText}>Failure Details:</p>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Row</th>
                                            <th style={styles.th}>Item Name</th>
                                            <th style={styles.th}>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.failures.map((f, idx) => (
                                            <tr key={idx}>
                                                <td style={styles.td}>{f.row}</td>
                                                <td style={styles.td}>{f.name}</td>
                                                <td style={{ ...styles.td, color: '#c53030' }}>{f.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
