"use client";
// import AlphyImage from "../public/img/ALPHY_BG_REMOVED_LIGHT.png";
// import OtherAlphyImage from "../public/img/ALPHY_BG_REMOVED_DARK.png";
import Image_1 from "../public/img/1.png";
import Image_2 from "../public/img/2.png";
import Image_3 from "../public/img/3.png";
import Image_4 from "../public/img/4.png";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

interface AlphyProps {
  name: string;
}

export default function Alphy({ name }: AlphyProps) {
  const images = [Image_1, Image_2, Image_3, Image_4];
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
    <div className="flex flex-col items-center">
      <p className="mt-5 mb-10 text-xl font-bold text-white">
        Unlock{" "}
        <span className="underline">
          &quot{name.length > 0 ? name : "your audio file"}&quot
        </span>{" "}
        with{" "}
        <a
          className="underline text-green-200"
          href="https://alphy.app/submit"
          target="_blank"
        >
          Alphy’s AI
        </a>
      </p>

      <div className="flex flex-col lg:flex-row ">
        <button
          onClick={scrollBackward}
          type="button"
          className={`left-arrow w-[20px] hidden md:block justify-center my-auto flex items-center justify-center h-full cursor-pointer group focus:outline-none bg-transparent outline-none border-0 focus:border-0 focus:ring-0 ${""}`}
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
                alt="Alphy logo"
                className={`${
                  index === slideIndex ? "flex" : "hidden"
                }  overflow-x-hidden border `}
                src={image}
              />
            </a>
          ))}
        </div>

        <button
          onClick={scrollForward}
          type="button"
          className={` right-arrow w-[20px]  hidden md:block my-auto flex items-center justify-center h-full cursor-pointer group focus:outline-none bg-transparent outline-none border-0 focus:border-0 focus:ring-0 ${""}`}
        >
          <div className="rounded-full p-1 hover:opacity-100 hover:transition hover:duration-300 hover:ease-in-out">
            <ArrowForwardIosIcon className="cursor-pointer text-white " />
          </div>
        </button>
      </div>
    </div>
  );
}
