import HeroSection from "@/components/hero";
import { OurPartnersSection } from "@/components/our-partners";
import { Separator } from "@/components/ui/separator";
import { UpcomingEventsSection } from "@/components/upcoming-event";
import { WhatWeOfferSection } from "@/components/what-we-offer";

export default function Home() {
	

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
