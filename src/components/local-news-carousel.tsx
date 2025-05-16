"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, A11y } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

// Mock data for local news
const localNews = [
  {
    id: 1,
    title: "Parish Hosts Annual Charity Fundraiser",
    excerpt: "St. Mary's Church raised over $50,000 for local homeless shelters.",
    category: "Community",
    image: "/placeholder.svg?height=120&width=120&text=Local+1",
  },
  {
    id: 2,
    title: "Diocese Launches Youth Ministry Program",
    excerpt: "New initiative aims to engage teenagers through service and fellowship.",
    category: "Youth",
    image: "/placeholder.svg?height=120&width=120&text=Local+2",
  },
  {
    id: 3,
    title: "Catholic School Celebrates 100th Anniversary",
    excerpt: "St. Joseph Academy marks centennial with special Mass and community events.",
    category: "Education",
    image: "/placeholder.svg?height=120&width=120&text=Local+3",
  },
  {
    id: 4,
    title: "Local Parish Renovates Historic Chapel",
    excerpt: "Restoration project preserves architectural heritage while updating facilities.",
    category: "Heritage",
    image: "/placeholder.svg?height=120&width=120&text=Local+4",
  },
  {
    id: 5,
    title: "Knights of Columbus Host Community Breakfast",
    excerpt: "Monthly event brings together parishioners and neighbors for fellowship.",
    category: "Events",
    image: "/placeholder.svg?height=120&width=120&text=Local+5",
  },
]

export default function LocalNewsCarousel() {
  const [slidesPerView, setSlidesPerView] = useState(3)

  // Responsive adjustment
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1)
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2)
      } else {
        setSlidesPerView(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Swiper
      modules={[Navigation, Pagination, A11y]}
      spaceBetween={24}
      slidesPerView={slidesPerView}
      navigation
      pagination={{ clickable: true }}
      className="local-news-swiper"
    >
      {localNews.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="flex border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-white h-full">
            <Image
              src={item.image || "/placeholder.svg"}
              width={120}
              height={120}
              alt={item.title}
              className="w-24 h-24 md:w-32 md:h-full object-cover transition-all duration-300 hover:scale-105"
            />
            <div className="p-4 flex-1">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold rounded mb-2">
                {item.category}
              </span>
              <h3 className="text-lg font-bold mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.excerpt}</p>
              <Link
                href={`/local/article-${item.id}`}
                className="text-blue-700 hover:text-blue-900 font-medium text-sm inline-flex items-center group"
              >
                Read More
                <ChevronRight className="ml-1 h-3 w-3 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
