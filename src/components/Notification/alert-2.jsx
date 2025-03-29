import { toast } from "react-hot-toast";

const CustomToast = ({ t, message, type , link }) => {
  const bgColor = type === "success" ? "bg-emerald-100 border-green-600" : "border-red-light-4 bg-red-light-3";
  const textColor = "text-white";
  const hreflink = link ? link : null;
  
  return (
    <>
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className={`${bgColor} w-full rounded-lg border py-4 pl-4 pr-5.5 dark:border-[#EA4E2C] dark:bg-[#1B1B24]`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-grow items-center gap-5">
              <div className={`flex h-15 w-full max-w-15 items-center justify-center rounded-[5px] ${type !== "success" ?'bg-red' :'bg-green-600' }`}>
                {type !== "success" ?( <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.75 13.0208C3.75 9.02384 3.75 7.02535 4.22189 6.35301C4.69379 5.68067 6.57291 5.03745 10.3311 3.75099L11.0472 3.5059C13.0062 2.8353 13.9858 2.5 15 2.5C16.0142 2.5 16.9938 2.8353 18.9528 3.5059L19.6689 3.75099C23.4271 5.03745 25.3062 5.68067 25.7781 6.35301C26.25 7.02535 26.25 9.02384 26.25 13.0208V14.9892C26.25 22.0368 20.9513 25.4569 17.6268 26.9091C16.725 27.303 16.2741 27.5 15 27.5C13.7259 27.5 13.275 27.303 12.3732 26.9091C9.0487 25.4569 3.75 22.0368 3.75 14.9892V13.0208ZM15 9.0625C15.5178 9.0625 15.9375 9.48223 15.9375 10V15C15.9375 15.5178 15.5178 15.9375 15 15.9375C14.4822 15.9375 14.0625 15.5178 14.0625 15V10C14.0625 9.48223 14.4822 9.0625 15 9.0625ZM15 20C15.6904 20 16.25 19.4404 16.25 18.75C16.25 18.0596 15.6904 17.5 15 17.5C14.3096 17.5 13.75 18.0596 13.75 18.75C13.75 19.4404 14.3096 20 15 20Z"
                    fill="white"
                  ></path>
                </svg>) :(
                  
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50">
                  <polygon fill="#2dea55" points="24.969,33.926 12.525,20.352 15.475,17.648 25.031,28.074 45.555,6.618 48.445,9.382"></polygon><path fill="#ffd217" d="M43.853,11.878l-3.031,2.652C42.82,17.536,44,21.128,44,25c0,10.477-8.523,19-19,19S6,35.477,6,25 S14.523,6,25,6c4.39,0,8.426,1.511,11.647,4.021l2.785-2.912C35.483,3.917,30.462,2,25,2C12.317,2,2,12.318,2,25s10.317,23,23,23 s23-10.318,23-23C48,20.121,46.456,15.604,43.853,11.878z"></path><path fill="#0cbc35" d="M42.367,9.951l-2.779,2.905c0.875,1.049,1.627,2.199,2.263,3.42l2.9-3.032 C44.052,12.076,43.254,10.974,42.367,9.951z"></path>
                  </svg>
                )}

              </div>
              <div>
                <h6 className="mb-0.5 text-md font-medium text-dark dark:text-[#EA4E2C]">
                  {message}
                </h6>
                {hreflink && <p className="text-body-sm font-medium">
                  <a href={hreflink} target='_blank' rel='noopener noreferrer' className='underline text-blue-500'>Learn More</a>
                </p> }
              </div>
            </div>
            <div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                }}
                className="flex text-red-light"
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0303 8.96965C9.73741 8.67676 9.26253 8.67676 8.96964 8.96965C8.67675 9.26255 8.67675 9.73742 8.96964 10.0303L10.9393 12L8.96966 13.9697C8.67677 14.2625 8.67677 14.7374 8.96966 15.0303C9.26255 15.3232 9.73743 15.3232 10.0303 15.0303L12 13.0607L13.9696 15.0303C14.2625 15.3232 14.7374 15.3232 15.0303 15.0303C15.3232 14.7374 15.3232 14.2625 15.0303 13.9696L13.0606 12L15.0303 10.0303C15.3232 9.73744 15.3232 9.26257 15.0303 8.96968C14.7374 8.67678 14.2625 8.67678 13.9696 8.96968L12 10.9393L10.0303 8.96965Z"
                    fill=""
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                    fill=""
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const showCustomToast = (message, type , link ) => {
  toast.custom((t) => <CustomToast t={t} message={message} type={type} link={link} />, {});
};
