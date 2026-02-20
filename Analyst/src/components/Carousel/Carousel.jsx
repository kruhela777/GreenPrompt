import React, { useEffect, useRef, useState } from "react";
import "./Carousel.css";

const Carousel = () => {
  const slideRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Define slides inside the component
  const slides = [
    {
      id: 1,
      name: "Energy Use",
      description: "Analyzing power consumption and efficiency metrics",
      image: "Images/light.jpg",
    },
    {
      id: 2,
      name: "Water",
      description: "Monitoring water usage and conservation strategies",
      image: "Images/water.jpg",
    },
    {
      id: 3,
      name: "Carbon Emissions",
      description: "Tracking environmental impact and carbon footprint",
      image: "Images/Carbon Emission.jpg",
    },
    {
      id: 4,
      name: "E-Waste",
      description: "Managing electronic waste and recycling initiatives",
      image: "Images/E-waste.jpg",
    },
  ];

  useEffect(() => {
    // Animate magic stars
    const rand = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const animate = (star) => {
      star.style.setProperty("--star-left", `${rand(-10, 100)}%`);
      star.style.setProperty("--star-top", `${rand(-40, 80)}%`);

      star.style.animation = "none";
      // eslint-disable-next-line no-unused-expressions
      star.offsetHeight;
      star.style.animation = "";
    };

    let index = 0;
    const interval = 1000;

    for (const star of document.getElementsByClassName("magic-star")) {
      setTimeout(
        () => {
          animate(star);
          setInterval(() => animate(star), 1000);
        },
        index++ * (interval / 3),
      );
    }
  }, []);

  useEffect(() => {
    // Preload images
    const imageUrls = slides.map((slide) => slide.image);
    let loadedCount = 0;

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imageUrls.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        // Handle error if image fails to load
        loadedCount++;
        if (loadedCount === imageUrls.length) {
          setImagesLoaded(true);
        }
      };
    });

    // Get the slide element
    const slide = slideRef.current;

    // Define next and previous functions
    const handleNext = () => {
      const items = document.querySelectorAll(".item");
      if (items.length > 0) {
        slide.appendChild(items[0]);
      }
    };

    const handlePrev = () => {
      const items = document.querySelectorAll(".item");
      if (items.length > 0) {
        slide.prepend(items[items.length - 1]);
      }
    };

    // Add event listeners to buttons
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener("click", handleNext);
      prevBtn.addEventListener("click", handlePrev);
    }

    // Cleanup event listeners
    return () => {
      if (nextBtn && prevBtn) {
        nextBtn.removeEventListener("click", handleNext);
        prevBtn.removeEventListener("click", handlePrev);
      }
    };
  }, [slides]); // Add slides as dependency

  return (
    <div className={`container ${imagesLoaded ? "loaded" : "loading"}`}>
      <div className="slide" ref={slideRef}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="item"
            style={{
              backgroundImage: `url('${slide.image}')`,
            }}
          >
            <div className="content">
              <div className="name">
                <span className="magic">
                  <span className="magic-star">
                    <svg viewBox="0 0 512 512">
                      <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
                    </svg>
                  </span>
                  <span className="magic-star">
                    <svg viewBox="0 0 512 512">
                      <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
                    </svg>
                  </span>
                  <span className="magic-star">
                    <svg viewBox="0 0 512 512">
                      <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
                    </svg>
                  </span>
                  <span className="magic-text">{slide.name}</span>
                </span>
              </div>
              <div className="des">{slide.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="button">
        <button className="prev">◁</button>
        <button className="next">▷</button>
      </div>
    </div>
  );
};

export default Carousel;
