import { Link } from "react-router-dom";
import "./Home.css";
import Navbar from "./Navbar";
import heroImg from "../../assets/shirt.webp";
import product1 from "../../assets/cloth.jpg";
import product2 from "../../assets/product2.png";
import product3 from "../../assets/product3.png";
import product4 from "../../assets/product4.png";

export default function Home() {
  return (
    <div className="home">
      <Navbar />

      {/* Hero Section */}
      <section className="heroCenter">
        <div className="badge">Join 10,000+ happy shoppers</div>
        <h1 className="heroTitle">Elevate Your Wardrobe With Stunning Styles</h1>
        <p className="heroSubtitle">
          Discover quality garments and curated collections crafted to make every day look effortless.
        </p>
        <Link to="/collections">
          <button className="ctaBtn">Get Started</button>
        </Link>

        <div className="mediaStrip">
          <div className="mediaCard rotateL"><img src={product1} alt="Collection" /></div>
          <div className="mediaCard"><img src={heroImg} alt="Collection" /></div>
          <div className="mediaCard rotateR"><img src={product2} alt="Collection" /></div>
          <div className="mediaCard rotateL"><img src={product3} alt="Collection" /></div>
          <div className="mediaCard rotateR"><img src={product4} alt="Collection" /></div>
        </div>
      </section>
    </div>
  );
}
