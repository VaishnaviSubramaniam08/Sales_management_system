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
    const res = await api.get(`/clothes`);
    const cloth = res.data.find((c) => c._id === id);
    setForm(cloth);
  };

  const handleUpdate = async () => {
    await api.put(`/clothes/${id}`, form);
    navigate("/clothes");
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
