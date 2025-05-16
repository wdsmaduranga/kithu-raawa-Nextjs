import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  Facebook,
  Twitter,
  Mail,
  LinkIcon,
  ChevronRight,
  Eye,
  Printer,
} from "lucide-react"

// This would normally come from a database or API
const getArticleData = (id: string) => {
  // Mock data for demonstration
  return {
    id,
    title: "Pope Francis Calls for Global Peace Initiative",
    category: "Vatican",
    author: "Vatican Correspondent",
    authorImage: "/placeholder.svg?height=100&width=100&text=Author",
    publishDate: "May 10, 2023",
    readTime: "5 min read",
    location: "Vatican City",
    image: "/placeholder.svg?height=500&width=1200",
    content: `
      <p class="first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left">In his Sunday address, the Pope urged world leaders to prioritize dialogue over conflict, calling for a renewed commitment to peace in troubled regions around the globe. Speaking to thousands gathered in St. Peter's Square, the Holy Father emphasized the importance of diplomatic solutions to international tensions.</p>
      
      <p>"The path to lasting peace requires courage, patience, and a willingness to listen," said the Holy Father, addressing the crowd with visible emotion. "We cannot continue to allow the suffering of innocent people caught in conflicts not of their making."</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">A Call for Diplomatic Solutions</h2>
      
      <p>The Pope's initiative comes amid escalating tensions in several regions, with the Vatican taking a more active diplomatic role in recent months. Vatican officials have been engaged in behind-the-scenes negotiations in multiple conflict zones, working to establish dialogue between opposing parties.</p>
      
      <p>Cardinal Pietro Parolin, the Vatican's Secretary of State, elaborated on the Holy Father's vision in a subsequent press conference: "This is not merely a call for peace in the abstract. The Holy Father is proposing concrete steps that nations can take to de-escalate tensions and build lasting peace."</p>
      
      <blockquote class="border-l-4 border-red-700 pl-4 italic my-6 text-gray-700 dark:text-gray-300">
        "Peace is not merely the absence of war; it is a virtue, a state of mind, a disposition for benevolence, confidence, and justice." — The Holy Father, quoting St. Augustine
      </blockquote>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">International Response</h2>
      
      <p>The initiative has already garnered support from several world leaders, with representatives from the United Nations expressing interest in collaborating with the Vatican on peace-building efforts.</p>
      
      <p>"The moral authority of the Holy Father gives this initiative particular weight," noted UN Secretary-General António Guterres. "We welcome the Vatican's increased engagement in conflict resolution."</p>
      
      <p>Faith leaders from other religious traditions have also voiced their support, with many pledging to promote the peace initiative within their own communities.</p>
    `,
    tags: ["Peace", "Vatican", "Pope Francis", "Diplomacy", "International Relations"],
    views: "5.7K",
    likes: "1.2K",
    comments: 348,
    shares: 256,
    relatedArticles: [
      {
        id: "2",
        title: "Cardinal Secretary Announces New Encyclical on Digital Ethics",
        excerpt:
          "The Vatican has announced a forthcoming encyclical addressing the ethical challenges of the digital age.",
        image: "/placeholder.svg?height=150&width=300&text=Encyclical",
        category: "Vatican",
        date: "May 9, 2023",
      },
      {
        id: "3",
        title: "Catholic Relief Organizations Respond to Natural Disaster",
        excerpt:
          "Catholic relief organizations have mobilized to provide emergency assistance following devastating floods.",
        image: "/placeholder.svg?height=150&width=300&text=Relief+Efforts",
        category: "International",
        date: "May 8, 2023",
      },
      {
        id: "4",
        title: "Historic Church Restoration Project Completed",
        excerpt:
          "After five years of careful work, the 16th century St. Marie Cathedral reopens its doors to worshippers and visitors.",
        image: "/placeholder.svg?height=150&width=300&text=Church",
        category: "Heritage",
        date: "May 7, 2023",
      },
    ],
  }
}

