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

// Mock data for international news
const internationalNews = [
  {
    id: 1,
    title: "Catholic Relief Services Expand Efforts in Africa",
    excerpt: "New initiatives aim to provide clean water and healthcare to underserved communities.",
    category: "Global",
    image: "/placeholder.svg?height=150&width=300&text=International+1",
  },
  {
    id: 2,
    title: "Bishops Conference Addresses Climate Change",
    excerpt: "Catholic leaders issue joint statement on environmental stewardship and sustainability.",
    category: "Environment",
    image: "/placeholder.svg?height=150&width=300&text=International+2",
  },
  {
    id: 3,
    title: "Vatican Diplomat Meets with World Leaders",
    excerpt: "Discussions focused on religious freedom and humanitarian concerns in conflict zones.",
    category: "Diplomacy",
    image: "/placeholder.svg?height=150&width=300&text=International+3",
  },
  {
    id: 4,
    title: "New Catholic University Opens in Asia",
    excerpt: "The institution will focus on theology, philosophy, and social sciences.",
    category: "Education",
    image: "/placeholder.svg?height=150&width=300&text=International+4",
  },
  {
    id: 5,
    title: "Historic Pilgrimage Route Restored",
    excerpt: "Ancient path to Santiago de Compostela receives infrastructure improvements.",
    category: "Heritage",
    image: "/placeholder.svg?height=150&width=300&text=International+5",
  },
  {
    id: 6,
    title: "Catholic Charities Respond to Refugee Crisis",
    excerpt: "Organizations mobilize resources to provide shelter and support to displaced families.",
    category: "Humanitarian",
    image: "/placeholder.svg?height=150&width=300&text=International+6",
  },
]

export default function InternationalNewsCarousel() {
  const [slidesPerView, setSlidesPerView] = useState(4)

  // Responsive adjustment
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1)
      } else if (window.innerWidth < 768) {
        setSlidesPerView(2)
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(3)
      } else {
        setSlidesPerView(4)
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
      className="international-news-swiper"
    >
      {internationalNews.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
            <div className="relative overflow-hidden">
              <Image
                src={item.image || "/placeholder.svg"}
                width={300}
                height={150}
                alt={item.title}
                className="w-full h-40 object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-3">
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-3">{item.excerpt}</p>
              <Link
                href={`/international/article-${item.id}`}
                className="text-red-700 hover:text-red-900 font-medium text-sm inline-flex items-center group"
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
