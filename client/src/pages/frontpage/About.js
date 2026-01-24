import { Link } from "react-router-dom";
import "./Pages.css";

export default function About() {
  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">SELVALAKSHMI GARMENTS</div>

        <div className="menu">
          <Link to="/" className="menuItem">Home</Link>
          <Link to="/collections" className="menuItem">Collections</Link>
          <Link to="/brands" className="menuItem">Brands</Link>
          <Link to="/about" className="menuItem">About</Link>
        </div>

        <Link to="/login">
          <button className="loginBtn">Login</button>
        </Link>
      </div>

      <div className="content">
        <h1>About Us</h1>
        <p>
          We are a leading garment store focused on providing premium quality clothing.
          Our mission is to deliver style, comfort, and value to every customer.
        </p>
      </div>
    </div>
  );
}
