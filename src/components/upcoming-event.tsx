'use client'
import Image from "next/image";
import { NeonGradientCard } from "./magicui/neon-gradient-card";
import { RegistrationForm } from "./upcoming-event/RegistrationForm";
import { Calendar, MapPin, Clock, Info } from "lucide-react";
import { Marquee } from "./magicui/marquee";
import { useEffect, useState } from "react";

export function UpcomingEventsSection() {
  const neonColor = {
    firstColor: "#ff1a1a",
    secondColor: "#ff4d4d",
  };

  const sponsors = [
    { logo: "/Sponsors/Aberdeen.png", alt: "Aberdeen" },
    { logo: "/Sponsors/accenture_marketing_logo.png", alt: "Accenture" },
    { logo: "/Sponsors/Emtel_Logo.png", alt: "Emtel" },
    { logo: "/Sponsors/mu-swan-logo.webp", alt: "MU Swan" },
  ];

  // Countdown timer logic
  const eventStart = new Date("2025-08-19T09:00:00");
  const [timeLeft, setTimeLeft] = useState<{days:number, hours:number, minutes:number, seconds:number}>(() => {
    const diff = eventStart.getTime() - Date.now();
    return getTimeLeft(diff);
  });

  function getTimeLeft(diff: number) {
    let total = Math.max(diff, 0);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    total -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(total / (1000 * 60 * 60));
    total -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(total / (1000 * 60));
    total -= minutes * 1000 * 60;
    const seconds = Math.floor(total / 1000);
    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = eventStart.getTime() - Date.now();
      setTimeLeft(getTimeLeft(diff));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Upcoming Event</h2>
        <p className="mt-2 dark:text-gray-300 text-gray-600 max-w-xl mx-auto text-lg">
          Do not miss out on our next exciting event! Register now to secure your
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
              className="object-cover w-full h-40 sm:h-64 md:h-full"
              priority
            />
          </div>
          <div className="w-full md:w-1/2 px-2 sm:px-5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                UoM AppCup 2025
              </h3>
              {/* Countdown Timer */}
              <div className="mb-4 flex flex-wrap gap-2 items-center justify-start text-base sm:text-lg font-mono hidden md:flex">
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 font-bold text-red-600">{timeLeft.days}d</span>
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 font-bold text-red-600">{timeLeft.hours}h</span>
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 font-bold text-red-600">{timeLeft.minutes}m</span>
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 font-bold text-red-600">{timeLeft.seconds}s</span>
                <span className="ml-2 text-gray-500 text-xs sm:text-base font-normal">until start</span>
              </div>
              <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 mb-2">
                A collaborative hackathon where participants harness AI agents
                to turn bold app ideas into reality.
              </p>
              <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2" /> Date: 19 to 21 August
              </p>
              <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2" /> Duration: 7 hours per day
              </p>
              <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" /> Location: Powa
              </p>
              <p className="text-xs sm:text-base text-gray-800 dark:text-gray-100 italic flex items-center">
                <Info className="w-5 h-5 mr-2" /> Note: Submitted proposals will be shortlisted.
              </p>
              {/* Marquee for md+ only (inside card) */}
              <div className="my-6 hidden md:block">
                <Marquee pauseOnHover className="rounded-xl py-4 shadow-inner backdrop-blur-md flex items-center">
                  {sponsors.map((sponsor) => (
                    <div
                      key={sponsor.logo}
                      className="relative bg-white/90 p-3 rounded-2xl mx-4 flex items-center justify-center h-20 w-[180px] border-2 border-transparent transition-all duration-200 hover:border-red-500 hover:shadow-[0_0_12px_2px_rgba(255,26,26,0.7)]"
                    >
                      <Image src={sponsor.logo} alt={sponsor.alt} width={130} height={56} className="h-16 w-auto object-contain" />
                    </div>
                  ))}
                </Marquee>
              </div>
            </div>
            <div className="mt-4 w-full">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </NeonGradientCard>

      {/* Marquee for mobile only (below card) */}
      <div className="block md:hidden mt-6">
        <h4 className="text-center text-lg font-semibold mb-2">UoM AppCup 2025 sponsors</h4>
        <Marquee pauseOnHover className="rounded-xl py-2 shadow-inner backdrop-blur-md flex items-center">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.logo}
              className="relative bg-white/90 p-2 rounded-2xl mx-2 flex items-center justify-center h-14 w-[110px] border-2 border-transparent transition-all duration-200 hover:border-red-500 hover:shadow-[0_0_12px_2px_rgba(255,26,26,0.7)]"
            >
              <Image src={sponsor.logo} alt={sponsor.alt} width={90} height={40} className="h-10 w-auto object-contain" />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
