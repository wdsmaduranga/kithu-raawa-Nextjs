"use client";
import React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import moment from "moment";
const EventPoster = () => {
  const [eventPost, seteventPost] = useState({ latest_news: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetcheventPost = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/view/event`);
        if (!response.ok) {
          throw new Error("Failed to fetch trending news");
        }
        const data = await response.json();
        seteventPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetcheventPost();
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
      {eventPost.all_event?.map((item, index) => {
        return (
          <Link key={index} href="'/event/' + item.id">
            <div className="trand-right-single d-flex">
              <div className="trand-right-img">
                <img className="event-post-img" src={imagecatch(item)} />
              </div>
              <div className="trand-right-cap pl-2">
                <span className="color1 p-1 rounded">
                  <time>{moment(item.event_date).format("Do MMM YY")}</time>
                </span>
                <h4 className="event-text-3 text-white">{item.event_title}</h4>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default EventPoster;
