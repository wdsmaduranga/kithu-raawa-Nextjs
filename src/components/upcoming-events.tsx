"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Users, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock data for upcoming events
const events = [
  {
    id: 1,
    title: "Annual Diocesan Conference",
    date: "May 15, 2023",
    time: "9:00 AM - 5:00 PM",
    location: "St. Mary's Cathedral",
    address: "123 Faith Street, Vatican City",
    category: "Conference",
    image: "/placeholder.svg?height=200&width=300&text=Conference",
    attendees: 250,
    description: "Join us for a day of spiritual renewal and community building at our annual diocesan conference.",
  },
  {
    id: 2,
    title: "Youth Ministry Retreat",
    date: "May 20-22, 2023",
    time: "All Day",
    location: "Sacred Heart Retreat Center",
    address: "456 Prayer Lane, Rome",
    category: "Retreat",
    image: "/placeholder.svg?height=200&width=300&text=Retreat",
    attendees: 120,
    description: "A weekend retreat for young Catholics to deepen their faith and build lasting friendships.",
  },
  {
    id: 3,
    title: "Charity Fundraising Dinner",
    date: "June 5, 2023",
    time: "6:30 PM - 9:30 PM",
    location: "Divine Mercy Hall",
    address: "789 Charity Avenue, Vatican City",
    category: "Charity",
    image: "/placeholder.svg?height=200&width=300&text=Charity",
    attendees: 180,
    description: "An elegant evening of dining and fellowship to raise funds for our global mission initiatives.",
  },
  {
    id: 4,
    title: "Bible Study Workshop",
    date: "June 12, 2023",
    time: "7:00 PM - 8:30 PM",
    location: "St. Joseph's Parish Center",
    address: "321 Scripture Road, Vatican City",
    category: "Education",
    image: "/placeholder.svg?height=200&width=300&text=Bible+Study",
    attendees: 75,
    description:
      "Learn effective methods for studying and understanding sacred scripture in this interactive workshop.",
  },
  {
    id: 5,
    title: "Family Day Celebration",
    date: "June 25, 2023",
    time: "11:00 AM - 4:00 PM",
    location: "Blessed Family Park",
    address: "555 Family Circle, Vatican City",
    category: "Community",
    image: "/placeholder.svg?height=200&width=300&text=Family+Day",
    attendees: 350,
    description: "A day of games, food, and activities celebrating the importance of family in our faith community.",
  },
]

// Categories with their colors
const categories = [
  { name: "All", color: "bg-gray-600" },
  { name: "Conference", color: "bg-blue-600" },
  { name: "Retreat", color: "bg-green-600" },
  { name: "Charity", color: "bg-red-600" },
  { name: "Education", color: "bg-yellow-600" },
  { name: "Community", color: "bg-purple-600" },
]

export default function UpcomingEvents() {
  const [activeCategory, setActiveCategory] = useState("All")

  // Filter events based on selected category
  const filteredEvents = activeCategory === "All" ? events : events.filter((event) => event.category === activeCategory)

  // Get category color
  const getCategoryColor = (category: string) => {
    const found = categories.find((c) => c.name === category)
    return found ? found.color : "bg-gray-600"
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-3d transform hover:scale-[1.01] transition-all duration-500">
      <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 text-white">
        <h2 className="text-3xl font-bold mb-2 text-shadow">Upcoming Events</h2>
        <p className="text-red-100">Join our community in these upcoming gatherings and celebrations</p>
      </div>

      {/* Category Filter */}
      <div className="p-4 bg-gray-50 border-b overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.name
                  ? `${category.color} text-white shadow-lg transform -translate-y-1`
                  : "bg-white text-gray-700 border hover:shadow"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="group relative bg-white rounded-lg overflow-hidden border shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 card-3d"
          >
            {/* Event Image */}
            <div className="relative h-48 overflow-hidden">
              <div
                className={`absolute top-0 right-0 ${getCategoryColor(event.category)} text-white px-3 py-1 text-sm font-medium z-10`}
              >
                {event.category}
              </div>
              <Image
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                width={300}
                height={200}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Event Content */}
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-red-700 transition-colors duration-300">
                {event.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-red-700" />
                  <span className="text-sm">{event.date}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-red-700" />
                  <span className="text-sm">{event.time}</span>
                </div>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-red-700 mt-0.5" />
                  <div className="text-sm">
                    <div>{event.location}</div>
                    <div className="text-gray-500 text-xs">{event.address}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-red-700" />
                  <span className="text-sm">{event.attendees} expected attendees</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

              <Link
                href={`/events/${event.id}`}
                className="inline-flex items-center text-red-700 hover:text-red-900 font-medium text-sm group"
              >
                View Details
                <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            {/* Decorative cross in the background */}
            <div className="absolute top-2 right-2 text-red-100/10 opacity-30 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,4l0,4l-8,0l0,-4l-2,0l0,4l0,2l2,0l8,0l2,0l0,-2l0,-4l-2,0Zm-10,8l0,8l2,0l0,-8l-2,0Zm8,0l0,8l2,0l0,-8l-2,0Z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* View All Events Button */}
      <div className="p-6 text-center border-t">
        <Link
          href="/events"
          className="inline-flex items-center justify-center bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          View All Events
          <ChevronRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}
