"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Heart, MessageCircle, Eye, Share2 } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, A11y, EffectFade } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"

// Mock data for the news items
const mainNewsItems = [
  {
    id: 1,
    category: "BREAKING NEWS",
    title: "Pope Francis Calls for Global Peace Initiative",
    author: "Vatican Correspondent",
    location: "Vatican City",
    time: "2 hours ago",
    image: "/placeholder.svg?height=500&width=1200",
    content:
      "In his Sunday address, the Pope urged world leaders to prioritize dialogue over conflict, calling for a renewed commitment to peace in troubled regions around the globe.",
    quote:
      '"The path to lasting peace requires courage, patience, and a willingness to listen," said the Holy Father, addressing thousands gathered in St. Peter\'s Square.',
    additionalContent:
      "The initiative comes amid escalating tensions in several regions, with the Vatican taking a more active diplomatic role in recent months.",
    likes: "1.2K",
    comments: "348",
    views: "5.7K",
  },
  {
    id: 2,
    category: "VATICAN NEWS",
    title: "Cardinal Secretary Announces New Encyclical on Digital Ethics",
    author: "Rome Correspondent",
    location: "Vatican City",
    time: "5 hours ago",
    image: "/placeholder.svg?height=500&width=1200&text=Encyclical",
    content:
      "The Vatican has announced a forthcoming encyclical addressing the ethical challenges of the digital age, including artificial intelligence and social media.",
    quote:
      '"We must ensure that technological progress serves human dignity rather than diminishing it," stated Cardinal Pietro Parolin at the press conference.',
    additionalContent:
      "The document, expected to be released next month, will be the first papal encyclical focused specifically on digital ethics.",
    likes: "956",
    comments: "287",
    views: "4.3K",
  },
  {
    id: 3,
    category: "WORLD NEWS",
    title: "Catholic Relief Organizations Respond to Natural Disaster",
    author: "International Desk",
    location: "Manila",
    time: "1 day ago",
    image: "/placeholder.svg?height=500&width=1200&text=Relief+Efforts",
    content:
      "Catholic relief organizations have mobilized to provide emergency assistance following devastating floods that have displaced thousands of families.",
    quote:
      '"Our priority is ensuring access to clean water, food, and shelter for those affected," said the director of Caritas International\'s emergency response team.',
    additionalContent:
      "The Church has also called for international support to address the long-term recovery needs of the affected communities.",
    likes: "1.5K",
    comments: "412",
    views: "6.2K",
  },
]

const sideNewsItems = [
  {
    id: 1,
    title: "Cardinal Highlights Importance of Family Values",
    location: "Rome",
    excerpt:
      "During the annual conference on family life, Cardinal Rodriguez emphasized the central role of family in society.",
    likes: "482",
    comments: "64",
    time: "4 hours ago",
    image: "/placeholder.svg?height=100&width=100&text=Family",
  },
  {
    id: 2,
    title: "New Catholic School Opens in Underserved Community",
    location: "Chicago",
    excerpt:
      "The Archdiocese celebrated the opening of St. Thomas Academy, providing quality education to an underserved neighborhood.",
    likes: "327",
    comments: "41",
    time: "6 hours ago",
    image: "/placeholder.svg?height=100&width=100&text=School",
  },
  {
    id: 3,
    title: "Historic Church Restoration Project Completed",
    location: "Paris",
    excerpt:
      "After five years of careful work, the 16th century St. Marie Cathedral reopens its doors to worshippers and visitors.",
    likes: "893",
    comments: "127",
    time: "1 day ago",
    image: "/placeholder.svg?height=100&width=100&text=Church",
  },
  {
    id: 4,
    title: "Pope Meets with Interfaith Leaders on Climate Action",
    location: "Vatican",
    excerpt:
      "Religious leaders from various traditions gathered to discuss joint initiatives addressing environmental challenges.",
    likes: "1.1K",
    comments: "208",
    time: "2 days ago",
    image: "/placeholder.svg?height=100&width=100&text=Climate",
  },
]

export default function NewsSwiper() {
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="border-2 border-gray-800 bg-gray-100 p-3 md:p-4 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main News Section with Swiper */}
        <div className="md:col-span-8 md:border-r md:pr-4 border-gray-400 relative">
          <Swiper
            modules={[Navigation, Pagination, A11y, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            className="newspaper-swiper"
            // style={{ height:  "600px" }}
          >
            {mainNewsItems.map((news, idx) => (
              <SwiperSlide key={idx}>
                <div className="w-full">
                  <span className="inline-block bg-red-700 text-white px-3 py-1 text-xs md:text-sm font-serif mb-2">
                    {news.category}
                  </span>
                  <h2 className="font-serif text-2xl md:text-4xl font-bold text-gray-900  leading-tight">
                    {news.title}
                  </h2>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">By {news.author}</span>
                      <span>|</span>
                      <span className="ml-2">{news.location}</span>
                    </div>
                    <span className="text-xs text-gray-500">{news.time}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Image
                        src={news.image || "/placeholder.svg"}
                        width={600}
                        height={400}
                        alt={news.title}
                        className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      />
                      <p className="text-xs italic mt-1 text-gray-600">
                        {news.location} - Related to {news.category.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-gray-800 space-y-2 text-sm md:text-base font-serif leading-snug mt-2 md:mt-0">
                      <p className="first-letter:text-3xl md:first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                        {news.content}
                      </p>
                      <p>{news.quote}</p>
                      <p className="hidden md:block">{news.additionalContent}</p>
                      <Link
                        href={`/news/article/${news.id}`}
                        className="inline-flex items-center text-red-700 hover:text-red-900 font-medium mt-2"
                      >
                        Continue reading <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Social Engagement Metrics */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-300">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-red-700 transition-colors duration-200">
                        <Heart className="h-4 w-4" />
                        <span className="text-xs">{news.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-red-700 transition-colors duration-200">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{news.comments}</span>
                      </button>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">{news.views} views</span>
                      </div>
                    </div>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-red-700 transition-colors duration-200">
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">Share</span>
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Side News with Images and Swiper */}
        <div className="md:col-span-4 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-gray-400">
          <h3 className="font-serif text-xl font-bold border-b-2 border-gray-800 pb-1 mb-3">LATEST NEWS</h3>
          <Swiper
            direction="vertical"
            slidesPerView={isMobile ? 1 : 4}
            spaceBetween={16}
            // navigation
            // modules={[Navigation]}
            className="side-news-swiper"
            style={{ height: isMobile ? "250px" : "600px" }}
          >
            {sideNewsItems.map((item, idx) => (
              <SwiperSlide key={idx}>
                <div className="border-b border-gray-300 pb-2 ">
                  <div className="flex gap-3">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      width={80}
                      height={80}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-md grayscale hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-base md:text-lg mb-1 line-clamp-2">{item.title}</h4>
                      <div className="flex text-xs text-gray-600 mb-2">
                        <span className="font-semibold">{item.location}</span>
                        <span className="mx-1">—</span>
                        <span className="line-clamp-1">{item.excerpt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Heart className="h-3 w-3" />
                        <span className="text-xs">{item.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MessageCircle className="h-3 w-3" />
                        <span className="text-xs">{item.comments}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                  <Link
                    href={`/news/article-${item.id}`}
                    className="text-red-700 hover:text-red-900 text-sm font-medium inline-flex items-center group mt-2"
                  >
                    Read Article
                    <ChevronRight className="ml-1 h-3 w-3 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
