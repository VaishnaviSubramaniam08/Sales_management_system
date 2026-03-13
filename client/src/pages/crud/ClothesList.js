import { useEffect, useState } from "react";
import api from "../../api/axios";

import { useNavigate } from "react-router-dom";

export default function ClothesList() {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    const res = await api.get("clothes");
    setClothes(res.data);
  };

  const handleDelete = async (id) => {
    await api.delete(`clothes/${id}`);
    fetchClothes();
  };

  const filtered = clothes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Clothes List</h2>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "20px" }}
      />

      <button onClick={() => navigate("/add")} style={{ marginBottom: "20px" }}>
        Add Clothes
      </button>

      {filtered.map((c) => (
        <div key={c._id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
          <h4>{c.name}</h4>
          <p>Category: {c.category}</p>
          <p>Size: {c.size}</p>
          <p>Color: {c.color}</p>
          <p>Price: ₹{c.price}</p>
          <p>Stock: {c.quantity}</p>

          <button onClick={() => navigate(`/edit/${c._id}`)}>Edit</button>
          <button onClick={() => handleDelete(c._id)} style={{ marginLeft: "10px" }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
