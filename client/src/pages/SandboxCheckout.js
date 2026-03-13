import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SandboxCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], total = 0, gst = 0, finalTotal = 0, customer = null } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(0);
  const [result, setResult] = useState(null); // 'success' | 'failure'
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const stages = [
    "Contacting Bank...",
    "Authorizing Payment...",
    "Completing Transaction..."
  ];

  useEffect(() => {
    if (!total || total === 0) {
      // Uncomment this for real usage:
      // navigate("/sales");
    }
  }, [total, navigate]);

  const handlePayment = () => {
    setProcessing(true);
    setProcessStage(0);

    const interval = setInterval(() => {
      setProcessStage(prev => {
        if (prev < 2) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    setTimeout(() => {
      const isFailure = paymentMethod === "card" && cardNumber.endsWith("000");
      setResult(isFailure ? "failure" : "success");
      setProcessing(false);
    }, 3000);
  };

  const handleDownloadInvoice = () => {
    alert("Invoice downloading... (In a real app, this triggers a PDF generator)");
  };

  return (
    <div className="checkout-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .checkout-wrapper {
          min-height: 100vh;
          background: #f3f4f6;
          background-image: radial-gradient(circle at 100% 0%, #e0e7ff 0%, #f3f4f6 50%, #f3f4f6 100%);
          font-family: 'Inter', system-ui, sans-serif;
          padding: 60px 20px;
          color: #1f2937;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .checkout-container {
          max-width: 960px;
          width: 100%;
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 30px;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 768px) {
          .checkout-container {
            grid-template-columns: 1fr;
          }
        }

        .card-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
          padding: 35px;
          border: 1px solid rgba(255,255,255,0.4);
          position: relative;
          overflow: hidden;
        }

        .summary-panel {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
          padding: 35px;
        }

        .title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .method-btn {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-radius: 14px;
          border: 2px solid #f3f4f6;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
        }

        .method-btn:hover {
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .method-btn.active {
          border-color: #6366f1;
          background: #eef2ff;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
        }

        .method-btn.active .method-title {
          color: #4f46e5;
        }

        .method-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 22px;
          transition: all 0.2s;
        }

        .method-btn.active .method-icon {
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .method-title {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .method-desc {
          font-size: 13px;
          color: #6b7280;
        }

        .form-group {
          margin-bottom: 16px;
          animation: fadeIn 0.4s ease;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 8px;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s;
          font-family: inherit;
          background: #fdfdfd;
        }

        .input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
          background: #ffffff;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .pay-btn {
          width: 100%;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #fff;
          border: none;
          padding: 18px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 25px;
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
          position: relative;
          overflow: hidden;
        }

        .pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px rgba(79, 70, 229, 0.3);
        }

        .pay-btn:active {
          transform: translateY(1px);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
          font-size: 15px;
          color: #4b5563;
        }

        .summary-item-name {
          color: #111827;
          font-weight: 500;
        }

        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-top: 5px;
        }

        .customer-card {
          margin-top: 30px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }

        /* Overlay & Modals */
        .overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal {
          background: #ffffff;
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          max-width: 440px;
          width: 90%;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .spinner-ring {
          width: 70px;
          height: 70px;
          position: relative;
          margin: 0 auto 24px;
        }
        
        .spinner-ring-circle {
          width: 100%;
          height: 100%;
          border: 4px solid #e0e7ff;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .success-icon {
          width: 80px; height: 80px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px;
          margin: 0 auto 20px;
          animation: bounceIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .error-icon {
          width: 80px; height: 80px;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px;
          margin: 0 auto 20px;
          animation: bounceIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .receipt-panel {
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          margin: 25px 0;
          text-align: left;
        }

        .action-btn-outline {
          background: transparent;
          color: #4f46e5;
          border: 2px solid #e0e7ff;
          padding: 16px;
          border-radius: 14px;
          font-weight: 600;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 12px;
        }

        .action-btn-outline:hover {
          background: #f5f8ff;
          border-color: #c7d2fe;
        }

        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpFade { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Processing Overlay */}
      {processing && (
        <div className="overlay">
          <div className="modal" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
            <div className="spinner-ring">
              <div className="spinner-ring-circle"></div>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{stages[processStage]}</h2>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Establishing secure connection...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {result === "success" && (
        <div className="overlay">
          <div className="modal">
            <div className="success-icon">✓</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Payment Successful</h2>
            <p style={{ color: '#6b7280' }}>Your transaction has been securely processed.</p>
            
            <div className="receipt-panel">
              <div className="summary-row" style={{ marginBottom: 10 }}>
                <span>Transaction ID</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>TXN_8829{Math.floor(Math.random()*10000)}</span>
              </div>
              <div className="summary-row" style={{ marginBottom: 0 }}>
                <span>Amount Paid</span>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: 16 }}>₹{(finalTotal || 4500).toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handleDownloadInvoice} className="pay-btn" style={{ marginTop: 0 }}>
              Download PDF Invoice
            </button>
            <button onClick={() => navigate("/sales")} className="action-btn-outline">
              Start New Sale
            </button>
          </div>
        </div>
      )}

      {/* Failure Modal */}
      {result === "failure" && (
        <div className="overlay">
          <div className="modal">
            <div className="error-icon">✕</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Payment Failed</h2>
            <p style={{ color: '#6b7280', lineHeight: 1.5 }}>The bank declined the transaction. Please check your card details or use a different method.</p>
            
            <div style={{ marginTop: 30 }}>
              <button 
                onClick={() => { setResult(null); setProcessStage(0); }} 
                className="pay-btn" 
                style={{ background: '#ef4444', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)', marginTop: 0 }}
              >
                Try Again
              </button>
              <button onClick={() => setResult(null)} className="action-btn-outline" style={{ color: '#6b7280', borderColor: '#e5e7eb' }}>
                Change Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="checkout-container">
        {/* Left Column - Payment Details */}
        <div className="card-panel">
          <h2 className="title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Payment Method
          </h2>
          
          <div 
            className={`method-btn ${paymentMethod === "upi" ? "active" : ""}`}
            onClick={() => setPaymentMethod("upi")}
          >
            <div className="method-icon">📱</div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div className="method-title">UPI Apps</div>
              <div className="method-desc">Paytm, Google Pay, PhonePe, BHIM</div>
            </div>
            {paymentMethod === "upi" && (
               <div style={{ width: 22, height: 22, background: '#4f46e5', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
            )}
          </div>

          <div 
            className={`method-btn ${paymentMethod === "card" ? "active" : ""}`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="method-icon">💳</div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div className="method-title">Credit / Debit Card</div>
              <div className="method-desc">Visa, Mastercard, RuPay processed locally</div>
            </div>
            {paymentMethod === "card" && (
               <div style={{ width: 22, height: 22, background: '#4f46e5', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
            )}
          </div>

          <div 
            className={`method-btn ${paymentMethod === "cash" ? "active" : ""}`}
            onClick={() => setPaymentMethod("cash")}
          >
            <div className="method-icon">💵</div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div className="method-title">Cash on Counter</div>
              <div className="method-desc">Collect cash manually and mark as paid</div>
            </div>
            {paymentMethod === "cash" && (
               <div style={{ width: 22, height: 22, background: '#4f46e5', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
            )}
          </div>

          {paymentMethod === "card" && (
            <div style={{ marginTop: 24, padding: '20px', background: '#f8fafc', borderRadius: 16, border: '1px solid #e0e7ff' }} className="form-group">
              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input 
                  type="text"
                  placeholder="John Doe" 
                  className="input-field"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    maxLength={19}
                    placeholder="4000 1234 5678 9010" 
                    className="input-field"
                    value={cardNumber}
                    onChange={e => {
                      // auto-format with spaces
                      let val = e.target.value.replace(/\D/g, '');
                      val = val.replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(val);
                    }}
                    style={{ paddingLeft: 45 }}
                  />
                  <svg style={{ position: 'absolute', left: 14, top: 15, color: '#9ca3af' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
              </div>
              
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input 
                    type="text"
                    placeholder="MM/YY" 
                    maxLength={5}
                    className="input-field"
                    value={expiry}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                      setExpiry(val);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input 
                    type="password"
                    placeholder="•••" 
                    maxLength={4}
                    className="input-field"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div style={{ marginTop: 15, padding: '10px 14px', background: '#fffbeb', borderRadius: 8, fontSize: 13, color: '#b45309', display: 'flex', gap: 10 }}>
                <span>ℹ️</span>
                <span>Test Mode: Ensure the card number ends with <strong>000</strong> to trigger a failure simulation. Otherwise, it will succeed.</span>
              </div>
            </div>
          )}
          
          <button onClick={handlePayment} className="pay-btn">
            Pay ₹{(finalTotal || 4500).toLocaleString()}
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24, fontSize: 13, color: '#9ca3af' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            256-bit SSL Encrypted Sandbox
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="summary-panel">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#111827' }}>Order Summary</h3>
          
          <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 10, marginBottom: 20 }}>
            {cart && cart.length > 0 ? (
              cart.map((item, i) => (
                <div key={i} className="summary-row" style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      📦
                    </div>
                    <div>
                      <div className="summary-item-name">{item.name}</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#374151' }}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              // Dummy items just for showcase if visited directly without state
              <>
                <div className="summary-row" style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👕</div>
                    <div>
                      <div className="summary-item-name">Premium Cotton Shirt</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>Qty: 2</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#374151' }}>₹2,400</div>
                </div>
                <div className="summary-row" style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👖</div>
                    <div>
                      <div className="summary-item-name">Slim Fit Denim</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>Qty: 1</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#374151' }}>₹1,850</div>
                </div>
              </>
            )}
          </div>
          
          <div className="divider"></div>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span style={{ fontWeight: 500 }}>₹{(total || 4250).toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>GST (Included)</span>
            <span style={{ fontWeight: 500 }}>₹{(gst || 250).toLocaleString()}</span>
          </div>
          
          <div className="divider" style={{ borderTop: '2px dashed #e5e7eb', background: 'transparent' }}></div>
          
          <div className="total-row">
            <span>Total to Pay</span>
            <span style={{ fontSize: 24, color: '#4f46e5' }}>₹{(finalTotal || 4500).toLocaleString()}</span>
          </div>

          {(customer || true) && (
            <div className="customer-card">
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>Billed To</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {customer ? customer.name.charAt(0) : 'J'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{customer ? customer.name : 'Jane Smith'}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{customer ? customer.phone : '+91 98765 43210'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

