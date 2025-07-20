import Image from "next/image";
import { NeonGradientCard } from "./magicui/neon-gradient-card";

type PartnerCardProps = {
  logoSrc: string;
  altText: string;
  neonColors: { firstColor: string; secondColor: string };
};

export function PartnerCard({
  logoSrc,
  altText,
  neonColors,
}: PartnerCardProps) {
  return (
    <NeonGradientCard
      neonColors={neonColors}
      className="flex items-center justify-center"
    >
      <div className="flex items-center justify-center w-full h-40 bg-white rounded-2xl">
        <Image
          src={logoSrc}
          alt={altText}
          width={150}
          height={150}
          className="object-contain"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
          priority
        />
      </div>
    </NeonGradientCard>
  );
}

export function OurPartnersSection() {
  const neonColorsList = [
    { firstColor: "#ff2d55", secondColor: "#00bfff" },
    { firstColor: "#ff4d4d", secondColor: "#ff4d4d" },
    { firstColor: "#ff2d55", secondColor: "#cc66ff" },
  ];

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Our Partners</h2>
        <p className="mt-2 max-w-xl mx-auto text-lg">
          We are proud to partner with these organisations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        <PartnerCard
          logoSrc="/Partners/Finam.png"
          altText="Finam"
          neonColors={neonColorsList[0]}
        />
        <PartnerCard
          logoSrc="/Partners/foicdt.png"
          altText="Partner 2"
          neonColors={neonColorsList[1]}
        />
        <PartnerCard
          logoSrc="/Partners/UILO.png"
          altText="Partner 3"
          neonColors={neonColorsList[2]}
        />
      </div>
    </div>
  );
}
