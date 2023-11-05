"use client";
// import AlphyImage from "../public/img/ALPHY_BG_REMOVED_LIGHT.png";
// import OtherAlphyImage from "../public/img/ALPHY_BG_REMOVED_DARK.png";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

interface AlphyProps {
  name: string;
}

export default function Alphy({ name }: AlphyProps) {
  const images = [
    {
      url: "/img/1.png",
      alt: "Transcribe, summarize and ask questions to your audio files",
    },
    {
      url: "/img/2.png",
      alt: "High quality transcription in more than 50 languages",
    },
    {
      url: "/img/3.png",
      alt: "Ask questions to your audio files and get timestamped answers",
    },
    {
      url: "/img/4.png",
      alt: "Lectures, meetings, interviews, podcasts... Unlock the power of audio with AI",
    },
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const carouselRef = useRef(null);

  const scrollForward = () => {
    if (slideIndex === images.length - 1) {
      setSlideIndex(0);
    } else {
      setSlideIndex(slideIndex + 1);
    }
  };

  const scrollBackward = () => {
    if (slideIndex === 0) {
      setSlideIndex(images.length - 1);
    } else {
      setSlideIndex(slideIndex - 1);
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <p className="mt-5 mb-10 text-xl font-bold text-white">
        Use{" "}
        <a
          className="underline text-green-200"
          href="https://alphy.app/submit"
          target="_blank"
        >
          Alphy’s AI
        </a>{" "}
        on{" "}
        <span className="underline">
          {name.length > 0 ? name : "your audio file"}
        </span>{" "}
      </p>

      <div className="flex flex-col lg:flex-row ">
        <button
          onClick={scrollBackward}
          type="button"
          className={`left-arrow w-[20px] justify-center my-auto flex items-center justify-center h-full cursor-pointer group focus:outline-none bg-transparent outline-none border-0 focus:border-0 focus:ring-0 ${""}`}
        >
          <div className="rounded-full  p-1 mr-2  hover:opacity-100 hover:transition hover:duration-300 hover:ease-in-out">
            <ArrowBackIosNewIcon className="cursor-pointer text-white  " />
          </div>
        </button>

        <div
          className={`   flex  flex-row items-center overflow-x-scroll scroll-smooth carousel-area pl-6 pr-2 `}
          ref={carouselRef}
        >
          {images.map((image, index) => (
            <a key={index} href="https://alphy.app" target="_blank">
              <Image
                width={1600}
                height={900}
                alt={image.alt}
                className={`${
                  index === slideIndex ? "flex" : "hidden"
                }  overflow-x-hidden border `}
                src={image.url}
                priority // preload
              />
            </a>
          ))}
        </div>

        <button
          onClick={scrollForward}
          type="button"
          className={` right-arrow w-[20px]   my-auto flex items-center justify-center h-full cursor-pointer group focus:outline-none bg-transparent outline-none border-0 focus:border-0 focus:ring-0 ${""}`}
        >
          <div className="rounded-full p-1 hover:opacity-100 hover:transition hover:duration-300 hover:ease-in-out">
            <ArrowForwardIosIcon className="cursor-pointer text-white " />
          </div>
        </button>
      </div>
    </div>
  );
}
