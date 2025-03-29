"use client";
import React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

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
    <div className="col-lg-4 populer-news-post-list h-full">
      <div className="block-title-6">
        <h4 className="h5 border-primary">
          <span className="bg-primary text-white">Popular News</span>
        </h4>
      </div>
      <Swiper
        className=""
        slidesPerView={4}
        direction={"vertical"}
        autoplay={{
          delay: 1000,
        }}
        modules={[Autoplay, Pagination, Navigation]}
      >
        {trending.latest_news?.map((item, index) => {
          return (
            <SwiperSlide key={index}>
              <div className="col-lg-12 ">
                <Link href={"/news/" + item.post.id}>
                  <div className="trand-right-single grid grid-cols-2">
                    <div className="trand-right-img">
                      <img
                        className="populer-post-img"
                        src={imagecatch(item.post)}
                      />
                    </div>
                    <div className="trand-right-cap">
                      <h4 className="news-post-title text-white">
                        {item.post.post_title}
                      </h4>
                      <div className="post-inline justify-content-around">
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
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default TrendingNewsSlider;
