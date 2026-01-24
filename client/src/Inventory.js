import axios from "axios";
import { useEffect, useState } from "react";

export default function Inventory() {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/clothes")
      .then(res => setClothes(res.data));
  }, []);

  return (
    <ul>
      {clothes.map(c => (
        <li key={c._id}>
          {c.name} - {c.quantity}
        </li>
      ))}
    </ul>
  );
}
