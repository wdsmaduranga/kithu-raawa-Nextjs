import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Bookmark,
  Facebook,
  Twitter,
  Mail,
  LinkIcon,
  ChevronRight,
  Check,
  AlertCircle,
  Download,
  Phone,
  MailIcon,
  Globe,
} from "lucide-react"

// This would normally come from a database or API
const getEventData = (id: string) => {
  // Mock data for demonstration
  return {
    id,
    title: "Annual Diocesan Conference",
    category: "Conference",
    date: "May 15, 2023",
    startTime: "9:00 AM",
    endTime: "5:00 PM",
    location: "St. Mary's Cathedral",
    address: "123 Faith Street, Vatican City",
    image: "/placeholder.svg?height=500&width=1200&text=Conference",
    description: `
      <p>Join us for a day of spiritual renewal and community building at our annual diocesan conference. This year's theme is "Faith in Action: Living the Gospel in Today's World."</p>
      
      <p>The conference will feature keynote addresses from prominent Catholic speakers, interactive workshops, and opportunities for prayer and fellowship. Participants will explore how to integrate faith into daily life and respond to contemporary challenges through the lens of Catholic teaching.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">Conference Highlights</h2>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Keynote address by Cardinal Joseph Rodriguez on "The Role of Faith in Modern Society"</li>
        <li>Panel discussion on Catholic Social Teaching and current issues</li>
        <li>Workshops on prayer, scripture study, and evangelization</li>
        <li>Youth track for teenagers and young adults</li>
        <li>Opportunities for Confession and Adoration</li>
        <li>Closing Mass celebrated by the Bishop</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">Schedule</h2>
      
      <p><strong>8:30 AM - 9:00 AM:</strong> Registration and Welcome</p>
      <p><strong>9:00 AM - 10:30 AM:</strong> Opening Session and Keynote Address</p>
      <p><strong>10:45 AM - 12:15 PM:</strong> Morning Workshops (Session 1)</p>
      <p><strong>12:15 PM - 1:30 PM:</strong> Lunch Break</p>
      <p><strong>1:30 PM - 3:00 PM:</strong> Afternoon Workshops (Session 2)</p>
      <p><strong>3:15 PM - 4:30 PM:</strong> Panel Discussion</p>
      <p><strong>4:30 PM - 5:00 PM:</strong> Closing Remarks and Prayer</p>
    `,
    organizer: "Diocesan Office of Faith Formation",
    organizerContact: {
      email: "faithformation@diocese.org",
      phone: "+1 (555) 123-4567",
      website: "www.diocesefaithformation.org",
    },
    ticketInfo: {
      required: true,
      price: "$25.00",
      studentPrice: "$15.00",
      familyPrice: "$60.00",
      registrationDeadline: "May 10, 2023",
    },
    attendees: 250,
    maxCapacity: 300,
    tags: ["Conference", "Faith Formation", "Diocese", "Catholic Teaching"],
    relatedEvents: [
      {
        id: "2",
        title: "Youth Ministry Retreat",
        date: "May 20-22, 2023",
        location: "Sacred Heart Retreat Center",
        image: "/placeholder.svg?height=150&width=300&text=Retreat",
        category: "Retreat",
      },
      {
        id: "3",
        title: "Bible Study Workshop",
        date: "June 12, 2023",
        location: "St. Joseph's Parish Center",
        image: "/placeholder.svg?height=150&width=300&text=Bible+Study",
        category: "Education",
      },
      {
        id: "5",
        title: "Family Day Celebration",
        date: "June 25, 2023",
        location: "Blessed Family Park",
        image: "/placeholder.svg?height=150&width=300&text=Family+Day",
        category: "Community",
      },
    ],
  }
}

