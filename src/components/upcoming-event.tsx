"use client";
import Image from "next/image";
import { NeonGradientCard } from "./magicui/neon-gradient-card";
import dynamic from "next/dynamic";
const RegistrationForm = dynamic(
  () =>
    import("./upcoming-event/RegistrationForm").then(
      (mod) => mod.RegistrationForm,
    ),
  { ssr: false },
);
import { Calendar, MapPin, Clock, Info } from "lucide-react";
import { Marquee } from "./magicui/marquee";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
  const eventStart = new Date("2025-08-19T09:09:00");
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>(() => {
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
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Upcoming Event</h2>
        <p className="mt-2 dark:text-gray-300 text-gray-600 max-w-xl mx-auto text-lg">
          Do not miss out on our next exciting event! Register now to secure
          your spot.
        </p>
      </div>

      <NeonGradientCard neonColors={neonColor}>
        <div className="flex flex-col md:flex-row w-full">
          <div className="w-full md:w-1/2">
            <Image
              src="/PosterWEb.png"
              alt="CC Event Poster"
              width={800}
              height={600}
              className="object-cover w-full h-full rounded-lg outline-2 outline-red-500"
              priority
            />
          </div>

          <div className="w-full md:w-1/2 px-2 mt-4 md:mt-0 sm:px-6 flex flex-col justify-between">
            <div>
              {/* Beautiful Countdown Timer (md and up only) */}
              <div className="hidden md:flex flex-col items-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-400 shadow-lg mb-2">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold text-base tracking-wide">
                    Countdown to Event
                  </span>
                </div>
                <div className="flex gap-4 bg-white/80 dark:bg-neutral-900/80 rounded-xl px-6 py-3 shadow">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {timeLeft.days}
                    </span>
                    <span className="text-xs uppercase text-gray-500 font-semibold">
                      Days
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {timeLeft.hours}
                    </span>
                    <span className="text-xs uppercase text-gray-500 font-semibold">
                      Hours
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {timeLeft.minutes}
                    </span>
                    <span className="text-xs uppercase text-gray-500 font-semibold">
                      Minutes
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {timeLeft.seconds}
                    </span>
                    <span className="text-xs uppercase text-gray-500 font-semibold">
                      Seconds
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-base md:text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4 mt-2 sm:mt-0">
                UoM AppCup 2025
              </h3>
              <p className="text-sm md:text-lg text-gray-800 dark:text-gray-100 mb-1 md:mb-2">
                A collaborative hackathon where participants harness AI agents
                to turn bold app ideas into reality.
              </p>
              <p className="text-sm md:text-lg text-gray-800 dark:text-gray-100 mb-1 md:mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2" /> Date: 19 to 21 August
              </p>
              <p className="text-sm md:text-lg text-gray-800 dark:text-gray-100 mb-1 md:mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2" /> Duration: 7 hours per day
              </p>
              <p className="text-sm md:text-lg text-gray-800 dark:text-gray-100 mb-1 md:mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2" /> Location: Paul Octave Wiehe
                Auditorium (POWA)
              </p>
              <p className="text-sm md:text-lg text-gray-800 dark:text-gray-100 flex items-center mb-1 md:mb-2">
                <Info className="w-5 h-5 mr-2" /> Submitted proposals will be
                shortlisted.
              </p>

              <div className="hidden md:block">
                <Marquee className="my-2 md:my-4">
                  <div className="flex items-center">
                    {sponsors.map((sponsor, index) => (
                      <div
                        key={sponsor.logo}
                        className={cn(
                          "bg-white rounded-lg p-2 shadow flex items-center justify-center w-40",
                          index !== 3 && "mr-4",
                        )}
                      >
                        <Image
                          src={sponsor.logo}
                          alt={sponsor.alt}
                          width={120}
                          height={60}
                          className="object-contain h-12 w-auto"
                        />
                      </div>
                    ))}
                  </div>
                </Marquee>
              </div>
            </div>
            {/* Compact Countdown for small screens */}
            <div className="block md:hidden w-full my-2">
              <div className="flex justify-center gap-2 bg-white/80 dark:bg-neutral-900/80 rounded px-2 py-1 shadow">
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] uppercase text-gray-500 font-semibold">
                    Days
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {timeLeft.hours}
                  </span>
                  <span className="text-[10px] uppercase text-gray-500 font-semibold">
                    Hrs
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {timeLeft.minutes}
                  </span>
                  <span className="text-[10px] uppercase text-gray-500 font-semibold">
                    Min
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {timeLeft.seconds}
                  </span>
                  <span className="text-[10px] uppercase text-gray-500 font-semibold">
                    Sec
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 md:mt-4 w-full">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </NeonGradientCard>
      {/* Marquee for small screens: below the card */}
      <div className="block md:hidden mt-4">
        <div className="text-center font-bold md:text-base mb-2">
          UoM Appcup 2025 sponsors
        </div>
        <Marquee>
          <div className="flex items-center">
                    {sponsors.map((sponsor, index) => (
                      <div
                        key={sponsor.logo}
                        className={cn(
                          "bg-white rounded-lg p-2 shadow flex items-center justify-center w-40",
                          index !== 3 && "mr-4",
                        )}
                      >
                        <Image
                          src={sponsor.logo}
                          alt={sponsor.alt}
                          width={120}
                          height={60}
                          className="object-contain h-12 w-auto"
                        />
                      </div>
                    ))}
          </div>
        </Marquee>
      </div>
    </div>
  );
}
