import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="w-full mt-16 border-t bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} Computer Club. All rights reserved.</div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Contact:</span>
          <a href="tel:+23054293085" className="hover:underline text-blue-600 dark:text-blue-400">5429 3085</a>
          <span>|</span>
          <a href="tel:+23058375642" className="hover:underline text-blue-600 dark:text-blue-400">5837 5642</a>
        </div>
        <div className="flex gap-4">
          {/* Replace # with actual links */}
          <a href="https://www.instagram.com/uom.computerclub/" className="hover:underline text-muted-foreground">Instagram</a>
          <a href="https://www.facebook.com/ComputerClubMU" className="hover:underline text-muted-foreground">Facebook</a>
          <a href="mailto:uomcomputerclub25@gmail.com" className="hover:underline text-muted-foreground">Email</a>
        </div>
      </div>
      <Separator />
    </footer>
  );
} 
