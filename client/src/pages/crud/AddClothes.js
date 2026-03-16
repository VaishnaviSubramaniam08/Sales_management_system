import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddClothes() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    size: "",
    color: "",
    price: "",
    costPrice: "",
    quantity: "",
    supplier: "",
    image: null, // will be file object or URL
  });
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get("suppliers");
        setSuppliers(res.data);
      } catch (err) {
        console.error("Failed to fetch suppliers");
      }
    };
    fetchSuppliers();
  }, []);

  const profit = form.price && form.costPrice ? (Number(form.price) - Number(form.costPrice)).toFixed(2) : 0;

  const validate = () => {
    let newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.size) newErrors.size = "Size is required";
    if (!form.color) newErrors.color = "Color is required";
    if (!form.price || Number(form.price) <= 0) newErrors.price = "Selling Price must be > 0";
    if (!form.costPrice || Number(form.costPrice) <= 0) newErrors.costPrice = "Cost Price must be > 0";
    if (!form.quantity || Number(form.quantity) <= 0) newErrors.quantity = "Quantity must be > 0";
    if (!form.supplier) newErrors.supplier = "Supplier is required";
    if (!form.image && !imageUrl) newErrors.image = "Image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setImageUrl(""); // Clear URL if file is selected
    }
  };


  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'image' && form[key]) {
          formData.append('image', form[key]);
        } else if (key !== 'image') {
          formData.append(key, form[key]);
        }
      });
      
      if (imageUrl && !form.image) {
        formData.append('image', imageUrl);
      }

      await api.post("clothes/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess("Cloth Added Successfully!");
      setForm({
        name: "", category: "", size: "", color: "",
        price: "", costPrice: "", quantity: "",
        supplier: "", image: null,
      });
      setImageUrl("");
      setTimeout(() => {
        setSuccess("");
        navigate("/admin/inventory");
      }, 1000);
    } catch (err) {
      setErrors({ server: "Failed to add cloth" });
    }
  };

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
    error: { color: "#ff3b3b", textAlign: "center", marginBottom: "14px", fontWeight: "500", fontSize: '13px' },
    success: { color: "#2a8a2a", textAlign: "center", marginBottom: "14px", fontWeight: "500" },
    label: { display: "block", marginBottom: "6px", color: "#666", fontSize: "14px", fontWeight: "500" },
    fieldGroup: { marginBottom: '16px', position: 'relative' }
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={styles.container}>
        <h2 style={styles.title}>Add Clothes</h2>

        {success && <p style={styles.success}>{success}</p>}
        {errors.server && <p style={styles.error}>{errors.server}</p>}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Name</label>
          <input name="name" value={form.name} onChange={handleInputChange} placeholder="Name" style={styles.input} />
          {errors.name && <span style={styles.error}>{errors.name}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={styles.label}>Category</label>
            <input 
              name="category" 
              value={form.category} 
              onChange={handleInputChange} 
              placeholder="e.g. Shirt, Pant" 
              style={styles.input} 
            />
            {errors.category && <span style={styles.error}>{errors.category}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={styles.label}>Size</label>
            <input 
              name="size" 
              value={form.size} 
              onChange={handleInputChange} 
              placeholder="e.g. S, M, L, XL" 
              style={styles.input} 
            />
            {errors.size && <span style={styles.error}>{errors.size}</span>}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Color</label>
          <input name="color" value={form.color} onChange={handleInputChange} placeholder="Color" style={styles.input} />
          {errors.color && <span style={styles.error}>{errors.color}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={styles.label}>Selling Price</label>
            <input name="price" type="number" value={form.price} onChange={handleInputChange} placeholder="Price" style={styles.input} />
            {errors.price && <span style={styles.error}>{errors.price}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={styles.label}>Cost Price</label>
            <input name="costPrice" type="number" value={form.costPrice} onChange={handleInputChange} placeholder="Cost Price" style={styles.input} />
            {errors.costPrice && <span style={styles.error}>{errors.costPrice}</span>}
          </div>
        </div>

        <div style={{ padding: '12px 16px', background: '#fff', borderRadius: '10px', marginBottom: '20px', fontSize: '15px', border: '1px solid #d4cbbd', color: '#3a2b1b', fontWeight: '600' }}>
          Calculated Profit: <span style={{ color: Number(profit) >= 0 ? '#2a8a2a' : '#ff3b3b' }}>₹{profit}</span>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Quantity</label>
          <input name="quantity" type="number" value={form.quantity} onChange={handleInputChange} placeholder="Quantity" style={styles.input} />
          {errors.quantity && <span style={styles.error}>{errors.quantity}</span>}
        </div>


        <div style={styles.fieldGroup}>
          <label style={styles.label}>Supplier</label>
          <select name="supplier" value={form.supplier} onChange={handleInputChange} style={styles.input}>
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          {errors.supplier && <span style={styles.error}>{errors.supplier}</span>}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Image (File Upload or URL)</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ ...styles.input, marginBottom: 0, flex: 1 }} 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ textAlign: 'center', margin: '5px 0', fontSize: '12px', color: '#888' }}>- OR -</div>
            <input 
              name="image" 
              value={imageUrl} 
              onChange={(e) => {
                setImageUrl(e.target.value);
                setForm({ ...form, image: null }); // Clear file if URL is entered
              }} 
              placeholder="Image URL" 
              style={{ ...styles.input, marginBottom: 0 }} 
            />
          </div>
          {errors.image && <span style={styles.error}>{errors.image}</span>}
          {(form.image || imageUrl) && (
            <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d4cbbd' }}>
              <img 
                src={form.image ? URL.createObjectURL(form.image) : imageUrl} 
                alt="Preview" 
                style={{ width: '100%', display: 'block' }} 
                onError={(e) => e.target.style.display='none'} 
              />
            </div>
          )}
        </div>

        <button onClick={handleSubmit} style={{ ...styles.button, background: '#5d4037' }}>Add Clothes</button>
      </div>
    </div>
  );
}
