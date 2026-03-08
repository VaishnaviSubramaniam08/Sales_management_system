import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function ProfitLossReport() {
    const [report, setReport] = useState({
        revenue: 0,
        cogs: 0, // Cost of Goods Sold
        grossProfit: 0,
        totalExpenses: 0,
        netProfit: 0,
        taxCollected: 0
    });
    const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        generateReport();
    }, []);

    const generateReport = async () => {
        setLoading(true);
        try {
            // Fetch Sales for period
            const salesRes = await api.get(`/sales?from=${from}&to=${to}`);
            const sales = salesRes.data;

            // Fetch Expenses for period
            const expRes = await api.get(`/expenses?from=${from}&to=${to}`);
            const expenses = expRes.data;

            let revenue = 0;
            let cogs = 0;
            let taxCollected = 0;

            sales.forEach(sale => {
                // Sale total includes tax usually, but revenue should be after tax deduction?
                // Let's assume revenue = subtotal after product discount, before tax.
                const saleTax = sale.taxDetails?.amount || 0;
                revenue += (sale.totalAmount - saleTax);
                taxCollected += saleTax;
                
                sale.items.forEach(item => {
                    cogs += (item.costPrice || 0) * item.quantity;
                });
            });

            const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
            const grossProfit = revenue - cogs;
            const netProfit = grossProfit - totalExpenses;

            setReport({ revenue, cogs, grossProfit, totalExpenses, netProfit, taxCollected });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
        filters: { display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' },
        card: { background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
        row: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f0f0f0' },
        totalRow: { borderTop: '2px solid #7b5a2b', fontWeight: 'bold', fontSize: '1.2em', color: '#7b5a2b' },
        input: { padding: '8px', borderRadius: '6px', border: '1px solid #ddd' },
        button: { padding: '10px 20px', background: '#7b5a2b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <h2>Profit & Loss Report</h2>
            
            <div style={styles.filters}>
                <div>
                    <label style={{display:'block', fontSize:'12px'}}>From</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={styles.input} />
                </div>
                <div>
                    <label style={{display:'block', fontSize:'12px'}}>To</label>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)} style={styles.input} />
                </div>
                <button onClick={generateReport} style={styles.button} disabled={loading}>
                    {loading ? 'Calculating...' : 'Generate Report'}
                </button>
            </div>

            <div style={styles.card}>
                <div style={styles.row}>
                    <span>Total Sales (Revenue Excl. Tax)</span>
                    <span>₹{report.revenue.toLocaleString()}</span>
                </div>
                <div style={styles.row}>
                    <span>Cost of Goods Sold (COGS)</span>
                    <span style={{color: 'red'}}>- ₹{report.cogs.toLocaleString()}</span>
                </div>
                <div style={{...styles.row, fontWeight: 'bold'}}>
                    <span>Gross Profit</span>
                    <span style={{color: report.grossProfit >= 0 ? 'green' : 'red'}}>₹{report.grossProfit.toLocaleString()}</span>
                </div>
                <div style={styles.row}>
                    <span>Total Operating Expenses</span>
                    <span style={{color: 'red'}}>- ₹{report.totalExpenses.toLocaleString()}</span>
                </div>
                <div style={styles.row}>
                    <span>Tax Collected (GST)</span>
                    <span>₹{report.taxCollected.toLocaleString()}</span>
                </div>
                <div style={{...styles.row, ...styles.totalRow}}>
                    <span>Net Profit / Loss</span>
                    <span style={{color: report.netProfit >= 0 ? 'green' : 'red'}}>₹{report.netProfit.toLocaleString()}</span>
                </div>
            </div>
            <p style={{marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center'}}>
                Note: Revenue is calculated as Sale Total minus Tax. Gross Profit is Revenue minus Buying Cost.
            </p>
        </div>
    );
}
