import React, { useState } from "react";
import api from "../api/axios";

export default function PaymentModal({ sale, onClose, onPaymentSuccess }) {
    const [method, setMethod] = useState("Cash");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePayment = async () => {
        setLoading(true);
        setError("");
        try {
            // Simulation delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const res = await api.post("/payments/process", {
                saleId: sale._id,
                amount: sale.totalAmount,
                method,
                transactionId: method !== "Cash" ? `TXN-${Date.now()}` : undefined,
            });

            // Prompt to download invoice
            if (window.confirm("Payment Successful! Download Invoice?")) {
                downloadInvoice(sale._id);
            }

            onPaymentSuccess(res.data.payment);
        } catch (err) {
            setError(err.response?.data?.message || "Payment Failed");
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async (saleId) => {
        try {
            const response = await api.get(`/sales/invoice/${saleId}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `invoice-${saleId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Invoice download failed");
        }
    };

    const modalStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    };

    const contentStyle = {
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        width: "400px",
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    };

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <h3>Process Payment</h3>
                <p>Total Amount: <b>₹{sale.totalAmount}</b></p>

                <div style={{ margin: "20px 0", textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "10px" }}>Payment Method:</label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                    >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI (Scan QR)</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="Wallet">Digital Wallet</option>
                    </select>
                </div>

                {method === "UPI" && (
                    <div style={{ background: "#f0f0f0", padding: "20px", marginBottom: "20px" }}>
                        <p>📷 [QR Code Simulation]</p>
                    </div>
                )}

                {method === "Card" && (
                    <div style={{ marginBottom: "20px", textAlign: 'left' }}>
                        <input type="text" placeholder="Card Number" style={{ width: "93%", padding: "10px", marginBottom: "5px" }} />
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input type="text" placeholder="Expiry" style={{ width: "45%", padding: "10px" }} />
                            <input type="text" placeholder="CVV" style={{ width: "45%", padding: "10px" }} />
                        </div>
                    </div>
                )}

                {error && <p style={{ color: "red" }}>{error}</p>}

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", background: "white", cursor: "pointer" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#28a745", color: "white", cursor: "pointer" }}
                    >
                        {loading ? "Processing..." : "Pay Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}
