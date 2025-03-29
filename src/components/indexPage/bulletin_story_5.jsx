import React from 'react';

const BulletinStory = () => {
  const storyLogos = [
    {
      name: 'bbcnews',
      logo: '/logos/bbcnews.png',
      bgColor: 'bg-red-600'
    },
    {
      name: 'ecommurz',
      logo: '/logos/ecommurz.png',
      bgColor: 'bg-white border'
    },
    {
      name: 'formula1',
      logo: '/logos/formula1.png',
      bgColor: 'bg-red-600'
    },
    {
      name: 'formula_one',
      logo: '/logos/formula_one.png',
      bgColor: 'bg-white border'
    },
    {
      name: 'goal',
      logo: '/logos/goal.png',
      bgColor: 'bg-white border'
    },
    {
      name: 'apple',
      logo: '/logos/apple.png',
      bgColor: 'bg-black'
    },
    {
      name: 'samsung',
      logo: '/logos/samsung.png',
      bgColor: 'bg-blue-600'
    },
    {
      name: 'idntimes',
      logo: '/logos/idntimes.png',
      bgColor: 'bg-red-600'
    },
    {
      name: 'kretystudio',
      logo: '/logos/kretystudio.png',
      bgColor: 'bg-black'
    },
    {
      name: 'fitra.eri',
      logo: '/logos/fitra_eri.png',
      bgColor: 'bg-white border'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Bulletin Story</h2>
        <a 
          href="#" 
          className="text-red-600 hover:underline flex items-center"
        >
          See all →
        </a>
      </div>
      
      <div className="flex space-x-12 overflow-x-2 pb-4">
        {storyLogos.map((item, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 flex flex-col items-center"
          >
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center
              ${item.bgColor} mb-2
            `}>
              <img 
                src={item.logo} 
                alt={item.name} 
                className="w-15 h-15 object-contain"
              />
            </div>
            <span className="text-xs text-gray-600">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulletinStory;