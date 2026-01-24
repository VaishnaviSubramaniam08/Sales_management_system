import { Link } from "react-router-dom";
import "./Home.css";
import heroImg from "../../assets/homemodel.png";

export default function Home() {
  return (
    <div className="home">
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

      <div className="hero">
        <div className="heroLeft">
          <h1>Elevate Style, <br /> Embrace Story</h1>
          <p>
            Smart Inventory & Clothes Management System for modern stores.
            Manage inventory, sales, billing, stock alerts and reports.
          </p>
          <Link to="/register">
            <button className="exploreBtn">Explore</button>
          </Link>
        </div>

        <div className="heroRight">
          <img src={heroImg} alt="Hero" />
        </div>
      </div>
    </div>
  );
}
