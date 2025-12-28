import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TradingButton from "@/components/ui/trading-button";
import { ArrowUpRight } from "lucide-react";
import BullTrade_logo from "@/assets/BullTrade_logo.png";
import BullTradeIcon from "@/assets/bull-finance-icon_nobg.png";
import heroBgImage from "@/assets/hero-bg2.png";
import demo1Image from "@/assets/Demo_Image.png";
import whiteLogoImage from "@/assets/bull-finance-icon.png";
import { useEffect, useRef, useState } from 'react';

const LandingPage = () => {
  const [demoVisible, setDemoVisible] = useState(false);
  const [heroPhases, setHeroPhases] = useState({
    heading: false,
    tagline: false,
    cta: false
  });
  const [navVisible, setNavVisible] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDemoVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (demoRef.current) {
      observer.observe(demoRef.current);
    }

    return () => {
      if (demoRef.current) {
        observer.unobserve(demoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setHeroPhases((prev) => ({ ...prev, heading: true })), 150),
      setTimeout(() => setHeroPhases((prev) => ({ ...prev, tagline: true })), 300),
      setTimeout(() => setHeroPhases((prev) => ({ ...prev, cta: true })), 450)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setNavVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section - Full page with blur transition from navbar */}
      <section
        className="relative min-h-[100svh] flex items-center justify-center px-6 pt-20"
        style={{
          backgroundImage: `url(${heroBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Navigation overlay on hero background */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/25 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-700 ease-out ${
            navVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
          }`}
        >
          <nav className="px-6 lg:px-12 py-2">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                {/* BullTrade logo on left */}
                <div className="flex items-end gap-1 md:-translate-x-12 transform">
                  <img src={BullTradeIcon} alt="BullTrade_icon" className="h-10" />
                  <img src={BullTrade_logo} alt="BullTrade_logo" className="h-9" />
                </div>

                {/* Navigation links in center - individual borders */}
                <div className="landing-heading hidden md:flex items-center gap-1.5 border border-white/25 rounded-full px-3 py-1 md:-translate-x-12 transform">
                  <Link
                    to="/"
                    className="text-white text-m hover:bg-gray-800 hover:text-white px-3 py-1 rounded-full transition-colors "
                  >
                    Home
                  </Link>
                  <Link
                    to="/docs"
                    className="text-white text-m hover:bg-gray-800 hover:text-white px-3 py-1 rounded-full transition-colors "
                  >
                    Documentation
                  </Link>
                  <Link
                    to="/trade"
                    className="text-white text-m hover:bg-gray-800 hover:text-white px-3 py-1 rounded-full transition-colors "
                  >
                    Trade
                  </Link>
                </div>

                {/* Sign up button on right - black with arrow */}
                <Button
                  asChild
                  className="px-4 py-1.5 bg-white text-black hover:bg-gray-800 hover:text-white text-sm font-medium rounded-full flex items-center gap-2 border border-black"
                >
                  <Link to="/signin">
                    Sign up
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </nav>
        </div>
        {/* Content container */}
        <div className="max-w-4xl mx-auto text-center z-20" style={{ fontFamily: 'Inter, sans-serif' }}>
          

          {/* Main heading - black text with Halo Grotesk */}
          <h1
            className={`landing-heading text-4xl md:text-5xl lg:text-8xl xl:text-8xl font-semibold text-black mb-8 md:mb-10 tracking-tight leading-tight text-center transition-all duration-700 ease-out ${
              heroPhases.heading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            One Platform
            <br />
            
            <span className="italic">Infinite Trades</span>
            
          </h1>
          <p
            className={`text-lg md:text-xl text-gray-700 mb-10 transition-all duration-700 ease-out ${
              heroPhases.tagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Trade cryptocurrencies in real time with full visibility and control.
            <br className="hidden md:block" />
            Live prices, order management and P&amp;L updates ensure accuracy and reliability.
          </p>

          {/* Start Trading button */}
          <div
            className={`flex justify-center mt-8 transition-all duration-700 ease-out ${
              heroPhases.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Link to="/trade">
              <TradingButton />
            </Link>
          </div>
        </div>
      </section>

      {/* Trading Platform Demo Section - Below Hero */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-white to-gray-50">

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="landing-heading text-4xl md:text-5xl font-bold text-black mb-4">
              A High-Performance Trading Platform
            </h2>
            <p className="text-lg text-gray-600">
              Trade global markets with precision, speed, and confidence.
            </p>
          </div>

          {/* Trading Platform Demo Image with animation and no outline */}
          <div
            ref={demoRef}
            className={`flex justify-center transition-all duration-1000 ease-out transform ${
              demoVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-12 scale-95'
            }`}
          >
            <img
              src={demo1Image}
              alt="Trading Platform Demo"
              className="w-full max-w-5xl rounded-lg shadow-2xl"
              style={{ border: 'none', outline: 'none' }}
            />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="col-span-1 md:col-span-2">
              <img src={whiteLogoImage} alt="BullTrade" className="h-12 mb-4 rounded" />
              <p className="text-gray-400 mb-6 max-w-md">
                Your trusted platform for global trading. Execute trades with precision and confidence on markets worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="https://x.com/shashankpoola" className="text-gray-400 hover:text-white transition-colors">
                  X
                </a>
                <a href="https://github.com/Ganji-Sandeep-10/BullTrade" className="text-gray-400 hover:text-white transition-colors">
                  Github
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="landing-heading font-semibold text-lg mb-4">Products</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/trade" className="text-gray-400 hover:text-white transition-colors">
                    Trading Platform
                  </Link>
                </li>
                <li>
                  <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    API Access
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Mobile App
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="landing-heading font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 BullTrade Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;