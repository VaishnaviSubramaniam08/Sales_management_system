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
  ];

  const [form, setForm] = useState({
    name: "",
    category: "",
    size: "",
    color: "",
    price: "",
    quantity: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    for (let key in form) {
      if (!form[key]) {
        setError("All fields are required");
        return;
      }
    }

    // Numeric validation
    if (Number(form.price) <= 0 || Number(form.quantity) <= 0) {
      setError("Price and Quantity must be greater than 0");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("size", form.size);
    formData.append("color", form.color);
    formData.append("price", form.price);
    formData.append("quantity", form.quantity);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      await api.post("/clothes/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Clothes added successfully!");

      // Reset form
      setForm({
        name: "",
        category: "",
        size: "",
        color: "",
        price: "",
        price: "",
        quantity: "",
        image: null,
      });

      // Navigate back to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError("Failed to add clothes");
    }
  };

  // ====== Inline Styles ======
  const styles = {
    container: {
      maxWidth: "500px",
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
    input: {
      width: "100%",
      padding: "12px 14px",
      marginBottom: "14px",
      border: "1px solid #d4cbbd",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
      transition: "0.2s",
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
  };

  return (
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

      <div style={{ marginBottom: "14px" }}>
        <label style={{ display: "block", marginBottom: "5px", color: "#666" }}>
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm({ ...form, image: e.target.files[0] })
          }
          style={styles.input}
        />
      </div>

      <button onClick={handleSubmit} style={styles.button}>
        Add
      </button>
    </div>
  );
}
