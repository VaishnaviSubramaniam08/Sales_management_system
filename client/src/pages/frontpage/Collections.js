import { Link } from "react-router-dom";
import "./Pages.css";
import product1 from "../../assets/product1.png";
import product2 from "../../assets/product2.png";
import product3 from "../../assets/product3.png";
import product4 from "../../assets/product4.png";

export default function Collections() {
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
        <div className="heading">
          <h1>Best Sellers</h1>
          <p>The best of the best — explore our all-time customer favorites.</p>
        </div>

        <div className="grid">
          <div className="card">
            <div className="tag">NEW</div>
            <img src={product1} alt="product" />
            <div className="cardText">
              <h3>Chase Suede Bomber Jacket</h3>
              <p>Same manufacturer as Alexander Wang · FRAME</p>
              <span className="price">$300</span>
            </div>
          </div>

          <div className="card">
            <div className="tag">NEW</div>
            <img src={product2} alt="product" />
            <div className="cardText">
              <h3>Chase Suede Bomber Jacket</h3>
              <p>Same manufacturer as Alexander Wang · FRAME</p>
              <span className="price">$300</span>
            </div>
          </div>

          <div className="card">
            <div className="tag">NEW</div>
            <img src={product3} alt="product" />
            <div className="cardText">
              <h3>Soleil Scented Glass Candle</h3>
              <p>Same manufacturer as Hermes · Vera Wang</p>
              <span className="price">$18 - $65</span>
            </div>
          </div>

          <div className="card">
            <div className="tag">NEW</div>
            <img src={product4} alt="product" />
            <div className="cardText">
              <h3>Soleil Scented Glass Candle</h3>
              <p>Same manufacturer as Hermes · Vera Wang</p>
              <span className="price">$18 - $65</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
