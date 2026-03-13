import { useEffect, useState } from "react";
import api from "../api/axios";
import PaymentModal from "./PaymentModal";

export default function Sales() {
  const [clothes, setClothes] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchClothes();
  }, []); 

  const fetchClothes = async () => {
    const res = await api.get("clothes");
    setClothes(res.data);
    try {
      const settings = await api.get("settings/gst_rate");
      setGstRate(settings.data.value);
    } catch (e) {
      setGstRate(0);
    }
  };

  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState(null);
  const [isFestive, setIsFestive] = useState(false);
  const [loyalty, setLoyalty] = useState(null); // { discountPercent, totalSpent, visitCount, ... }
  const [gstRate, setGstRate] = useState(0);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);

  const checkLoyalty = async () => {
    try {
      const res = await api.get(`customers/search?query=${customerPhone}`);
      if (res.data.length > 0) {
        const selected = res.data[0];
        setCustomer(selected);
        // Fetch loyalty eligibility details
        try {
          const loy = await api.get(`customers/loyalty/${selected._id}`);
          setLoyalty(loy.data);
          setSuccess(`Customer Found: ${selected.name}. (Spent: ₹${loy.data.totalSpent}, Visits: ${loy.data.visitCount}, Eligible: ${loy.data.discountPercent}% )`);
        } catch (e) {
          setLoyalty(null);
          setSuccess(`Customer Found: ${selected.name}. (Spent: ₹${selected.totalSpent})`);
        }
      } else {
        setError("");
        setSuccess("");
        setCustomer(null);
        setLoyalty(null);
        setShowCreateCustomer(true);
      }
    } catch (err) {
      setError("Error checking loyalty");
    }
  };

  const createCustomer = async () => {
    try {
      if (!newCustomerName.trim() || !customerPhone.trim()) {
        setError("Enter customer name and phone");
        return;
      }
      const res = await api.post('customers/add', { name: newCustomerName.trim(), phone: customerPhone.trim() });
      const created = res.data;
      setCustomer(created);
      setShowCreateCustomer(false);
      setNewCustomerName("");
      // Fetch loyalty baseline
      try {
        const loy = await api.get(`customers/loyalty/${created._id}`);
        setLoyalty(loy.data);
      } catch {
        setLoyalty(null);
      }
      setSuccess(`Customer Created: ${created.name}`);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const addToCart = (clothId, qty) => {
    setError("");
    setSuccess("");

    if (qty <= 0) {
      setError("Quantity must be at least 1");
      return;
    }

    const cloth = clothes.find((c) => c._id === clothId);
    if (!cloth) {
      setError("Cloth not found");
      return;
    }

    if (cloth.quantity < qty) {
      setError("Insufficient stock");
      return;
    }

    // Old Stock Discount (Example: > 6 months)
    let finalPrice = cloth.price;
    let oldStockMsg = "";
    if (cloth.createdAt) {
      const diffTime = Math.abs(Date.now() - new Date(cloth.createdAt));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 180) { // 6 months
        finalPrice = Math.floor(cloth.price * 0.8); // 20% off
        oldStockMsg = " (Old Stock 20% Off)";
      }
    }

    // Check if already in cart
    const exist = cart.find((c) => c.clothId === clothId);
    if (exist) {
      setCart(
        cart.map((c) =>
          c.clothId === clothId ? { ...c, quantity: c.quantity + qty } : c
        )
      );
    } else {
      setCart([...cart, {
        clothId,
        quantity: qty,
        name: cloth.name + oldStockMsg,
        price: finalPrice
      }]);
    }
  };




  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);

  const makeSale = async () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let discountDetails = { type: "None", amount: 0 };

    // Priority: Festive 10% toggle overrides loyalty
    if (isFestive) {
      const amount = Math.floor(subtotal * 0.10);
      discountDetails = { type: "festive_10", amount };
    } else if (loyalty && loyalty.discountPercent > 0) {
      const pct = Number(loyalty.discountPercent) || 0;
      const amount = Math.floor(subtotal * (pct / 100));
      discountDetails = { type: `loyalty_${pct}`, amount };
    }

    const afterDisc = subtotal - discountDetails.amount;

    // Points Redemption (1 point = 1 unit of currency)
    let pointsToRedeem = 0;
    if (redeemPoints && customer && customer.points > 0) {
      pointsToRedeem = Math.min(customer.points, afterDisc);
      // We'll pass this to the backend
    }

    const finalAfterPoints = afterDisc - pointsToRedeem;
    const taxAmount = Math.floor(finalAfterPoints * (gstRate / 100));

    try {
      const res = await api.post("sales/add", {
        items: cart,
        customerId: customer ? customer._id : null,
        discountDetails,
        pointsRedeemed: pointsToRedeem,
        taxDetails: {
          rate: gstRate,
          amount: taxAmount
        }
      });
      setCurrentSale(res.data.sale);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Sale failed");
    }
  };

  const handlePaymentSuccess = async (saleId) => {
    setShowPaymentModal(false);
    setSuccess("Sale & Payment completed successfully! Downloading bill...");
    
    // Auto download bill
    const targetSaleId = saleId || (currentSale && currentSale._id);
    if (targetSaleId) {
      await downloadInvoice(targetSaleId);
    }

    // Auto-clear success message 
    setTimeout(() => {
        setSuccess("");
    }, 4000);

    setCart([]);
    setCurrentSale(null); // Clear current sale to reset UI completely
    fetchClothes();
  };

  const printThermalReceipt = (sale) => {
    if (!sale) return;
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    const itemsHtml = sale.items.map(item => `
      <tr>
        <td style="padding: 5px 0;">${item.name || 'Item'} x${item.quantity}</td>
        <td style="text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');

    const subtotal = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = sale.taxDetails?.amount || 0;
    const discount = sale.discountDetails?.amount || 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>Thermal Receipt</title>
          <style>
            @media print { body { width: 80mm; margin: 0; padding: 5mm; } }
            body { font-family: 'Courier New', monospace; width: 80mm; font-size: 12px; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            .total { border-top: 1px dashed #000; margin-top: 10px; padding-top: 5px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0;">SELVALAKSHMI</h2>
            <p style="margin: 5px 0;">Garment Retailer</p>
            <p style="margin: 0; font-size: 10px;">Date: ${new Date(sale.date || Date.now()).toLocaleString()}</p>
          </div>
          <table>
            ${itemsHtml}
          </table>
          <div class="total">
            <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <span>₹${subtotal}</span></div>
            ${discount > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Discount:</span> <span>-₹${discount}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between;"><span>Tax:</span> <span>₹${tax}</span></div>
            <div style="display:flex; justify-content:space-between; font-size: 14px; margin-top: 5px;"><span>GRAND TOTAL:</span> <span>₹${sale.totalAmount}</span></div>
          </div>
          <div class="footer">
            <p>Thank you for shopping!</p>
            <p>Please visit again.</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  
  const downloadInvoice = async (saleId) => {
    try {
        const response = await api.get(`sales/invoice/${saleId}`, {
            responseType: "blob",
        });

        // Extract filename from the server's Content-Disposition header
        let filename = `sales_${saleId}.pdf`;
        const disposition = response.headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (err) {
        console.error("Invoice download failed");
    }
  };

  // ====== Inline Styles ======
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "30px 25px",
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      fontFamily: "Segoe UI, sans-serif",
      minHeight: "calc(100vh - 100px)",
    },
    title: {
      textAlign: "center",
      color: "#3a2b1b",
      marginBottom: "20px",
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
      marginBottom: "12px",
    },
    select: {
      width: "60%",
      padding: "12px 14px",
      border: "1px solid #d4cbbd",
      borderRadius: "8px",
      fontSize: "15px",
    },
    input: {
      width: "35%",
      padding: "12px 14px",
      border: "1px solid #d4cbbd",
      borderRadius: "8px",
      fontSize: "15px",
    },
    button: {
      width: "100%",
      padding: "12px",
      background: "#7b5a2b",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "10px",
    },
    error: {
      color: "#ff3b3b",
      textAlign: "center",
      marginBottom: "12px",
    },
    success: {
      color: "#2a8a2a",
      textAlign: "center",
      marginBottom: "12px",
    },
    cartItem: {
      borderBottom: "1px solid #d4cbbd",
      padding: "10px 0",
    },
  };

  // Cart Total
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sales</h2>

      {error && <p style={styles.error}>{error}</p>}
      {success && (
        <div style={{ ...styles.success, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '20px', background: '#d4edda', borderRadius: '8px', marginBottom: '20px', width: '100%', border: '1px solid #c3e6cb' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>{success}</h3>
            <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>Redirecting to New Sale...</p>
          </div>
        </div>
      )}

      {/* Customer & Discount Controls */}
      <div style={{ padding: "15px", background: "#f9f9f9", borderRadius: "8px", marginBottom: "20px", border: "1px solid #eee" }}>
        <h4 style={{ marginTop: 0 }}>Customer & Discounts</h4>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
          <input
            placeholder="Customer Phone"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            style={{ ...styles.input, width: "200px", margin: 0 }}
          />
          <button onClick={checkLoyalty} style={{ ...styles.button, width: "auto", margin: 0, padding: "10px 20px" }}>
            Check Loyalty
          </button>
        </div>
        {showCreateCustomer && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <input
              placeholder="Customer Name"
              value={newCustomerName}
              onChange={e => setNewCustomerName(e.target.value)}
              style={{ ...styles.input, width: '200px', margin: 0 }}
            />
            <button onClick={createCustomer} style={{ ...styles.button, width: 'auto', margin: 0, padding: '10px 20px' }}>
              Create Customer
            </button>
          </div>
        )}
        {customer && (
          <div style={{ color: "green", fontSize: "14px" }}>
            Verified: {customer.name}
            {loyalty ? (
              <> (Total Spent: ₹{loyalty.totalSpent} • Visits: {loyalty.visitCount} • Eligible Discount: {loyalty.discountPercent}%)</>
            ) : (
              <> (Total Spent: ₹{customer.totalSpent})</>
            )}
          </div>
        )}

        <div style={{ marginTop: "10px", display: "flex", gap: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input type="checkbox" checked={isFestive} onChange={e => setIsFestive(e.target.checked)} />
            Apply Festive Season Discount (10%)
          </label>
          {customer && customer.points > 0 && (
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" checked={redeemPoints} onChange={e => setRedeemPoints(e.target.checked)} />
              Redeem Points ({customer.points} available)
            </label>
          )}
        </div>
      </div>

      {/* SELECT + QTY */}
      <AddToCartForm
        clothes={clothes}
        addToCart={addToCart}
        styles={styles}
      />

      {/* CART */}
      {cart.length > 0 && (
        <div>
          <h3>Cart</h3>
          {cart.map((item) => (
            <div key={item.clothId} style={styles.cartItem}>
              <p>
                <b>{item.name}</b> - {item.quantity} pcs @ ₹{item.price}
              </p>
            </div>
          ))}
          {/* Totals block with preview of discount */}
          <div style={{ marginTop: "10px" }}>
            <div>Subtotal: ₹{total}</div>
            <div>
              Discount: {isFestive ? "Festive 10%" : (loyalty && loyalty.discountPercent > 0 ? `Loyalty ${loyalty.discountPercent}%` : "None")}
            </div>
            <div>
              Tax (GST {gstRate}%): ₹{
                (() => {
                  const subtotal = total;
                  const pct = isFestive ? 10 : (loyalty?.discountPercent || 0);
                  const disc = Math.floor(subtotal * (pct / 100));
                  const afterDisc = subtotal - disc;
                  return Math.floor(afterDisc * (gstRate / 100));
                })()
              }
            </div>
            <div>
              Grand Total: ₹{
                (() => {
                  const subtotal = total;
                  const pct = isFestive ? 10 : (loyalty?.discountPercent || 0);
                  const disc = Math.floor(subtotal * (pct / 100));
                  const afterDisc = subtotal - disc;
                  const tax = Math.floor(afterDisc * (gstRate / 100));
                  return afterDisc + tax;
                })()
              }
            </div>
          </div>
          <button onClick={makeSale} style={styles.button}>
            Complete Sale
          </button>
        </div>
      )}
      {showPaymentModal && currentSale && (
        <PaymentModal
          sale={currentSale}
          cart={cart}
          subtotal={total}
          taxAmount={(() => {
            const subtotal = total;
            const pct = isFestive ? 10 : (loyalty?.discountPercent || 0);
            const disc = Math.floor(subtotal * (pct / 100));
            return Math.floor((subtotal - disc) * (gstRate / 100));
          })()}
          customer={customer}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

function AddToCartForm({ clothes, addToCart, styles }) {
  const [clothId, setClothId] = useState("");
  const [qty, setQty] = useState(1);
  const [filterText, setFilterText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search not supported");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    setIsListening(true);
    recognition.onresult = (e) => {
      setFilterText(e.results[0][0].transcript.toLowerCase());
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };


  const visibleClothes = clothes.filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()));

  const selectedCloth = clothes.find((c) => c._id === clothId);

  return (
    <div style={styles.row}>
      <div style={{ width: "60%" }}>
        <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
          <input
            placeholder="Search by name... (or Voice)"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{ ...styles.input, width: "100%", marginBottom: 0 }}
          />
          <button onClick={startVoiceSearch} style={{
            padding: "0 15px", borderRadius: "8px", border: "1px solid #ddd", background: isListening ? "red" : "#f0f0f0", cursor: "pointer"
          }}>🎤</button>
        </div>

        <select
          value={clothId}
          onChange={(e) => setClothId(e.target.value)}
          style={{ ...styles.select, width: "100%" }}
        >
          <option value="">Select Cloth</option>
          {visibleClothes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} (Stock: {c.quantity})
            </option>
          ))}
        </select>
        {selectedCloth && selectedCloth.image && (
          <div style={{
            marginTop: "10px",
            width: "100%",
            height: "150px",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#f9f9f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #d4cbbd"
          }}>
            <img
              src={`http://localhost:5000${selectedCloth.image}`}
              alt={selectedCloth.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>

      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        style={styles.input}
      />

      <button
        style={{ ...styles.button, width: "30%", height: "fit-content" }}
        onClick={() => addToCart(clothId, qty)}
      >
        Add
      </button>
    </div>
  );
}
