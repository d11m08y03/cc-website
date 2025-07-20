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
							className="object-cover w-full h-full"
							priority
						/>
					</div>

					<div className="w-full md:w-1/2 px-0 md:px-5 flex flex-col justify-between">
						<div>
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-4 sm:mt-0">
								UoM AppCup 2025
							</h3>
							<p className="text-gray-800 dark:text-gray-100 text-lg mb-2">
								A collaborative hackathon where participants harness AI agents
								to turn bold app ideas into reality.
							</p>
							<p className="text-gray-800 dark:text-gray-100 text-lg mb-2 flex items-center">
								<Calendar className="w-5 h-5 mr-2" /> Date: 19 to 21 August
							</p>
							<p className="text-gray-800 dark:text-gray-100 text-lg mb-2 flex items-center">
								<Clock className="w-5 h-5 mr-2" /> Duration: 7 hours per day
							</p>
							<p className="text-gray-800 dark:text-gray-100 text-lg mb-2 flex items-center">
								<MapPin className="w-5 h-5 mr-2" /> Location: Powa
							</p>
							<p className="text-gray-800 dark:text-gray-100 text-lg flex items-center">
								<Info className="w-5 h-5 mr-2" /> Submitted proposals will
								be shortlisted.
							</p>
						</div>
						<div className="mt-4 w-full">
							<RegistrationForm />
						</div>
					</div>
				</div>
			</NeonGradientCard>
		</div>
	);
}
