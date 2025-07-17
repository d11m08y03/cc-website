import Image from "next/image";
import { NeonGradientCard } from "./magicui/neon-gradient-card";

export function UpcomingEventsSection() {
  const neonColor = {
    firstColor: "#ff1a1a",
    secondColor: "#ff4d4d",
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Upcoming Event</h2>
        <p className="mt-2 dark:text-gray-300 text-gray-600 max-w-xl mx-auto text-lg">
          Don't miss out on our next exciting event! Register now to secure your
          spot.
        </p>
      </div>

      <NeonGradientCard className="p-0" neonColors={neonColor}>
        <div className="flex flex-col md:flex-row w-full">
          <div className="w-full md:w-1/2">
            <Image
              src="/PosterWEb.png"
              alt="CC Event Poster"
              width={800}
              height={600}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              UoM AppCup 2025
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A collaborative hackathon where participants harness AI agents to
              turn bold app ideas into reality
            </p>
            <button className="mt-2 w-max bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded shadow">
              Register Now
            </button>
          </div>
        </div>
      </NeonGradientCard>
    </div>
  );
}
