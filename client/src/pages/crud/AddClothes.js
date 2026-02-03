import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddClothes() {
  const navigate = useNavigate();

  const fields = [
    { name: "name", placeholder: "Name" },
    { name: "category", placeholder: "Category" },
    { name: "size", placeholder: "Size" },
    { name: "color", placeholder: "Color" },
    { name: "price", placeholder: "Price", type: "number" },
    { name: "quantity", placeholder: "Quantity", type: "number" },
    { name: "barcode", placeholder: "Barcode (Scan or Type)" },
  ];

  const [form, setForm] = useState({
    name: "",
    category: "",
    size: "",
    color: "",
    price: "",
    quantity: "",
    barcode: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const requiredFields = ["name", "category", "size", "color", "price", "quantity"];
    const missing = requiredFields.filter(field => !form[field]);

    if (missing.length > 0) {
      setError(`Missing required fields: ${missing.join(", ")}`);
      return;
    }

    if (Number(form.price) <= 0 || Number(form.quantity) <= 0) {
      setError("Price and Quantity must be greater than 0");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key] !== null) formData.append(key, form[key]);
    });

    try {
      await api.post("/clothes/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Clothes added successfully!");

      setForm({
        name: "",
        category: "",
        size: "",
        color: "",
        price: "",
        quantity: "",
        barcode: "",
        image: null,
      });

      setTimeout(() => {
        navigate("/admin/inventory");
      }, 1000);
    } catch (err) {
      setError("Failed to add clothes");
    }
  };

  // ====== Inline Styles ======
  const styles = {
    container: {
      maxWidth: "550px",
      margin: "50px auto",
      padding: "35px 30px",
      background: "#fdf6ed",
      borderRadius: "16px",
      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)",
      fontFamily: "Segoe UI, sans-serif",
      position: "relative",
    },
    title: {
      textAlign: "center",
      color: "#3a2b1b",
      marginBottom: "25px",
      fontSize: "26px",
      fontWeight: "600",
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      marginBottom: "16px",
      border: "1px solid #d4cbbd",
      borderRadius: "10px",
      fontSize: "15px",
      outline: "none",
      transition: "0.2s",
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "#7b5a2b",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "12px",
      fontWeight: "500",
    },
    backButton: {
      position: "absolute",
      top: "20px",
      left: "20px",
      padding: "10px 16px",
      background: "#ccc",
      color: "#333",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "500",
    },
    error: {
      color: "#ff3b3b",
      textAlign: "center",
      marginBottom: "14px",
      fontWeight: "500",
    },
    success: {
      color: "#2a8a2a",
      textAlign: "center",
      marginBottom: "14px",
      fontWeight: "500",
    },
    label: {
      display: "block",
      marginBottom: "6px",
      color: "#666",
      fontSize: "14px",
      fontWeight: "500",
    },
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={styles.container}>
        <h2 style={styles.title}>Add Clothes</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        {fields.map((field) => (
          <input
            key={field.name}
            placeholder={field.placeholder}
            value={form[field.name]}
            type={field.type || "text"}
            onChange={(e) =>
              setForm({ ...form, [field.name]: e.target.value })
            }
            style={styles.input}
          />
        ))}

        <div style={{ marginBottom: "16px" }}>
          <label style={styles.label}>Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            style={styles.input}
          />
        </div>

        <button onClick={handleSubmit} style={styles.button}>
          Add
        </button>
      </div>
    </div>
  );
}
