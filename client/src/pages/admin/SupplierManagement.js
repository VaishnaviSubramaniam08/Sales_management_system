import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function SupplierManagement() {
    const [suppliers, setSuppliers] = useState([]);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [form, setForm] = useState({ 
        name: "", 
        contactPerson: "", 
        phone: "", 
        email: "", 
        address: "", 
        category: "" 
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get("suppliers");
            setSuppliers(res.data);
        } catch (err) {
            console.error("Failed to fetch suppliers");
        }
    };

    const validate = () => {
        let newErrors = {};
        if (!form.name) newErrors.name = "Supplier Name is required";
        if (!form.contactPerson) newErrors.contactPerson = "Contact Person is required";
        if (!form.phone || form.phone.toString().length !== 10) newErrors.phone = "Phone must be exactly 10 digits";
        if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
        if (!form.address) newErrors.address = "Address is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!validate()) return;

        try {
            if (editingSupplier) {
                await api.put(`suppliers/${editingSupplier._id}`, form);
                setSuccess("Supplier Updated Successfully!");
            } else {
                await api.post("suppliers/add", form);
                setSuccess("Supplier Added Successfully!");
            }
            
            setForm({ name: "", contactPerson: "", phone: "", email: "", address: "", category: "" });
            setEditingSupplier(null);
            fetchSuppliers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setErrors({ server: err.response?.data?.message || "Operation failed" });
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setForm({
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            category: supplier.category
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                await api.delete(`suppliers/${id}`);
                setSuccess("Supplier Deleted Successfully!");
                fetchSuppliers();
                setTimeout(() => setSuccess(""), 3000);
            } catch (err) {
                alert("Failed to delete supplier");
            }
        }
    };

    const styles = {
        container: {
            padding: "30px",
            maxWidth: "1000px",
            margin: "40px auto",
            backgroundColor: "#fdf6ed",
            borderRadius: "15px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        header: {
            color: "#3a2b1b",
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "28px",
            fontWeight: "bold"
        },
        formGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "30px"
        },
        inputGroup: {
            display: "flex",
            flexDirection: "column"
        },
        label: {
            marginBottom: "8px",
            fontWeight: "600",
            color: "#5d4037",
            fontSize: "14px"
        },
        input: {
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d4cbbd",
            fontSize: "15px",
            outline: "none",
            transition: "all 0.3s"
        },
        button: {
            padding: "14px 28px",
            backgroundColor: "#7b5a2b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            width: "100%",
            marginTop: "10px",
            transition: "background 0.3s"
        },
        table: {
            width: "100%",
            marginTop: "40px",
            borderCollapse: "collapse",
            backgroundColor: "white",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        },
        th: {
            backgroundColor: "#7b5a2b",
            color: "white",
            padding: "15px",
            textAlign: "left",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "1px"
        },
        td: {
            padding: "15px",
            borderBottom: "1px solid #eee",
            color: "#333",
            fontSize: "14px"
        },
        error: {
            color: "#d32f2f",
            fontSize: "12px",
            marginTop: "5px",
            fontWeight: "500"
        },
        success: {
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            padding: "15px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "600"
        },
        actionBtn: {
            padding: "6px 12px",
            marginRight: "8px",
            borderRadius: "5px",
            cursor: "pointer",
            border: "none",
            fontSize: "12px",
            fontWeight: "600"
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>{editingSupplier ? "Edit Supplier" : "Supplier Management"}</h2>
            
            {success && <div style={styles.success}>{success}</div>}
            {errors.server && <div style={{...styles.error, textAlign: 'center', marginBottom: '15px'}}>{errors.server}</div>}

            <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Supplier Name</label>
                        <input name="name" value={form.name} onChange={handleInputChange} placeholder="Name" style={styles.input} />
                        {errors.name && <span style={styles.error}>{errors.name}</span>}
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contact Person</label>
                        <input name="contactPerson" value={form.contactPerson} onChange={handleInputChange} placeholder="Contact Person" style={styles.input} />
                        {errors.contactPerson && <span style={styles.error}>{errors.contactPerson}</span>}
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone</label>
                        <input name="phone" value={form.phone} onChange={handleInputChange} placeholder="Phone (10 Digits)" style={styles.input} />
                        {errors.phone && <span style={styles.error}>{errors.phone}</span>}
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input name="email" value={form.email} onChange={handleInputChange} placeholder="Email" style={styles.input} />
                        {errors.email && <span style={styles.error}>{errors.email}</span>}
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Category</label>
                        <input name="category" value={form.category} onChange={handleInputChange} placeholder="Category (e.g. Fabric)" style={styles.input} />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Address</label>
                        <input name="address" value={form.address} onChange={handleInputChange} placeholder="Address" style={styles.input} />
                        {errors.address && <span style={styles.error}>{errors.address}</span>}
                    </div>
                </div>
                <button type="submit" style={styles.button}>
                    {editingSupplier ? "Update Supplier" : "Add Supplier"}
                </button>
                {editingSupplier && (
                    <button type="button" onClick={() => { setEditingSupplier(null); setForm({ name: "", contactPerson: "", phone: "", email: "", address: "", category: "" }); }} style={{ ...styles.button, backgroundColor: "#9e9e9e", marginTop: "10px" }}>
                        Cancel Edit
                    </button>
                )}
            </form>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map(s => (
                        <tr key={s._id}>
                            <td style={styles.td}>{s.name}</td>
                            <td style={styles.td}>{s.phone}</td>
                            <td style={styles.td}>{s.category || "-"}</td>
                            <td style={styles.td}>
                                <button onClick={() => handleEdit(s)} style={{...styles.actionBtn, backgroundColor: "#4caf50", color: "white"}}>Edit</button>
                                <button onClick={() => handleDelete(s._id)} style={{...styles.actionBtn, backgroundColor: "#f44336", color: "white"}}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
