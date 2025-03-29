'use client'
import React from 'react';

const MustRead = () => {
  const mustReadArticles = [
    {
      title: "Ukraine's silence along southern front fuels counteroffensive...",
      image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg",
      source: "CNN",
      time: "10 hours ago",
      category: "War",
      readTime: "8 min read"
    },
    {
      title: "Taylor Swift is sending a powerful message to women on the Eras...",
      image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg",
      source: "CNN",
      time: "5 hours ago", 
      category: "Entertainment",
      readTime: "10 min read"
    },
    {
      // Added smaller articles below main section
      mainArticles: [
        {
          title: "Inside Qatar's city of the future...",
          image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg",
          source: "BBC News",
          time: "20 hours ago",
          category: "Travel",
          readTime: "4 min read"
        },
        {
          title: "Wrexham secures promotion in front of...",
          image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg", 
          source: "Goal",
          time: "22 hours ago",
          category: "Sport",
          readTime: "6 min read"
        }
      ]
    }
  ];

  return (
    <div className=" mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Must Read</h2>
        <a 
          href="#" 
          className="text-red-600 hover:underline flex items-center"
        >
          See all →
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Large Main Article */}
        <div className="col-span-2 relative">
          <img 
            src={mustReadArticles[1].image} 
            alt={mustReadArticles[1].title} 
            className="w-full h-[400px] object-cover rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent text-white">
            <div className="flex items-center space-x-2 mb-2 text-sm">
              <span className="bg-red-600 px-2 py-1 rounded">
                {mustReadArticles[1].source}
              </span>
              <span>{mustReadArticles[1].time}</span>
            </div>
            <h3 className="text-2xl font-bold">{mustReadArticles[1].title}</h3>
            <div className="mt-2 flex items-center space-x-2 text-sm">
              <span>{mustReadArticles[1].category}</span>
              <span>• {mustReadArticles[1].readTime}</span>
            </div>
          </div>
        </div>

        {/* Smaller Side Articles */}
        <div className="col-span-1 space-y-4">
          {/* First side article */}
          <div className="relative">
            <img 
              src={mustReadArticles[0].image} 
              alt={mustReadArticles[0].title} 
              className="w-full h-[190px] object-cover rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
              <div className="flex items-center space-x-2 mb-1 text-xs">
                <span className="bg-red-600 px-2 py-0.5 rounded">
                  {mustReadArticles[0].source}
                </span>
                <span>{mustReadArticles[0].time}</span>
              </div>
              <h4 className="text-sm font-bold">{mustReadArticles[0].title}</h4>
              <div className="mt-1 flex items-center space-x-1 text-xs">
                <span>{mustReadArticles[0].category}</span>
                <span>• {mustReadArticles[0].readTime}</span>
              </div>
            </div>
          </div>

          {/* Bottom two small articles */}
          {mustReadArticles[2].mainArticles.map((article, index) => (
            <div key={index} className="flex bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-1/3 object-cover"
              />
              <div className="w-2/3 p-3">
                <div className="flex items-center space-x-2 mb-1 text-xs text-gray-500">
                  <span>{article.source}</span>
                  <span>• {article.time}</span>
                </div>
                <h4 className="font-semibold text-sm">{article.title}</h4>
                <div className="mt-1 flex items-center space-x-1 text-xs text-gray-500">
                  <span>{article.category}</span>
                  <span>• {article.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
        </div>
  );
};

export default MustRead;