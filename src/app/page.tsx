import HeroSection from "@/components/hero";
import { OurPartnersSection } from "@/components/our-partners";
import { Separator } from "@/components/ui/separator";
import { UpcomingEventsSection } from "@/components/upcoming-event";
import { WhatWeOfferSection } from "@/components/what-we-offer";

export default function Home() {
	const partnerLogos = [
		"/Partners/Finam.png",
		"/Partners/foicdt.png",
		"/Partners/UILO.png",
	];

	const sponsorLogos = [
		"/Sponsors/Aberdeen.png",
		"/Sponsors/accenture_marketing_logo white.png",
		"/Sponsors/accenture_marketing_logo.png",
		"/Sponsors/Emtel_Logo.png",
		"/Sponsors/mu-swan-logo.webp",
	];

	return (
		<>
			<HeroSection />
			<Separator className="my-10" />
			<WhatWeOfferSection />
			<Separator className="my-10" />
			<UpcomingEventsSection />
			<Separator className="my-10" />
			<OurPartnersSection />
		</>
	);
}
