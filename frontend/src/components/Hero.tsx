import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const performanceData = [
  { month: "Jan", traditional: 45, mediquery: 18 },
  { month: "Feb", traditional: 48, mediquery: 19 },
  { month: "Mar", traditional: 52, mediquery: 21 },
  { month: "Apr", traditional: 47, mediquery: 19 },
  { month: "May", traditional: 50, mediquery: 20 },
  { month: "Jun", traditional: 55, mediquery: 22 },
];

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleTryDemo = () => {
    navigate('/search');
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#F9FAFB] via-white to-[#EFF6FF] dark:from-[#0A0A0B] dark:via-[#111827] dark:to-[#0F1629] py-24 md:py-32 px-6">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#0066CC] opacity-5 dark:opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-[#3B82F6] opacity-5 dark:opacity-10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-[1600px] mx-auto relative z-10">
          {/* Top Badge */}
          <div
            className={`flex justify-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-[#1F2937]/80 backdrop-blur-sm border border-[#E5E7EB] dark:border-[#374151] rounded-full shadow-lg">
              <Sparkles
                size={20}
                className="text-[#0066CC] dark:text-[#3B82F6]"
              />
              <span
                className="text-base font-semibold text-[#374151] dark:text-[#D1D5DB]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                AI-Powered Healthcare Search Engine
              </span>
            </div>
          </div>

          {/* Main Headline - Reduced font size */}
          <div className="text-center mb-16">
            <h1
              className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-[#111827] dark:text-white">
                Find Clinical Insights in
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#0066CC] to-[#3B82F6] bg-clip-text text-transparent">
                Seconds, Not Hours
              </span>
            </h1>

            <p
              className={`text-xl md:text-2xl text-[#6B7280] dark:text-[#9CA3AF] max-w-4xl mx-auto mb-14 leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Intelligent conversational search across{" "}
              <span className="font-semibold text-[#0066CC] dark:text-[#3B82F6]">
                173,270+ medical documents
              </span>{" "}
              using hybrid AI search. Healthcare professionals waste 40% of their time searching fragmented systems - we make it instant.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row justify-center items-center gap-6 mb-20 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <button
                onClick={handleTryDemo}
                className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#0066CC] to-[#0052A3] hover:from-[#0052A3] hover:to-[#0066CC] text-white font-semibold text-lg rounded-xl shadow-2xl shadow-[#0066CC]/30 transition-all duration-200 hover:shadow-[#0066CC]/40 hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Search size={24} />
                <span>Try Live Demo</span>
                <Sparkles
                  size={20}
                  className="group-hover:rotate-12 transition-transform"
                />
              </button>

              <button
                onClick={handleLearnMore}
                className="px-10 py-5 bg-white dark:bg-[#1F2937] border-2 border-[#E5E7EB] dark:border-[#374151] text-[#374151] dark:text-white font-semibold text-lg rounded-xl hover:border-[#0066CC] dark:hover:border-[#3B82F6] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-5xl mx-auto mb-20 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <div className="text-center p-6 bg-white/50 dark:bg-[#1F2937]/50 backdrop-blur-sm rounded-2xl border border-[#E5E7EB]/50 dark:border-[#374151]/50">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <TrendingUp
                    className="text-[#0066CC] dark:text-[#3B82F6]"
                    size={32}
                  />
                  <div
                    className="text-5xl font-bold text-[#111827] dark:text-white"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    60%
                  </div>
                </div>
                <div
                  className="text-base font-medium text-[#6B7280] dark:text-[#9CA3AF]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Faster Retrieval
                </div>
              </div>

              <div className="text-center p-6 bg-white/50 dark:bg-[#1F2937]/50 backdrop-blur-sm rounded-2xl border border-[#E5E7EB]/50 dark:border-[#374151]/50">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles
                    className="text-[#0066CC] dark:text-[#3B82F6]"
                    size={32}
                  />
                  <div
                    className="text-5xl font-bold text-[#111827] dark:text-white"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    173K+
                  </div>
                </div>
                <div
                  className="text-base font-medium text-[#6B7280] dark:text-[#9CA3AF]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Medical Documents
                </div>
              </div>

              <div className="text-center p-6 bg-white/50 dark:bg-[#1F2937]/50 backdrop-blur-sm rounded-2xl border border-[#E5E7EB]/50 dark:border-[#374151]/50">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock
                    className="text-[#0066CC] dark:text-[#3B82F6]"
                    size={32}
                  />
                  <div
                    className="text-5xl font-bold text-[#111827] dark:text-white"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    &lt;2s
                  </div>
                </div>
                <div
                  className="text-base font-medium text-[#6B7280] dark:text-[#9CA3AF]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Average Response
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div
            className={`max-w-6xl mx-auto transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="relative rounded-3xl border-2 border-[#E5E7EB] dark:border-[#374151] overflow-hidden bg-white dark:bg-[#1F2937] p-10 shadow-2xl">
              {/* Glow Effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0066CC] opacity-10 dark:opacity-20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="mb-6">
                  <h3
                    className="text-2xl font-bold text-[#111827] dark:text-white mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Search Performance Comparison
                  </h3>
                  <p
                    className="text-sm text-[#6B7280] dark:text-[#9CA3AF]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Average time to retrieve patient records (seconds)
                  </p>
                </div>

                <div style={{ width: "100%", height: "320px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorTraditional"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#EF4444"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#EF4444"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorMediquery"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0066CC"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0066CC"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E5E7EB"
                        className="dark:stroke-[#374151]"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        label={{
                          value: "Seconds",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#6B7280",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name) => [
                          `${value}s`,
                          name === "traditional"
                            ? "Traditional Search"
                            : "MediQuery AI",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="traditional"
                        stroke="#EF4444"
                        strokeWidth={2}
                        fill="url(#colorTraditional)"
                      />
                      <Area
                        type="monotone"
                        dataKey="mediquery"
                        stroke="#0066CC"
                        strokeWidth={3}
                        fill="url(#colorMediquery)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-8 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                    <span
                      className="text-sm text-[#6B7280] dark:text-[#9CA3AF]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Traditional Search
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#0066CC]"></div>
                    <span
                      className="text-sm text-[#6B7280] dark:text-[#9CA3AF]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      MediQuery AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;