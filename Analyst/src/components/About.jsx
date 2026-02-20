import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Carousel from "./Carousel/Carousel";
function About() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Dashboard"); // Default to first section

  // Handles navigation for all sidebar icons
  const handleNav = (section) => (e) => {
    e.preventDefault();
    if (section === "home") {
      navigate("/landing");
    } else {
      setActiveSection(section);
    }
  };

  return (
    <div>
      <>
        <nav>
          <a href="#home" onClick={handleNav("home")}>
            <i className="fa-solid fa-house"></i>
          </a>
          <a href="#Dashboard" onClick={handleNav("Dashboard")}>
            <i className="fa-solid fa-circle-user"></i>
          </a>
          <a href="#Settings" onClick={handleNav("Settings")}>
            <i className="fa-solid fa-gears"></i>
          </a>
          <a href="#History" onClick={handleNav("History")}>
            <i className="fa-solid fa-clock-rotate-left"></i>
          </a>
        </nav>

        <div className="container">
          {activeSection === "Dashboard" && (
            <section id="Dashboard">
              <h1>alignmenttacticsssss</h1>
              {<Carousel />}
            </section>
          )}
          {activeSection === "Settings" && (
            <section id="Settings">
              <h1>Second Section (Settings/Config)</h1>
              {/* Custom settings or configuration content */}
            </section>
          )}
          {activeSection === "History" && (
            <section id="History">
              <h1>Third Section (History/Logs)</h1>
              {/* Custom history/logs content */}
            </section>
          )}
        </div>
      </>
    </div>
  );
}

export default About;
