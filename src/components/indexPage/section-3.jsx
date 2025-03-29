'use client'
import React from 'react';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import moment from 'moment';

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
const EventPosterSegment = () => {
  const [eventPost, setEventPost] = useState({ latest_news: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const EventPoster = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/view/event`)
        if (!response.ok) {
          throw new Error('Failed to fetch trending news')
        }
        const data = await response.json()
        setEventPost(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    EventPoster()
  }, [])

  const imagecatch = (post) => {
    return post.featured_image || '/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg'
  }
5
  if (isLoading) {
    return <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="w-full">
      {eventPost.latest_event?.map((item) => {
                          return (
                            <div key={item.id} className="col-lg-6 col-md-6 p-3 ">
                            <Link href={"/event/" + item.id}>
                            <div className="what-img-boder">
                                  <div className="what-img">
                                    <img className="latest-event-img"
                                      src={imagecatch(item)}
                                    />
                                  </div>
                                  <div
                                    className="d-flex align-items-end flex-column bd-highlight mb-3"
                                  >
                                    <div className="event-date-3">
                                      {moment(item.event_date).format("Do MMM")}
                                    </div>
                                  </div>
                                  <h4 className="event-text-3 text-white">
                                    {item.event_title}
                                  </h4>
                                </div>
                              </Link>
                            </div>
                          )
                        })}
    </div>
  )
}

export default EventPosterSegment