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
  });

  useEffect(() => {
    fetchCloth();
  }, []);

  const fetchCloth = async () => {
    try {
      const res = await api.get(`/clothes/${id}`);
      const { name, category, size, color, price, quantity, barcode } = res.data;
      setForm({ name, category, size, color, price, quantity, barcode: barcode || "" });
    } catch {
      alert("Failed to load");
    }
  };

  const generateBarcode = () => {
    const code = "CLO-" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
    setForm({ ...form, barcode: code });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/clothes/${id}`, form);
      navigate("/admin/inventory");
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Clothes</h2>

      {Object.keys(form).map((key) => (
        <div key={key} style={{ position: 'relative', marginBottom: "10px" }}>
          <input
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={key}
            style={{ padding: "10px", width: "100%" }}
          />
          {key === "barcode" && (
            <button 
              onClick={generateBarcode}
              style={{
                position: 'absolute',
                right: '10px',
                top: '5px',
                padding: '5px 10px',
                background: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Generate
            </button>
          )}
        </div>
      ))}

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
