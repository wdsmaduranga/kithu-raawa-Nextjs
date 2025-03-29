import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import Image from "next/image";
import { getCookie } from "cookies-next";

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [noTificationList, setnoTificationList] = useState([]);
  
useEffect(()=>{
  const getNotification = async () => {
    const token = getCookie("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notification-message`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setnoTificationList(data.my_notification);
      } else {
        console.error(`Failed to fetch user data: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  // getNotification();
},[])
  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative hidden sm:block">
      <li>
        <Link
          onClick={() => {
            setNotifying(false);
            setDropdownOpen(!dropdownOpen);
          }}
          href="#"
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-gray-2 text-dark hover:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:hover:text-white"
        >
          <span className="relative">
            <svg
              className="fill-current duration-300 ease-in-out"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.0001 1.0415C6.43321 1.0415 3.54172 3.933 3.54172 7.49984V8.08659C3.54172 8.66736 3.36981 9.23513 3.04766 9.71836L2.09049 11.1541C0.979577 12.8205 1.82767 15.0855 3.75983 15.6125C4.3895 15.7842 5.0245 15.9294 5.66317 16.0482L5.66475 16.0525C6.30558 17.7624 8.01834 18.9582 10 18.9582C11.9817 18.9582 13.6944 17.7624 14.3352 16.0525L14.3368 16.0483C14.9755 15.9295 15.6106 15.7842 16.2403 15.6125C18.1724 15.0855 19.0205 12.8205 17.9096 11.1541L16.9524 9.71836C16.6303 9.23513 16.4584 8.66736 16.4584 8.08659V7.49984C16.4584 3.933 13.5669 1.0415 10.0001 1.0415ZM12.8137 16.2806C10.9446 16.504 9.05539 16.504 7.18626 16.2806C7.77872 17.1319 8.8092 17.7082 10 17.7082C11.1908 17.7082 12.2213 17.1319 12.8137 16.2806ZM4.79172 7.49984C4.79172 4.62335 7.12357 2.2915 10.0001 2.2915C12.8765 2.2915 15.2084 4.62335 15.2084 7.49984V8.08659C15.2084 8.91414 15.4533 9.72317 15.9124 10.4117L16.8696 11.8475C17.5072 12.804 17.0204 14.104 15.9114 14.4065C12.0412 15.462 7.95893 15.462 4.08872 14.4065C2.9797 14.104 2.49291 12.804 3.13055 11.8475L4.08772 10.4117C4.54676 9.72317 4.79172 8.91414 4.79172 8.08659V7.49984Z"
                fill=""
              />
            </svg>

            <span
              className={`absolute -top-0.5 right-0 z-1 h-2.5 w-2.5 rounded-full border-2 border-gray-2 bg-red-light dark:border-dark-3 ${
                !notifying ? "hidden" : "inline"
              }`}
            >
              <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-light opacity-75"></span>
            </span>
          </span>
        </Link>

        {dropdownOpen && (
          <div
            className={`absolute -right-27 mt-7.5 flex h-[550px] w-75 flex-col rounded-xl border-[0.5px] border-stroke bg-white px-5.5 pb-5.5 pt-5 shadow-default dark:border-dark-3 dark:bg-gray-dark sm:right-0 sm:w-[364px]`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-medium text-dark dark:text-white">
                Notifications
              </h5>
              <span className="rounded-md bg-primary px-2 py-0.5 text-body-xs font-medium text-white">
                {noTificationList.length}
              </span>
            </div>

            <ul className="no-scrollbar mb-5 flex h-auto flex-col gap-1 overflow-y-auto">
              {noTificationList.map((item: { user: any ,notification: any }, index) => (
                <li key={index}>
                  <Link
                    className="flex items-center gap-4 rounded-[10px] p-2.5 hover:bg-gray-2 dark:hover:bg-dark-3"
                    href="#"
                  >
                    <span className="block h-14 w-14 rounded-full">
                      <Image
                        width={112}
                        height={112}
                        src={item.user.avatar || "data:image/png;base64,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"}
                        style={{
                          width: "auto",
                          height: "auto",
                        }}
                        alt="User"
                      />
                    </span>

                    <span className="block">
                      <span className="block font-medium text-dark dark:text-white">
                        {item?.notification?.title}
                      </span>
                      <span className="block text-body-sm font-medium text-dark-5 dark:text-dark-6">
                      {item?.notification?.notification}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              className="flex items-center justify-center rounded-[7px] border border-primary p-2.5 font-medium text-primary hover:bg-blue-light-5 dark:border-dark-4 dark:text-dark-6 dark:hover:border-primary dark:hover:bg-blue-light-3 dark:hover:text-primary"
              href="#"
            >
              See all notifications
            </Link>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
