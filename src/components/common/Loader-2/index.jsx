import { CircularProgress } from "@nextui-org/react";

export default function Loader({ fullPage, visible }) {
  return (
    <>
      {visible && (
        <div className="">
          <div className={`${fullPage ? 'fixed' : 'absolute'}  top-0 left-0 right-0 bottom-0 bg-white dark:bg-dark opacity-70 z-[50]`}></div>
          <div className={`${fullPage ? 'fixed' : 'absolute'}  top-0 left-0 right-0 bottom-0 z-[50] flex items-center justify-center`}>
            <CircularProgress className="" />
          </div>
        </div>
      )}
    </>
  );
}
