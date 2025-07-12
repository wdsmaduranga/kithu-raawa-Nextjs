"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
    // Handle scroll effect for sticky header
    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > 200) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }
      }
  
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }, [])
  return (
    <>
      <div>
        <header className="header-area ">
          <div className="second-header bg-black">
            <div className="container mx-auto px-10">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <img
                    id="main-logo"
                    className="main-logo my-2 d-none d-lg-block img-fluid"
                    src="/images/logopng.png"
                    alt="Logo site"
                  />
                </div>
                <div className="col-span-2">
                  <div className="my-2 my-md-3 my-lg-4 d-none d-md-block text-center">
                    <a href="#" target="_blank">
                      <img
                        className="w-full bg-white"
                        src="https://demo.bootstrap.news/bootnews/assets/img-min/ads/728-demo.png"
                        alt="Advertiser space"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={cn(
        " top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:flex bg-white z-[30] shadow-md dark:bg-gray-900/95",
        isScrolled
          ? "fixed bg-black text-white shadow-md py-1 dark:bg-gray-900"
          : "bg-white backdrop-blur-sm py-1 dark:bg-gray-900/95",
      )}>
            <div className="container mx-auto px-10 h-20 flex items-center justify-between ">               
            <nav className=" items-center space-x-6 uppercase">
                    <div className="flex items-center gap-6 text-base">
                      <Link
                        href="/"
                        className="transition-colors hover:text-primary"
                      >
                        Home
                      </Link>
                      <Link href="/news" className="transition-colors hover:text-primary">
                        News
                      </Link>
                      <Link href="/event" className="transition-colors hover:text-primary">
                        Event
                      </Link>
                      <Link href="/meditation" className="transition-colors hover:text-primary">
                        Meditation
                      </Link>
                     
                    </div>
                                    
                  </nav>
                  <div className="grid grid-cols-2 items-center space-x-1">
                 <Link
                          href="#"
                          className=""
                        >
                          <img
                            alt="image"
                            src="/images/male.png"
                            className="inline-block size-12 rounded-full ring-2 ring-white"
                          />
                          
                        </Link>
                        <div className="d-sm-none d-lg-inline-block text-color">
                            Hi, Sanka
                          </div>
                 </div> 
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
