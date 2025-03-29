"use client";
import React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
const BulletinStory = () => {
  const latestNews = [
    {
      title: "'He deserves a lot more' Verstappen backs Alonso",
      source: "Formula 1",
      time: "3 hours ago",
      image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg",
      category: "Sport",
      readTime: "8 min read"
    },
    {
      title: "Liverpool hammer Leeds for first win in five games",
      source: "BBC",
      time: "12 hours ago",
      image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg",
      category: "Sport",
      readTime: "9 min read"
    },
    {
      title: "Papua: At least one killed in hunt for kidnapped NZ pilot",
      source: "IDN Times",
      time: "April 17, 2023",
      image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg",
      category: "Crime",
      readTime: "8 min read"
    },
    {
      title: "Jeremy Bowen: Israel's unclear road ahead",
      source: "BBC",
      time: "April 15, 2023",
      image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg",
      category: "Middle East",
      readTime: "8 min read"
    }
  ];
  const [trending, setTrending] = useState({ latest_news: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/view/trending`);
        if (!response.ok) {
          throw new Error("Failed to fetch trending news");
        }
        const data = await response.json();
        setTrending(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingNews();
  }, []);

  const imagecatch = (post) => {
    return (
      post.featured_image || "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg"
    );
  };
  5;
  if (isLoading) {
    return <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mb-12">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-2xl font-bold">Latest News</h3>
      <a href="#" className="text-red-600">See all →</a>
    </div>
    <div className="grid md:grid-cols-4 gap-6">
      {latestNews.map((news, index) => (
        <div key={index} className="group cursor-pointer">
          <img 
            src={news.image}
            alt={news.title}
            className="rounded-lg w-full h-48 object-cover mb-4"
          />
          <div className="flex items-center space-x-2 mb-2">
            <img src="/api/placeholder/20/20" alt="" className="rounded-full" />
            <span className="text-gray-600 text-sm">{news.source}</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">{news.time}</span>
          </div>
          <h4 className="font-semibold mb-2 group-hover:text-red-600 transition-colors">
            {news.title}
          </h4>
          <div className="flex items-center space-x-4">
            <span className="text-red-600 text-sm">{news.category}</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">{news.readTime}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default BulletinStory;