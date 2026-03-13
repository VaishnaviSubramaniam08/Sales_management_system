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
      const { name, category, size, color, price, quantity } = res.data;
      setForm({ name, category, size, color, price, quantity });
    } catch {
      alert("Failed to load");
    }
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
        </div>
      ))}

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
