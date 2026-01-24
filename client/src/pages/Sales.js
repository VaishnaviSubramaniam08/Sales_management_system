import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Sales() {
  const [clothes, setClothes] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    const res = await api.get("/clothes");
    setClothes(res.data);
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

    // Check if already in cart
    const exist = cart.find((c) => c.clothId === clothId);
    if (exist) {
      setCart(
        cart.map((c) =>
          c.clothId === clothId ? { ...c, quantity: c.quantity + qty } : c
        )
      );
    } else {
      setCart([...cart, { clothId, quantity: qty, name: cloth.name, price: cloth.price }]);
    }
  };

  const makeSale = async () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }

    try {
      await api.post("/sales/add", { items: cart });

      setSuccess("Sale completed successfully!");
      setCart([]);
      fetchClothes();
    } catch (err) {
      setError(err.response?.data?.message || "Sale failed");
    }
  };

  // ====== Inline Styles ======
  const styles = {
    container: {
      maxWidth: "700px",
      margin: "50px auto",
      padding: "30px 25px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
      fontFamily: "Segoe UI, sans-serif",
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
      {success && <p style={styles.success}>{success}</p>}

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
          <h4>Total: ₹{total}</h4>
          <button onClick={makeSale} style={styles.button}>
            Complete Sale
          </button>
        </div>
      )}
    </div>
  );
}

function AddToCartForm({ clothes, addToCart, styles }) {
  const [clothId, setClothId] = useState("");
  const [qty, setQty] = useState(1);

  return (
    <div style={styles.row}>
      <select value={clothId} onChange={(e) => setClothId(e.target.value)} style={styles.select}>
        <option value="">Select Cloth</option>
        {clothes.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name} (Stock: {c.quantity})
          </option>
        ))}
      </select>

      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        style={styles.input}
      />

      <button
        style={{ ...styles.button, width: "30%" }}
        onClick={() => addToCart(clothId, qty)}
      >
        Add
      </button>
    </div>
  );
}
