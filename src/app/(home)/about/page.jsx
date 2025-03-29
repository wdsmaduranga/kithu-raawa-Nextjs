import React from 'react';
import { PenLine, Bell, User } from 'lucide-react';
import StoryBuletComponentOne from '@/components/indexPage/bulletin_story_component';
import StoryBuletOne from '@/components/indexPage/bulletin_story_1';
import StoryBuletTwo from '@/components/indexPage/bulletin_story_2';
import StoryBuletThree from '@/components/indexPage/bulletin_story_3';
const BuletinHomepage = () => {




  const publishers = [
    { name: "bbcnews", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "ecommurz", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "formula_one", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "alvian.de", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "goal", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "apple", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "samsung", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "idntimes", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "kretyastudio", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" },
    { name: "fitra.eri", image: "/images/b7290197aeab61b0a63ce3a4f0e2e28b.jpg" }
  ];

  return (
    <div className=" ">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-1">
        {/* Featured Story */}
       <StoryBuletOne/>
       <StoryBuletTwo/>
       
       <div className="mx-auto px-4 py-6">
       <StoryBuletThree/>
       </div>
        {/* Buletin Story */}
        {/* <div className="mb-12"> */}
          <StoryBuletComponentOne/>
        {/* </div> */}
        <h1>dsfsfssdf</h1>


      </main>
   
    </div>
  );
};

export default BuletinHomepage;