import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function InventoryContent() {
  const [clothes, setClothes] = useState([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    api.get("clothes").then(res => setClothes(res.data));
  }, []);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      parseVoiceQuery(transcript);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  const parseVoiceQuery = (transcript) => {
    let query = transcript.toLowerCase();
    let maxPrice = "";

    const priceMatch = query.match(/(?:under|below|less than)\s+(\d+)/);
    if (priceMatch) {
      maxPrice = priceMatch[1];
      query = query.replace(priceMatch[0], "").trim();
    }

    api.get(`clothes?search=${query}&maxPrice=${maxPrice}`).then(res => setClothes(res.data));
  };

  const styles = {
    inventoryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "40px 20px",
      marginTop: "20px"
    },
    card: {
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    cardName: {
      fontWeight: "600",
      fontSize: "16px",
      marginBottom: "4px",
      textAlign: "center",
      color: "#111",
    },
    cardQty: {
      color: "#666",
      fontSize: "14px",
      textAlign: "center",
    },
    container: {
      background: "#fff",
      padding: "25px",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      minHeight: "calc(100vh - 100px)",
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Inventory</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            placeholder="Search clothes..."
            onChange={(e) => api.get(`clothes?search=${e.target.value}`).then(res => setClothes(res.data))}
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", width: "250px" }}
          />
          <button onClick={startVoiceSearch} style={{
            marginLeft: "10px",
            padding: "8px 12px",
            borderRadius: "50%",
            border: "none",
            background: isListening ? "red" : "#ddd",
            cursor: "pointer",
            fontSize: "16px"
          }}>
            🎤
          </button>
        </div>
      </div>

      <div style={styles.inventoryGrid}>
        {clothes.map((c) => (
          <div style={styles.card} key={c._id}>
            <div style={{
              width: "100%",
              aspectRatio: "3/4",
              marginBottom: "15px",
              borderRadius: "8px",
              overflow: "hidden",
              height: "auto",
              backgroundColor: "#f0f0f0",
              position: "relative"
            }}>
              {c.image ? (
                <img
                  src={c.image.startsWith('http') ? c.image : `http://localhost:5000${c.image}`}
                  alt={c.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa"
                }}>
                  No Image
                </div>
              )}
            </div>

            <div style={styles.cardName}>{c.name}</div>
            <div style={styles.cardQty}>
              {c.category} <span style={{ margin: "0 5px" }}>•</span> ₹{c.price}
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "5px", textAlign: "center" }}>
              {c.quantity} items left
            </div>


            {localStorage.getItem("role") === "admin" && (
              <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "10px" }}>
                <Link to={`/admin/edit/${c._id}`} style={{ textDecoration: "none", fontSize: "12px", background: "#333", color: "white", padding: "8px 16px", borderRadius: "20px" }}>
                  Edit
                </Link>
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure?")) {
                      await api.delete(`clothes/${c._id}`);
                      setClothes(clothes.filter(x => x._id !== c._id));
                    }
                  }}
                  style={{ border: "none", fontSize: "12px", background: "transparent", color: "#d32f2f", padding: "8px 16px", cursor: "pointer", textDecoration: "underline" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
