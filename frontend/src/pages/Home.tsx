import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Features from '../components/Features';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] transition-colors duration-200">
      <Header />
      <Hero />
      <Problem />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;