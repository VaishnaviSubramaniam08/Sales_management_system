import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditClothes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    size: "",
    color: "",
    price: "",
    quantity: "",
    image: null
  });
  const [currentImage, setCurrentImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchCloth();
  }, []);

  const fetchCloth = async () => {
    try {
      const res = await api.get(`/clothes/${id}`);
      const { name, category, size, color, price, quantity, image } = res.data;
      setForm({ name, category, size, color, price, quantity, image: null });
      setCurrentImage(image || "");
    } catch {
      alert("Failed to load");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setImageUrl("");
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'image') {
          if (form[key]) {
            formData.append('image', form[key]);
          } else if (imageUrl) {
            formData.append('image', imageUrl);
          }
        } else {
          formData.append(key, form[key]);
        }
      });

      await api.put(`/clothes/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/admin/inventory");
    } catch {
      alert("Update failed");
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith('http') || img.startsWith('blob')) return img;
    return `http://localhost:5000${img}`;
  };

  const styles = {
    container: { maxWidth: "550px", margin: "40px auto", padding: "30px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
    input: { width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #ddd" },
    button: { width: "100%", padding: "12px", background: "#333", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" },
    label: { display: "block", marginBottom: "5px", fontSize: "14px", color: "#666" }
  };

  return (
    <div style={styles.container}>
      <h2>Edit Clothes</h2>

      <div>
        <label style={styles.label}>Name</label>
        <input name="name" value={form.name} onChange={handleInputChange} style={styles.input} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={styles.label}>Category</label>
          <input name="category" value={form.category} onChange={handleInputChange} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Size</label>
          <input name="size" value={form.size} onChange={handleInputChange} style={styles.input} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={styles.label}>Color</label>
          <input name="color" value={form.color} onChange={handleInputChange} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Price</label>
          <input name="price" type="number" value={form.price} onChange={handleInputChange} style={styles.input} />
        </div>
      </div>

      <div>
        <label style={styles.label}>Quantity</label>
        <input name="quantity" type="number" value={form.quantity} onChange={handleInputChange} style={styles.input} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={styles.label}>Image (Current: {currentImage ? 'Set' : 'None'})</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
           <input type="file" accept="image/*" onChange={handleFileChange} style={{ ...styles.input, marginBottom: 0 }} />
        </div>
        <div style={{ textAlign: 'center', margin: '5px 0', fontSize: '12px', color: '#888' }}>- OR -</div>
        <input 
          placeholder="New Image URL" 
          value={imageUrl} 
          onChange={(e) => {
            setImageUrl(e.target.value);
            setForm({ ...form, image: null });
          }} 
          style={styles.input} 
        />
        
        {(form.image || imageUrl || currentImage) && (
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#888' }}>Preview:</p>
            <img 
              src={form.image ? URL.createObjectURL(form.image) : (imageUrl || getImageUrl(currentImage))} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} 
            />
          </div>
        )}
      </div>

      <button onClick={handleUpdate} style={styles.button}>Update Clothes</button>
    </div>
  );
}
