import "./Pages.css";
import Navbar from "./Navbar";
import heroImg from "../../assets/Ordinaree-39.webp";

export default function Brands() {
  return (
    <div className="page">
      <Navbar />

      <div className="content brand-hero">
        <div className="brand-left">
          <div className="brand-photo">
            <img src={heroImg} alt="Fashion styling" />
          </div>
        </div>

        <div className="brand-right">
          <h1 className="brand-title">
            <span className="accent">Find your</span> fashion’s fit
          </h1>
          <p className="brand-sub">
            Discover styles that match your brand. Explore fabrics, cuts, and curated looks crafted by our team.
          </p>

          <div className="brand-divider">
            <span />
          </div>

          <div className="brand-form">
            <input className="brand-input" placeholder="Enter your brand name" />
            <div className="brand-actions">
              <button className="brand-btn primary">Explore</button>
              <button className="brand-btn ghost">Later</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
