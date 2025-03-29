import { Categories } from '@/components/meditation/Categories';

export default function MeditationPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          Spiritual Guidance & Support
        </h1>
        <p className="text-center text-lg mb-12 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Connect with Reverend Fathers for spiritual guidance, prayer requests, and personal counseling in a private and secure environment.
        </p>
        <Categories />
      </div>
    </div>
  );
}