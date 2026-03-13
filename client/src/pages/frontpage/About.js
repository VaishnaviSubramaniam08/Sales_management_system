import "./Pages.css";
import Navbar from "./Navbar";
import heroImg from "../../assets/about.jpg";
import teamMain from "../../assets/cloth.jpg";


export default function About() {
  return (
    <div className="page">
      <Navbar />

      {/* Hero section with background image and overlay text */}
      <section className="about-hero">
        <img src={heroImg} alt="Team celebrating outdoors" />
        <div className="about-heroOverlay">
          <h1>About Us</h1>
          <p>For explorers everywhere.</p>
        </div>
      </section>

      {/* Team section with media on left and contact form on right */}
      <div className="content">
        <section className="team-section">
          <div className="team-media">
            <img className="team-main" src={teamMain} alt="Team in the field" />

          </div>

          <div className="team-copy">
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <h1>Contact Us</h1>
              <div className="form-row">
              
                <input className="input" type="text" placeholder="Your Name" required />
                <br/>
                <input className="input" type="email" placeholder="Your Email" required />
              </div>
              <textarea className="textarea" rows="6" placeholder="Your Message"></textarea>
              <button className="brand-btn primary" type="submit">Send Message</button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
