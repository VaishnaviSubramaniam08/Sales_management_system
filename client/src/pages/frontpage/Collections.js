import "./Pages.css";
import Navbar from "./Navbar";
import product1 from "../../assets/product1.png";
import product2 from "../../assets/product2.png";
import product3 from "../../assets/product3.png";
import product4 from "../../assets/product4.png";

export default function Collections() {
  return (
    <div className="page">
      <Navbar />

      <div className="content">
        <div className="heading heading-center">
          <h1>Discover Collections</h1>
        </div>

        <div className="collections-grid">
          <div className="collection-card">
            <div className="collection-media">
              <img src={product1} alt="Accessories" />
            </div>
            <div className="collection-meta">
              <div className="collection-title">Accessories</div>
              <div className="collection-count">50 Products</div>
            </div>
          </div>

          <div className="collection-card">
            <div className="collection-media">
              <img src={product2} alt="Best Sellers" />
            </div>
            <div className="collection-meta">
              <div className="collection-title">Best Sellers</div>
              <div className="collection-count">32 Products</div>
            </div>
          </div>

          <div className="collection-card">
            <div className="collection-media">
              <img src={product3} alt="Hats and Gloves" />
            </div>
            <div className="collection-meta">
              <div className="collection-title">Hats and Gloves</div>
              <div className="collection-count">4 Products</div>
            </div>
          </div>

          <div className="collection-card">
            <div className="collection-media">
              <img src={product4} alt="Men" />
            </div>
            <div className="collection-meta">
              <div className="collection-title">Men</div>
              <div className="collection-count">96 Products</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
