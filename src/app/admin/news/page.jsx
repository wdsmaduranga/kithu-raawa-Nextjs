'use client'
import { Mail } from "lucide-react";
import { Suspense, useState } from "react";
// import PlateEditor from '@/components/custom-editor'
import QuillEditor from '@/components/quilEditor'
export default function AdminNewsPage() {
        const [email, setEmail] = useState("");
        const handleChange = (value) => {
            console.log('Editor content:', value);
          };
       const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
              const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
              const response = await fetch(`${baseUrl}/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
              });
              if (!response.ok) {
                setLoading(false);
                // Handle HTTP errors (e.g., 401, 500)
                // throw new Error(`HTTP error! Status: ${response.status}`);
              }
              const data = await response.json(); // Parse the JSON response
              if (response.ok) {
                setCookie("token", data.authtoken, { maxAge: 60 * 60 * 24 * 7 });
                // router.push("/dashboard");
              } else {
                setLoading(false);
              }
            } catch (err) {
              setLoading(false);
              console.error("An error occurred:", err);
              setError("Something went wrong. Please try again later.");
            }
          };
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3">
          <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-full w-full space-y-4 bg-white p-6 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="mt-4 space-y-6" >
          <div className="form-group relative">
            <label htmlFor="email" className="font-medium leading-5 text-regular-grey-10 mb-2 block text-sm">
            Post Title
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="pl-5 appearance-none relative block w-full py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-1 sm:text-sm"
              placeholder="Post Title"
            />
          </div>
          <div className="form-group relative">
            <label htmlFor="email" className="mb-2">
            Post Category
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="pl-5 appearance-none relative block w-full py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-1 sm:text-sm"
              placeholder="Post Title"
            />
          </div>
          {/* <PlateEditor /> */}
{/* <QuillEditor/> */}
          </form>
            </div>
            </div>
          </div>
          <div className="col-span-2">
          {/* <PlateEditor onChange={handleChange} /> */}

          </div>
        </div>
      </Suspense>
    </>
  );
}
