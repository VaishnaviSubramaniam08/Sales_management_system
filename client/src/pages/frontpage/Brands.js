import { Link } from "react-router-dom";
import "./Pages.css";

export default function Brands() {
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
        <h1>Brands We Offer</h1>
        <p>Explore premium brands available in our store.</p>

        <div className="cardRow">
          <div className="card">
            <h2>Brand A</h2>
            <p>Quality & Comfort</p>
          </div>
          <div className="card">
            <h2>Brand B</h2>
            <p>Style & Trend</p>
          </div>
          <div className="card">
            <h2>Brand C</h2>
            <p>Classic & Elegant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
