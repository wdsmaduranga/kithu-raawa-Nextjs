'use client'
import Link from "next/link";
import { useCallback, useEffect } from "react";
export default function Header() {
  const onScroll = useCallback(event => {
    var header = document.getElementById("header_navbar_top");
    var sticky_flex = document.getElementById("header-flex");
   if (window.scrollY > 250) {

        // header.classList.add("sticky");
        header.classList.add("sticky-bar");
        sticky_flex.classList.add('sticky-flex')
        document.body.style.paddingTop = '100px';
      } else {
        //  header.classList.remove("sticky");
         header.classList.remove("sticky-bar");
         sticky_flex.classList.remove('sticky-flex');
       // remove padding top from body
         document.body.style.paddingTop = '0';
    }

}, []);
useEffect(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
     window.removeEventListener("scroll", onScroll, { passive: true });
  }
}, []);
  return (
    <>
      <div>
        <header className="header-area">
          <div className="mobile-sticky fs-6 bg-secondary">
            <div className="container">
              <nav className="navbar conatain-navbar navbar-expand-lg navbar-dark px-0 py-0">
                <a
                  aria-label="sidebar menu"
                  className="navbar-toggler sidebar-menu-trigger side-hamburger border-0 px-0"
                  href="#"
                >
                  <span className="hamburger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </a>
                <a href="/">
                  <img
                    className="mobile-logo img-fluid d-lg-none mx-auto img-trans"
                    src="/images/logopng.png"
                    alt="Logo site"
                   />
                </a>
                {/* {userLogged?(
   <ul id="start-main" className="navbar-toggler px-0">
     <li className="dropdown display-inline d-inline-flex">
      <a data-toggle="dropdown" className="nav-link dropdown-toggle nav-link-lg nav-link-user">
         <img alt="image" src={api_link+userData.user.user_avatar.url} className="rounded-circle mr-1"/>
         <div className="sidenav-text-color h6">Hi,  {userData.user.first_name}</div>
      </a>
         <div className="dropdown-menu dropdown-menu-right">
           <div className="dropdown-title"></div>
           <a  className="dropdown-item has-icon">
             <i className="far fa-user"></i> Profile
           </a>
           <div>
           <a href ="/admin" className="dropdown-item has-icon">
             <i className="far fa-user"></i> Dashboard
           </a >
           </div>
           <div className="dropdown-divider"></div>
           <a className="dropdown-item has-icon text-danger">
             <i className="fas fa-sign-out-alt"></i> Logout
           </a>
         </div>
       </li>
    </ul>):''} */}

                {/* <div id="navbarTogglerDemo" className="collapse navbar-collapse">

           <ul className="navbar-nav"  v-if="!loggedIn">
             <Link className="nav-link" href ="/login">Sign in</Link>
             <Link className="nav-link" href ="/register">Sign up</Link>
           </ul>

         </div> */}
              </nav>

              <div
                className="collapse navbar-collapse col-12 py-2"
                id="navbarTogglerDemo2"
              >
                <form className="form-inline" action="../category/search.html">
                  <div className="input-group w-100 bg-white">
                    <input
                      type="text"
                      className="form-control border border-end-0"
                      placeholder="Search..."
                      aria-label="search"
                    />
                    <div className="input-group-prepend bg-light-dark">
                      <button
                        className="btn bg-transparent border-start-0 input-group-text border"
                        type="submit"
                      ></button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="second-header bg-black">
            <div className="container">
              <div className="row">
                <div className="col-lg-4">
                  <img
                    id="main-logo"
                    className="main-logo my-2 d-none d-lg-block img-fluid"
                    src="/images/logopng.png"
                    alt="Logo site"
                  />
                </div>
                <div className="col-lg-8">
                  <div className="my-2 my-md-3 my-lg-4 d-none d-md-block text-center">
                    <a href="#" target="_blank">
                      <img
                        className="img-fluid bg-light"
                        src="https://demo.bootstrap.news/bootnews/assets/img-min/ads/728-demo.png"
                        alt="Advertiser space"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="header_navbar_top"
            className="header-sticky  header-dnone headertansition bg-white"
          >
            <div className="container">
              <div className="row align-items-center">
                <div
                  id="header-flex"
                  className="col-xl-10 col-lg-10 col-md-12 header-flex"
                >
                  <div className="sticky-logo info-open">
                    <a>
                      <img
                        src="/images/logopng.png"
                        className="img-sticky-bar"
                        alt=""
                        data-pagespeed-url-hash="1061915070"
                      />
                    </a>
                  </div>
                  <div className="">
                    <nav
                      id="main-menu"
                      className="navbar conatain-navbar conatain-navbar conatain-navbar navbar-expand-lg"
                      style={{ height: "100px" }}
                    >
                      <div
                        className=""
                      >
                        <ul
                          id="start-main"
                          className="navbar-nav main-nav navbar-uppercase first-start-lg-0"
                        >
                          <li className="nav-item">
                            <Link href="/" className="nav-link text-color">
                              Home
                            </Link>
                          </li>
                          <li className="nav-item">
                            <Link href="/news" className="nav-link text-color">
                              News
                            </Link>
                          </li>
                          <li className="nav-item">
                            <Link href="/event" className="nav-link text-color">
                              Event
                            </Link>
                          </li>
                          <li className="nav-item">
                            <Link href="/radio" className="nav-link text-color">
                              Radio
                            </Link>
                          </li>
                          <li className="nav-item dropdown">
                            <Link
                              id="navbarDropdown1"
                              className="nav-link text-color"
                              href="/hymn"
                            >
                              Player
                            </Link>
                            <ul
                              className="dropdown-menu main-dropdown-menu"
                              aria-labelledby="navbarDropdown1"
                            >
                              <li>
                                <Link
                                  href="/hymn/albums"
                                  className="nav-link text-color"
                                >
                                  Hymn Albums
                                </Link>
                              </li>
                              <li>
                                <Link
                                  href="/hymn/hymns"
                                  className="nav-link text-color"
                                >
                                  Hymn Tracks
                                </Link>
                              </li>
                            </ul>
                          </li>
                        </ul>
                        <div className="navbar-nav ms-auto header-right-btn f-right d-none d-lg-block ms-auto">
                          <div className="search-box">
                            <div className="search-menu no-shadow border-0">
                              <form
                                className="form-src form-inline"
                                action="../category/search.html"
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control end-0"
                                    name="keywords"
                                    placeholder="Search..."
                                    aria-label="search"
                                  />
                                  <span className="icones"></span>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                        {/* {userLogged?(<ul id="start-main" className="navbar-nav navbar-right main-nav navbar-uppercase first-start-lg-0">
     <li className="dropdown"><Link href="#" data-toggle="dropdown" className="nav-link dropdown-toggle nav-link-lg nav-link-user">
         <img alt="image" src={api_link+userData.user.user_avatar.url} className="rounded-circle mr-1"/>
         <div className="d-sm-none d-lg-inline-block text-color">Hi,  {userData.user.first_name}</div></Link>
         <div className="dropdown-menu dropdown-menu-right">
           <div className="dropdown-title"></div>
           <Link href="#"  className="dropdown-item has-icon">
             <i className="far fa-user"></i> Profile
           </Link>
           <div>
           <Link href ="/admin" className="dropdown-item has-icon">
             <i className="far fa-user"></i> Dashboard
           </Link >
           </div>
           <div className="dropdown-divider"></div>
           <Link href="#" onClick={()=>dispatch(logoutUser())} className="dropdown-item has-icon text-danger">
             <i className="fas fa-sign-out-alt"></i> Logout
           </Link>
         </div>
       </li>
 </ul>):''} */}
                      </div>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mobile-side" id="mobile_sidebar">
          <div className="back-menu back-menu-start">
            <span className="hamburger-icon open">
              <svg
                className="bi bi-x"
                width="2rem"
                height="2rem"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M11.854 4.146a.5.5 0 010 .708l-7 7a.5.5 0 01-.708-.708l7-7a.5.5 0 01.708 0z"
                  clipRule="evenodd"
                ></path>
                <path
                  fillRule="evenodd"
                  d="M4.146 4.146a.5.5 0 000 .708l7 7a.5.5 0 00.708-.708l-7-7a.5.5 0 00-.708 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
          </div>

          <nav
            id="mobile-menu"
            className="menu-mobile d-flex flex-column push push-start shadow-r-sm"
          >
            <div className="mobile-content mb-auto">
              <div className="logo-sidenav p-2">
                <Link href="/">
                  <img
                    src="/images/logo1.jpg"
                    style={{ width: "140px" }}
                    className="img-fluid"
                    alt="logo"
                  />
                </Link>
              </div>

              <div className="sidenav-menu">
                <nav className="navbar navbar-inverse">
                  <ul
                    id="side-menu"
                    className="nav navbar-nav list-group list-unstyled side-link"
                  >
                    <li className="menu-item nav-item">
                      <Link
                        href="/"
                        className="sidenav-nav-link sidenav-text-color"
                      >
                        Home
                      </Link>
                    </li>
                    <li className="menu-item nav-item">
                      <Link
                        href="/news"
                        className="sidenav-nav-link sidenav-text-color"
                      >
                        News
                      </Link>
                    </li>
                    <li className="menu-item nav-item">
                      <Link
                        href="/event"
                        className="sidenav-nav-link sidenav-text-color"
                      >
                        Event
                      </Link>
                    </li>
                    <li className="menu-item nav-item">
                      <Link
                        href="/radio"
                        className="sidenav-nav-link sidenav-text-color"
                      >
                        Radio
                      </Link>
                    </li>
                    <li className="menu-item nav-item">
                      <Link
                        href="/player"
                        className="sidenav-nav-link sidenav-text-color"
                      >
                        Player
                      </Link>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="menu-12"
                        role="menu"
                      >
                        <li className="menu-item menu-item-has-children mega-dropdown nav-item">
                          <Link
                            href="/player/albums"
                            className="sidenav-nav-link sidenav-text-color"
                          >
                            Hymn Albums
                          </Link>
                        </li>
                        <li className="menu-item menu-item-has-children mega-dropdown nav-item">
                          <Link
                            href="/player/tracks"
                            className="sidenav-nav-link sidenav-text-color"
                          >
                            Hymn Tracks
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            <div className="mobile-copyright mt-5 px-4 text-center">
              <p>
                Copyright <Link href="/">Kithu-Raawa</Link> - All right reserved
              </p>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
