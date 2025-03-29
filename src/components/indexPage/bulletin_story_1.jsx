"use client";
import React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation ,EffectFade } from "swiper/modules";
import moment from "moment";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import 'swiper/css/effect-fade';
import 'swiper/css/effect-cards';

import Image from "next/image";
const BulletinStory = () => {
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
        console.log(data);
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
      <Swiper
        spaceBetween={30}
        loop={true}
        // pagination={{
        //   dynamicBullets: true,
        //   clickable: true,
        // }} 
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full h-full"
      >
        {trending.latest_news?.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="grid md:grid-cols-2 gap-8">
              <Image width={500} height={500}
                src={imagecatch(item.post)}
                alt={item.post.post_title}
                className="rounded-lg w-full h-80 object-cover"
              />
              <div className="flex flex-col justify-center">
                {/* <div className="flex items-center space-x-2 mb-4">
                  <img
                    src="/api/placeholder/24/24"
                    alt=""
                    className="rounded-full"
                  />
                  <span className="text-gray-600">Netflix</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{featuredStory.time}</span>
                </div> */}
                <h2 className="text-3xl font-bold mb-4">
                  {item.post.post_title}
                </h2>
                <p className="text-gray-600 mb-4">There's been no official announcement regardoff, given it's a Lionsgate film...</p>
                <div className="flex items-center space-x-4">
                  <span className="text-red-600">Movies</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">
                  {moment(item.post.created_at).fromNow()}
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BulletinStory;
