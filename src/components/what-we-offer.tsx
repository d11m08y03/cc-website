import { Calendar, Lightbulb, LucideIcon, Users } from "lucide-react";
import { NeonGradientCard } from "./magicui/neon-gradient-card";

type OffersCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: "blue" | "green" | "purple";
};

const tailwindColorClassMap: Record<OffersCardProps["iconColor"], string> = {
  blue: "text-blue-500",
  green: "text-green-500",
  purple: "text-purple-500",
};

const neonColorMap: Record<OffersCardProps["iconColor"], string> = {
  blue: "#00bfff",
  green: "#00ff99",
  purple: "#cc66ff",
};

// Constant reddish-pink neon base
const reddishBase = "#ff2d55";

function OfferCard({
  icon: Icon,
  title,
  description,
  iconColor,
}: OffersCardProps) {
  const neonColor = {
    firstColor: reddishBase,
    secondColor: neonColorMap[iconColor],
  };

  return (
    <NeonGradientCard neonColors={neonColor}>
      <div className="p-0">
        <Icon
          className={`${tailwindColorClassMap[iconColor]} mb-4`}
          size={36}
        />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </NeonGradientCard>
  );
}

export function WhatWeOfferSection() {
  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">What We Offer</h2>
        <p className="mt-2 dark:text-gray-300 text-gray-600 max-w-xl mx-auto text-lg">
          Unlock opportunities to grow, connect, and build with our diverse
          range of events and initiatives designed for students like you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        <OfferCard
          icon={Lightbulb}
          title="Workshops"
          description="Hands-on sessions to learn new tech skills and tools."
          iconColor="blue"
        />

        <OfferCard
          icon={Calendar}
          title="Hackathons"
          description="Collaborative coding events to solve real-world problems."
          iconColor="green"
        />

        <OfferCard
          icon={Users}
          title="Networking"
          description="Meet peers, mentors, and industry professionals."
          iconColor="purple"
        />
      </div>
    </div>
  );
}
