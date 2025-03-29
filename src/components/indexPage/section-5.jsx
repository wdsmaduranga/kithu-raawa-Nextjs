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
const ChurchPoster = () => {
  const [churchPost, setchurchPost] = useState({ latest_news: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchchurchPost = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/view/church-news`);
        if (!response.ok) {
          throw new Error("Failed to fetch trending news");
        }
        const data = await response.json();
        setchurchPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchchurchPost();
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
    <div className="block-area">
                <div className="block-title-6">
                  <h4 className="h5 border-primary">
                    <span className="bg-primary text-white">Church News</span>
                  </h4>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <article className="card card-full hover-a mb-4">
                      <Link href="'/news/'+church_latest_news.id">
                        <div className="ratio_360-202 image-wrapper">
                          {/* <img className="img-fluid church-news" src={imagecatch(churchNews.church_latest_news)} /> */}
                        </div>
                        <div className="card-body">
                          <h2 className="card-title h1-sm h3-lg">
                            {/* {churchNews.church_latest_news?.post_title} */}
                          </h2>
                          <div className="card-text mb-2 text-muted small">
                            {/* <time dateTime={moment(churchNews.church_latest_news.created_at ).format('Do MMM YYYY')}>{ moment(churchNews.church_latest_news.created_at ).format("Do MMM YYYY")}</time> */}
                          </div>
                        </div>
                      </Link>
                    </article>
                  </div>
                  <div className="col-lg-6">
                    <div className="row">
                      {/* {churchNews.church_news.map((item , index)=>{
                      return(<>
                        <article key={index} className="col-12 card card-full hover-a mb-4" >
                      <Link href="'/news/'+item.id">
                        <div className="row">
                          <div className="col-3 col-md-4 pe-2 pe-md-0">
                            <div className="ratio_115-80 image-wrapper">
                              <img className="church-news-img" src={imagecatch(item)} alt="Image description" />
                            </div>
                          </div>
                          <div className="col-9 col-md-8">
                            <div className="card-body pt-0 church-news">
                              <h3 className="card-title h6 h5-sm h6-lg church-news-text" >
                                {item.post_title}
                              </h3>
                              <div className="card-text small text-muted">
                                <time dateTime={moment(item.created_at ).format('Do MMM YYYY')}>{moment(item.created_at ).format('Do MMM YYYY')}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                        </>)
                    })} */}
                    </div>
                  </div>
                </div>
              </div>
  );
};

export default ChurchPoster;
