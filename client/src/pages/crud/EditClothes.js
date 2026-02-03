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
      setForm(res.data);
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
        <input
          key={key}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={key}
          style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
        />
      ))}

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
