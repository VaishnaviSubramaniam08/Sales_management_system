import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

function BarChart({ data, width = 520, height = 240, color = "#2d6cdf" }) {
  const padding = { top: 16, right: 16, bottom: 30, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const maxVal = Math.max(1, ...data.map((d) => d.value || 0));
  const barW = innerW / Math.max(1, data.length);
  return (
    <svg width={width} height={height} style={{ display: "block", maxWidth: "100%" }}>
      <g transform={`translate(${padding.left},${padding.top})`}>
        {/* Y axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = innerH - t * innerH;
          const val = Math.round(t * maxVal);
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={innerW} y2={y} stroke="#eee" />
              <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#666">{val}</text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const h = (innerH * (d.value || 0)) / maxVal;
          const x = i * barW + barW * 0.1;
          const y = innerH - h;
          const w = barW * 0.8;
          return (
            <g key={d.label || i}>
              <rect x={x} y={y} width={w} height={h} fill={color} rx={4} />
              <text x={x + w / 2} y={innerH + 14} textAnchor="middle" fontSize="10" fill="#666" style={{ pointerEvents: "none" }}>{(d.label || "").slice(0, 6)}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function LineChart({ points, width = 520, height = 240, color = "#8a5d3b" }) {
  const padding = { top: 16, right: 16, bottom: 30, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const maxY = Math.max(1, ...points.map((p) => p.y || 0));
  const minY = 0;
  const stepX = innerW / Math.max(1, points.length - 1);
  const path = points.map((p, i) => {
    const x = i * stepX;
    const y = innerH - ((p.y - minY) / (maxY - minY)) * innerH;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block", maxWidth: "100%" }}>
      <g transform={`translate(${padding.left},${padding.top})`}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = innerH - t * innerH;
          const val = Math.round(minY + t * (maxY - minY));
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={innerW} y2={y} stroke="#eee" />
              <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#666">{val}</text>
            </g>
          );
        })}
        {/* Path */}
        <path d={path} fill="none" stroke={color} strokeWidth={2} />
        {/* Dots */}
        {points.map((p, i) => {
          const x = i * stepX;
          const y = innerH - ((p.y - minY) / (maxY - minY)) * innerH;
          return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
        })}
      </g>
    </svg>
  );
}

export default function SalesOversight() {
  const [sales, setSales] = useState([]);
  const [staffMetrics, setStaffMetrics] = useState([]);
  const [daily, setDaily] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchAll = async (range = {}) => {
    try {
      setLoading(true);
      const params = {};
      if (range.from) params.from = range.from;
      if (range.to) params.to = range.to;

      const [salesRes, staffRes, dailyRes, discRes] = await Promise.all([
        api.get("sales", { params }),
        api.get("sales/metrics/staff", { params }),
        api.get("sales/daily-summary", { params }),
        api.get("sales/discounts", { params }),
      ]);

      setSales(salesRes.data);
      setStaffMetrics(staffRes.data);
      setDaily(dailyRes.data);
      setDiscounts(discRes.data);
    } catch (e) {
      console.error("Failed to fetch sales oversight", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const applyFilter = (e) => {
    e.preventDefault();
    fetchAll({ from, to });
  };

  const styles = {
    wrap: { padding: 24, background: "var(--color-bg)", color: "var(--color-text)" },
    h2: { margin: "16px 0 8px" },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    card: {
      background: "var(--color-card)",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 8,
      padding: 16,
      overflow: "auto",
      boxShadow: "0 6px 18px var(--shadow-card)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: { textAlign: "left", borderBottom: "1px solid #eee", padding: 8 },
    td: { borderBottom: "1px solid #f2f2f2", padding: 8, fontSize: 14 },
    filterBar: { display: "flex", gap: 8, alignItems: "center", marginBottom: 12 },
    input: { padding: 8, border: "1px solid #ddd", borderRadius: 6 },
    btn: { padding: "8px 12px", background: "#2d6cdf", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer" },
  };

  // Derived datasets for charts
  const staffBarData = useMemo(() =>
    (staffMetrics || []).map(m => ({ label: (m._id || "").slice(-4), value: m.salesCount })), [staffMetrics]);
  const dailyLinePoints = useMemo(() =>
    (daily || []).slice().reverse().map(d => ({ x: d._id, y: d.revenue })), [daily]);

  return (
    <div style={styles.wrap}>
      <h1>Sales Oversight</h1>

      <form onSubmit={applyFilter} style={styles.filterBar}>
        <label>
          From: <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={styles.input} />
        </label>
        <label>
          To: <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={styles.input} />
        </label>
        <button type="submit" style={styles.btn}>Apply</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h2 style={styles.h2}>Staff-wise Performance</h2>
              {/* Bar chart */}
              <BarChart data={staffBarData} />
              <table style={{ ...styles.table, marginTop: 12 }}>
                <thead>
                  <tr>
                    <th style={styles.th}>Staff ID</th>
                    <th style={styles.th}>Sales Count</th>
                    <th style={styles.th}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMetrics.map((m) => (
                    <tr key={m._id || Math.random()}>
                      <td style={styles.td}>{m._id}</td>
                      <td style={styles.td}>{m.salesCount}</td>
                      <td style={styles.td}>₹{m.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.card}>
              <h2 style={styles.h2}>Daily Cash Closure</h2>
              {/* Line chart */}
              <LineChart points={dailyLinePoints} />
              <table style={{ ...styles.table, marginTop: 12 }}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Sales Count</th>
                    <th style={styles.th}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((d) => (
                    <tr key={d._id}>
                      <td style={styles.td}>{d._id}</td>
                      <td style={styles.td}>{d.salesCount}</td>
                      <td style={styles.td}>₹{d.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...styles.card, marginTop: 16 }}>
            <h2 style={styles.h2}>Discounts Applied</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Sold By</th>
                  <th style={styles.th}>Sale Total</th>
                  <th style={styles.th}>Discount Amount</th>
                  <th style={styles.th}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((s) => (
                  <tr key={s._id}>
                    <td style={styles.td}>{new Date(s.date).toLocaleString()}</td>
                    <td style={styles.td}>{s.soldBy?.name || s.soldBy || "N/A"}</td>
                    <td style={styles.td}>₹{s.totalAmount}</td>
                    <td style={styles.td}>₹{s.discountDetails?.amount || 0}</td>
                    <td style={styles.td}>{s.discountDetails?.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ ...styles.card, marginTop: 16 }}>
            <h2 style={styles.h2}>Recent Sales</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Sale ID</th>
                  <th style={styles.th}>Sold By</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s._id}>
                    <td style={styles.td}>{new Date(s.date).toLocaleString()}</td>
                    <td style={styles.td}>{s._id}</td>
                    <td style={styles.td}>{s.soldBy?.name || s.soldBy || "N/A"}</td>
                    <td style={styles.td}>₹{s.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
