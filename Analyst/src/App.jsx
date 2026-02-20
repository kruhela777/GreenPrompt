import React, { useRef, useEffect, useState } from "react";
import "./index.css";
import Landing from "./components/Landing.jsx";
import About from "./components/About.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
// ---- Place the ParticleEngine CLASS outside ----
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.lights = [];
    this.init();
  }

  init() {
    this.createParticles(300, 3, 0.4, 0.5, "#000000ff", false);
    this.createParticles(100, 8, 0.3, 1, "#000000ff", true);
    this.createParticles(10, 30, 0.2, 1, "#000000ff", true);
    this.createLight(400, 100, 0.6, 0, 0, "#000000ff");
    this.createLight(350, 250, 0.3, -50, 0, "#000000ff");
    this.createLight(100, 80, 0.2, 80, -50, "#000000ff");
  }

  createParticles(count, size, alpha, areaHeight, color, filled) {
    for (let i = 0; i < count; i++) {
      const particle = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: size,
        alpha: Math.random() * alpha,
        alphaMax: alpha,
        color: color,
        filled: filled,
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        distance: size * 2,
        origX: Math.random() * this.canvas.width,
        origY:
          this.canvas.height * (1 - areaHeight / 2) +
          Math.random() * this.canvas.height * areaHeight,
        scale: Math.random() * 0.7 + 0.3,
      };
      this.particles.push(particle);
    }
  }

  createLight(width, height, alpha, offsetX, offsetY, color) {
    const light = {
      width: width,
      height: height,
      alpha: alpha,
      offsetX: offsetX,
      offsetY: offsetY,
      color: color,
      x: this.canvas.width / 2 + offsetX,
      y: this.canvas.height / 2 + offsetY,
      phase: Math.random() * Math.PI * 2,
    };
    this.lights.push(light);
  }

  start() {
    if (this._animationHandle) return;
    const animate = () => {
      this.update();
      this.draw();
      this._animationHandle = requestAnimationFrame(animate);
    };
    animate();
  }

  stop() {
    if (this._animationHandle) {
      cancelAnimationFrame(this._animationHandle);
      this._animationHandle = null;
    }
  }

  update() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.angle += 0.01 / p.speed;
      p.x = p.origX + Math.cos(p.angle) * p.distance;
      p.y = p.origY + Math.sin(p.angle) * p.distance;
      p.alpha = 0.1 + Math.sin(Date.now() * 0.001 * p.speed) * p.alphaMax * 0.5;
    }
    const time = Date.now() * 0.001;
    for (let i = 0; i < this.lights.length; i++) {
      const l = this.lights[i];
      l.phase += 0.01;
      if (i === 0) {
        l.x = this.canvas.width / 2 + l.offsetX + Math.sin(time * 0.2) * 50;
        l.y = this.canvas.height / 2 + l.offsetY + Math.cos(time * 0.3) * 30;
      } else if (i === 1) {
        l.x = this.canvas.width / 2 + l.offsetX + Math.sin(time * 0.1) * 100;
        l.y = this.canvas.height / 2 + l.offsetY + Math.cos(time * 0.15) * 50;
      } else {
        l.x = this.canvas.width / 2 + l.offsetX + Math.sin(time * 0.3) * 80;
        l.y = this.canvas.height / 2 + l.offsetY + Math.cos(time * 0.4) * 40;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.lights.length; i++) {
      const l = this.lights[i];
      const gradient = this.ctx.createRadialGradient(
        l.x,
        l.y,
        0,
        l.x,
        l.y,
        l.width / 2,
      );
      gradient.addColorStop(0, l.color);
      gradient.addColorStop(1, "transparent");
      this.ctx.globalAlpha = l.alpha;
      this.ctx.globalCompositeOperation = "lighter";
      this.ctx.beginPath();
      this.ctx.ellipse(l.x, l.y, l.width / 2, l.height / 2, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }
    this.ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
      if (p.filled) {
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else {
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.globalAlpha = 1;
  }

  resize() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.origX = (p.origX / this.canvas.oldWidth) * this.canvas.width;
      p.origY = (p.origY / this.canvas.oldHeight) * this.canvas.height;
      p.x = (p.x / this.canvas.oldWidth) * this.canvas.width;
      p.y = (p.y / this.canvas.oldHeight) * this.canvas.height;
    }
    for (let i = 0; i < this.lights.length; i++) {
      const l = this.lights[i];
      l.x = this.canvas.width / 2 + l.offsetX;
      l.y = this.canvas.height / 2 + l.offsetY;
    }
    this.canvas.oldWidth = this.canvas.width;
    this.canvas.oldHeight = this.canvas.height;
  }
}

// ---- React FUNCTIONAL Component ----
function App() {
  const canvasRef = useRef(null);
  const particleEngine = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.oldWidth = canvas.width;
    canvas.oldHeight = canvas.height;

    particleEngine.current = new ParticleEngine(canvas);
    particleEngine.current.start();
    console.log("ParticleEngine loaded");
    setLoading(false);
    const loaderTimeout = setTimeout(() => setLoading(false), 5000);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particleEngine.current) particleEngine.current.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (particleEngine.current) particleEngine.current.stop();
      clearTimeout(loaderTimeout);
    };
  }, []);

  return (
    <div>
      {loading && <div className="loader">fuck this</div>}
      <canvas
        id="projector"
        ref={canvasRef}
        style={{
          display: loading ? "none" : "block",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      ></canvas>
      {!loading && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
