import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export function FAQSection() {
  return (
    <section className="mb-10 flex justify-center w-full">
      <div className="w-full">
        <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-2 max-w-xl mx-auto text-lg text-muted-foreground">
            Find answers to common questions about the UoM AppCup 2024.
          </p>
        </div>
        <Card className="shadow-lg border border-border bg-background/80 p-0">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-6">Venue & Date</AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-base">
                The ancient arena of the Paul Octave Wiehe Auditorium, hidden within the mystical grounds of the University of Mauritius, shall once again open its gates.

From the 19th to the 21st of August, 2025, the Great Coding Dojo will commence—a battle of minds, magic, and might, where only the boldest will rise..  Destiny awaits. Will you answer the call?
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="px-6">Participation Requirements</AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-base">
                  Students from across universities in Mauritius are eligible to participate in the hackathon. Each team must consist of 3-5 participants.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="px-6">Workshops</AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-base">
                  By participating in the UoM AppCup, you will also be provided with workshops focusing on the front-end and back-end of mobile app development.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="px-6">Theme</AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-base">
                  The aim of the UoM AppCup 2024 is for participants to produce a mobile application while implementing an element of AI under the theme: Innovation in Medicine and Accessibility.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="px-6">Cash Prizes</AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-base">
                  Compete for the top three spots and win Rs 50,000 for 1st place, Rs 30,000 for 2nd place, and Rs 20,000 for 3rd place. Additionally, enjoy free food, expand your network, and receive exciting goodies.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className="px-6">Judging Criteria</AccordionTrigger>
                <AccordionContent className="px-6 text-base">
                  Our esteemed jury panel will judge your apps based on the front-end, back-end and the implementation of AI in your app. An additional judge&apos;s requirement will be announced on the first day of the competition.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
} 