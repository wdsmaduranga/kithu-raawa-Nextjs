import { useEffect, useState } from "react";
import { Pagination } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { Avatar } from "@nextui-org/react";
import ScanSubListRow from "@/components/ScanSubLIstRow";
import Loader from '@/components/common/Loader-2';

export default function Modal( 
  {setShowModal}

) {
  const [mychannelData, setMyChannelData] = useState(null);
  const [mysubscribers, setMysubscribers] = useState([]);
  const [userCardData, setUserCardData] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const scanSubList = async () => {
      setLoading(true);
      const token = getCookie("token");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/scan-subscribe-list?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTotalPage(data.pagination.last_page);
          setCurrentPage(data.pagination.current_page);
          setMysubscribers(data.subscribers);
          setLoading(false);
        } else {
          console.error(`Failed to fetch user data: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      setShowModal(true);
    };
    scanSubList();
  }, [page]);
  return (
    <>
      <div className="fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-[#111928]/90 px-4 py-5">
        <div className="">
          <div className="w-full max-w-[550px] rounded-[15px] bg-white px-8 py-10 text-center shadow-3 dark:bg-gray-dark dark:shadow-card md:px-15 md:py-10">
            <h3 className="pb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl">
              My Subscribers
            </h3>
            <span className="mx-auto mb-5.5 inline-block h-[3px] w-22.5 rounded-[2px] bg-primary"></span>

            <div className="p-5 relative">
              <div className="pb-3 text-center lg:pb-4 xl:pb-5 min-h-fit">
                {loading? <Loader fullPage={false} visible={true}/> : mysubscribers?.map((item, index) => (
                  <ScanSubListRow key={index} channel={item} />
                ))}
                <Pagination
                  className="pt-5 grid justify-items-center"
                  color="warning"
                  onChange={(page) => {
                    setPage(page);
                  }}
                  initialPage={currentPage}
                  total={totalPage}
                />
              </div>
            </div>
            <div className="-mx-2.5 flex flex-wrap gap-y-4">
              <div className="w-full px-2.5 2xsm:w-1/2">
                <button onClick={()=>{setShowModal(false)}} className="block w-full rounded-[7px] border border-stroke bg-gray-2 p-[11px] text-center font-medium text-dark transition hover:border-gray-3 hover:bg-gray-3 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-dark-4 dark:hover:bg-dark-4">
                  Cancel
                </button>
              </div>
              <div className="w-full px-3 2xsm:w-1/2">
                {/* <button className="block w-full rounded-[7px] border border-primary bg-primary p-[11px] text-center font-medium text-white transition hover:bg-opacity-90">
                  View Details
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
