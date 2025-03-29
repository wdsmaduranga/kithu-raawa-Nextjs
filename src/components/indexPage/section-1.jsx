"use client";
import React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation ,EffectFade  } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
const TrendingNewsSlider = () => {
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
    <div className="w-full">
      <Swiper
        loop={true}
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        autoplay={{
          delay: 1500,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full h-full"
      >
        {trending.latest_news?.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-64 md:h-96">
              <Link href={`/news/${item.post.id}`}>
                <div className="relative w-full h-full">
                  <img
                    src={imagecatch(item.post)}
                    alt={item.post.post_title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-opacity-40 rounded-lg">
                    <div className="absolute bottom-0 p-4 w-full">
                      <h2 className="text-white text-lg md:text-xl font-semibold line-clamp-2">
                        {item.post.post_title}
                      </h2>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="trending-bottom">
        <div className="row">
          <div className="block-title-6">
            <h4 className="h5 border-primary">
              <span className="bg-primary text-white">News</span>
            </h4>
          </div>
          <Swiper
            slidesPerView={3}
            loop={true}
          
            autoplay={{
              delay: 1500,
              disableOnInteraction: false,
            }}
            spaceBetween={30}
            modules={[Autoplay]}
            className="w-full h-full "
          >
            {trending.latest_news?.map((item, index) => (
              <SwiperSlide key={index} className="hooper-hor-slide">
                <div className="relative w-full h-50 md:h-50">
                  <Link href={`/news/${item.post.id}`}>
                    <div className="single-bottom mb-3">
                      <div className="trend-bottom-img mb-2">
                        <img src={imagecatch(item.post)} />
                      </div>
                      <div className="trend-bottom-cap">
                        <span className="p-1 span-card">
                          <span className="i-text-inline">
                            <i className="fas fa-eye p-2"></i>
                            {item.view_count}
                          </span>
                          <span className="i-text-inline">
                            <i className="far fa-thumbs-up p-2"></i>
                            {item.like_count}
                          </span>
                          <span className="i-text-inline">
                            <i className="far fa-comment-alt p-2"></i>
                            {item.comment_count}
                          </span>
                        </span>
                        <h4 className="news-post-title text-white">
                          {item.post.post_title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default TrendingNewsSlider;
