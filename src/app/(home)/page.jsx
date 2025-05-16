import Link from "next/link"
import { ChevronRight, Globe } from "lucide-react"
import dynamic from "next/dynamic"

// Import static components normally
import NewsSwiper from "@/components/news-swiper"
import InternationalNewsCarousel from "@/components/international-news-carousel"
import LocalNewsCarousel from "@/components/local-news-carousel"
import UpcomingEvents from "@/components/upcoming-events"

// Dynamically import 3D components with no SSR
// const ThreeDCross = dynamic(() => import("@/components/three-d-cross"), { ssr: false })

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        {/* Featured News Section - Newspaper Style with Swiper */}
        <section className="mb-12">
          <NewsSwiper />
        </section>

        {/* Local News Section with Carousel - Now appears first */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold border-l-4 border-blue-700 pl-3">Local News</h2>
            <Link
              href="/local"
              className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center group"
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          <LocalNewsCarousel />
        </section>

        {/* International News Section with Carousel - Now appears second */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold border-l-4 border-red-700 pl-3">International News</h2>
            <Link
              href="/international"
              className="text-red-700 hover:text-red-900 font-medium inline-flex items-center group"
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          <InternationalNewsCarousel />
        </section>

        {/* Upcoming Events Section - New section */}
        <section className="mb-12">
          <UpcomingEvents />
        </section>

        {/* 3D Section - Keep this section */}
        <section className="mb-12 rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-all duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
              <h2 className="text-3xl font-bold mb-4 text-shadow">Faith in the Modern World</h2>
              <p className="mb-6">
                Explore how Catholic teachings provide guidance and wisdom in today's complex global landscape.
              </p>
              <Link
                href="/faith-modern-world"
                className="inline-flex items-center bg-white text-blue-900 hover:bg-blue-100 px-6 py-3 rounded-full transition-all duration-300 w-fit shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explore Series <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </div>
            <div className="h-[400px] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* <ThreeDCross /> */}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gray-100 rounded-lg p-8 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-red-700" />
          <h2 className="text-2xl font-bold mb-2">Stay Informed with Catholic News</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest news and updates from the Catholic Church around the
            world.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 rounded-l border focus:outline-none focus:ring-2 focus:ring-red-700"
              required
            />
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-r font-medium transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
