import Image from "next/image";
import { TextAnimate } from "@/components/magicui/text-animate";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Image
        src="/CC-logo.png"
        alt="CC Logo"
        width={200}
        height={200}
        priority
        className="drop-shadow-lg dark:invert"
      />

      <TextAnimate
        className="text-3xl sm:text-5xl font-bold mt-12"
        animation="slideUp"
        by="word"
      >
        Welcome to the UoM Computer Club
      </TextAnimate>

      <TextAnimate
        className="text-lg mt-4 max-w-2xl"
        animation="slideUp"
        by="word"
      >
        Empowering students through technology, creativity, and community.
      </TextAnimate>

      <div className="flex gap-6 mt-8">
        <a
          href="https://www.facebook.com/ComputerClubMU"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook className="w-6 h-6 hover:text-blue-600 transition-colors" />
        </a>
        <a
          href="https://www.instagram.com/uom.computerclub/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram className="w-6 h-6 hover:text-pink-500 transition-colors" />
        </a>
        <a
          href="https://www.linkedin.com/company/uom-computer-club/posts/?feedView=all"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin className="w-6 h-6 hover:text-blue-700 transition-colors" />
        </a>
      </div>
    </div>
  );
}