// Mock comments data
const comments = [
  {
    id: 1,
    author: "Maria Rodriguez",
    authorImage: "/placeholder.svg?height=50&width=50&text=MR",
    date: "May 10, 2023",
    content: "This initiative gives me hope. We need more leaders focusing on peace rather than division.",
    likes: 24,
    replies: [
      {
        id: 11,
        author: "John Smith",
        authorImage: "/placeholder.svg?height=50&width=50&text=JS",
        date: "May 10, 2023",
        content: "I completely agree. The Holy Father's words are exactly what the world needs right now.",
        likes: 8,
      },
    ],
  },
  {
    id: 2,
    author: "Thomas Wilson",
    authorImage: "/placeholder.svg?height=50&width=50&text=TW",
    date: "May 10, 2023",
    content:
      "I appreciate the Vatican's diplomatic efforts. The Church has a unique position to mediate in conflicts where other organizations might struggle to gain trust.",
    likes: 17,
    replies: [],
  },
  {
    id: 3,
    author: "Sarah Johnson",
    authorImage: "/placeholder.svg?height=50&width=50&text=SJ",
    date: "May 11, 2023",
    content:
      "I'm curious about the specific steps being proposed. Does anyone have more information about the concrete actions mentioned?",
    likes: 5,
    replies: [],
  },
]

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = getArticleData(params.id)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Article Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="mb-4">
            <Link
              href={`/news/category/${article.category.toLowerCase()}`}
              className="inline-block bg-red-700 text-white px-3 py-1 text-sm font-medium rounded-md mb-2 hover:bg-red-800 transition-colors"
            >
              {article.category}
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {article.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center space-x-4 mb-2 md:mb-0">
              <div className="flex items-center">
                <Image
                  src={article.authorImage || "/placeholder.svg"}
                  alt={article.author}
                  width={40}
                  height={40}
                  className="rounded-full mr-2"
                />
                <span className="font-medium">{article.author}</span>
              </div>
              <span>|</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{article.publishDate}</span>
              </div>
              <span>|</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{article.readTime}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center text-gray-600 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500 transition-colors">
                <Share2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500 transition-colors">
                <Bookmark className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500 transition-colors">
                <Printer className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-4xl mx-auto mb-8 relative rounded-xl overflow-hidden shadow-3d">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            width={1200}
            height={500}
            className="w-full h-auto object-cover"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center text-white">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{article.location}</span>
            </div>
          </div>
        </div>

        {/* Article Content and Sidebar */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Article Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6 mb-8 transform hover:scale-[1.01] transition-all duration-500">
              <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-red-700 dark:prose-a:text-red-500 hover:prose-a:text-red-800 dark:hover:prose-a:text-red-400">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </article>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/news/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Social Engagement */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center space-x-6 mb-4 md:mb-0">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">{article.views} views</span>
                    </div>
                    <button className="flex items-center text-gray-600 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500 transition-colors">
                      <Heart className="h-5 w-5 mr-2" />
                      <span>{article.likes}</span>
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500 transition-colors">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      <span>{article.comments}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
                    <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      <Facebook className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors">
                      <Twitter className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors">
                      <Mail className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Bio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Image
                  src={article.authorImage || "/placeholder.svg"}
                  alt={article.author}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{article.author}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Vatican Correspondent with over 15 years of experience covering papal affairs and Church news.
                    Previously served as a correspondent in Rome and Jerusalem.
                  </p>
                  <div className="flex space-x-3">
                    <Link
                      href="#"
                      className="text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                    >
                      View Profile
                    </Link>
                    <Link
                      href="#"
                      className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      All Articles
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Comments ({article.comments})</h3>

              {/* Comment Form */}
              <div className="mb-8">
                <div className="flex items-start space-x-4">
                  <Image
                    src="/placeholder.svg?height=50&width=50&text=You"
                    alt="Your Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      placeholder="Join the discussion..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-gray-100"
                      rows={3}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={comment.authorImage || "/placeholder.svg"}
                        alt={comment.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{comment.author}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{comment.date}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <button className="text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4 inline mr-1" />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                            Reply
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="mt-4 ml-6 space-y-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start space-x-4">
                                <Image
                                  src={reply.authorImage || "/placeholder.svg"}
                                  alt={reply.author}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-medium text-gray-900 dark:text-gray-100">{reply.author}</h5>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{reply.date}</span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 mb-2">{reply.content}</p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <button className="text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500 transition-colors">
                                      <Heart className="h-3 w-3 inline mr-1" />
                                      <span>{reply.likes}</span>
                                    </button>
                                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Comments */}
              <div className="mt-6 text-center">
                <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Load More Comments
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Related Articles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Related Articles
              </h3>
              <div className="space-y-4">
                {article.relatedArticles.map((related) => (
                  <div key={related.id} className="group">
                    <Link href={`/news/article/${related.id}`} className="flex gap-3 group">
                      <Image
                        src={related.image || "/placeholder.svg"}
                        alt={related.title}
                        width={100}
                        height={60}
                        className="w-24 h-16 object-cover rounded-md group-hover:opacity-90 transition-opacity"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-medium text-red-700 dark:text-red-500">{related.category}</span>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors">
                          {related.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{related.date}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  href="/news"
                  className="inline-flex items-center text-red-700 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 font-medium text-sm"
                >
                  View All News
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-red-700 to-red-900 text-white rounded-xl shadow-3d p-6">
              <h3 className="text-xl font-bold mb-2">Stay Informed</h3>
              <p className="text-red-100 mb-4">Subscribe to our newsletter for the latest Catholic news and updates.</p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 rounded-md border border-red-600 bg-red-800/50 text-white placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-white text-red-700 rounded-md font-medium hover:bg-red-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className="mt-3 text-xs text-red-200">
                By subscribing, you agree to our{" "}
                <Link href="/privacy" className="underline hover:text-white">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Popular Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/news/tag/vatican"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Vatican
                </Link>
                <Link
                  href="/news/tag/pope-francis"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Pope Francis
                </Link>
                <Link
                  href="/news/tag/peace"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Peace
                </Link>
                <Link
                  href="/news/tag/charity"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Charity
                </Link>
                <Link
                  href="/news/tag/faith"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Faith
                </Link>
                <Link
                  href="/news/tag/prayer"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Prayer
                </Link>
                <Link
                  href="/news/tag/mass"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Mass
                </Link>
                <Link
                  href="/news/tag/family"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Family
                </Link>
              </div>
            </div>

            {/* Featured Video */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-3d p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Featured Video
              </h3>
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden relative">
                <Image
                  src="/placeholder.svg?height=300&width=500&text=Video+Thumbnail"
                  alt="Featured Video"
                  width={500}
                  height={300}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-red-700/80 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-white ml-1"></div>
                  </div>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Pope's Weekly Angelus: A Message of Hope
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Watch the Holy Father's latest address from St. Peter's Square.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