export default function EventPage({ params }: { params: { id: string } }) {
  const event = getEventData(params.id)
  const registrationOpen = true
  const spotsRemaining = event.maxCapacity - event.attendees

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="mb-4">
            <Link
              href={`/events/category/${event.category.toLowerCase()}`}
              className="inline-block bg-blue-700 text-white px-3 py-1 text-sm font-medium rounded-md mb-2 hover:bg-blue-800 transition-colors"
            >
              {event.category}
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {event.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2 md:space-y-0">
            <div className="flex items-center mr-6">
              <Calendar className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-2" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center mr-6">
              <Clock className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-2" />
              <span>
                {event.startTime} - {event.endTime}
              </span>
            </div>
            <div className="flex items-center mr-6">
              <MapPin className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-2" />
              <span>{event.attendees} attending</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-4xl mx-auto mb-8 relative rounded-xl overflow-hidden shadow-3d">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            width={1200}
            height={500}
            className="w-full h-auto object-cover"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center text-white">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{event.address}</span>
            </div>
          </div>
        </div>

        {/* Event Content and Sidebar */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Event Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6 mb-8 transform hover:scale-[1.01] transition-all duration-500">
              <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-700 dark:prose-a:text-blue-500 hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-400">
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
              </article>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/events/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Social Sharing */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">Share this event:</span>
                    <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      <Facebook className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors ml-2">
                      <Twitter className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors ml-2">
                      <Mail className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors ml-2">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button className="flex items-center text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-500 transition-colors">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Add to Calendar</span>
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-500 transition-colors">
                      <Bookmark className="h-5 w-5 mr-2" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Event Organizer</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{event.organizer}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MailIcon className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-3" />
                    <a
                      href={`mailto:${event.organizerContact.email}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-500"
                    >
                      {event.organizerContact.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-3" />
                    <a
                      href={`tel:${event.organizerContact.phone}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-500"
                    >
                      {event.organizerContact.phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-3" />
                    <a
                      href={`https://${event.organizerContact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-500"
                    >
                      {event.organizerContact.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Location</h3>
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4">
                {/* This would be a real map in a production environment */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-blue-700 dark:text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{event.location}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{event.address}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{event.location}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{event.address}</p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${event.location}, ${event.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Registration/Ticket Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Registration</h3>

              {registrationOpen ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Regular Ticket</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{event.ticketInfo.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Student Ticket</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {event.ticketInfo.studentPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Family Package</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {event.ticketInfo.familyPrice}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <span className="font-medium">
                            Registration closes on {event.ticketInfo.registrationDeadline}
                          </span>
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          Only {spotsRemaining} spots remaining
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-md transition-colors mb-3 flex items-center justify-center">
                    <Check className="h-5 w-5 mr-2" />
                    Register Now
                  </button>

                  <a
                    href="#"
                    className="block w-full text-center text-sm text-blue-700 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                  >
                    Group registration (10+ people)
                  </a>
                </>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md text-center">
                  <AlertCircle className="h-6 w-6 text-red-700 dark:text-red-500 mx-auto mb-2" />
                  <p className="text-red-800 dark:text-red-300 font-medium">Registration is closed</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Please contact the organizer for more information
                  </p>
                </div>
              )}
            </div>

            {/* Event Details Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Date & Time</h4>
                    <p className="text-gray-600 dark:text-gray-400">{event.date}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Location</h4>
                    <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                    <p className="text-gray-600 dark:text-gray-400">{event.address}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-blue-700 dark:text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Attendees</h4>
                    <p className="text-gray-600 dark:text-gray-400">{event.attendees} people attending</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a
                  href="#"
                  className="flex items-center justify-center text-blue-700 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Event Details
                </a>
              </div>
            </div>

            {/* Related Events */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Related Events</h3>
              <div className="space-y-4">
                {event.relatedEvents.map((related) => (
                  <div key={related.id} className="group">
                    <Link href={`/events/${related.id}`} className="flex gap-3 group">
                      <Image
                        src={related.image || "/placeholder.svg"}
                        alt={related.title}
                        width={100}
                        height={60}
                        className="w-24 h-16 object-cover rounded-md group-hover:opacity-90 transition-opacity"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-500">{related.category}</span>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-500 transition-colors">
                          {related.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{related.date}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  href="/events"
                  className="inline-flex items-center text-blue-700 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 font-medium text-sm"
                >
                  View All Events
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Add to Calendar */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-xl shadow-3d p-6">
              <h3 className="text-xl font-bold mb-2">Don't Miss It!</h3>
              <p className="text-blue-100 mb-4">Add this event to your calendar to receive reminders.</p>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center w-full px-4 py-2 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Google Calendar
                </a>
                <a
                  href="#"
                  className="flex items-center w-full px-4 py-2 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Apple Calendar
                </a>
                <a
                  href="#"
                  className="flex items-center w-full px-4 py-2 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Outlook Calendar
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
