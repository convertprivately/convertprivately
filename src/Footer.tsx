import Image from "next/image";
import Alphy from "../public/img/alphy_bgremoved_light.png";

export function Footer() {
  return (
    <div className="bg-zinc-900 h-[175px] flex flex-row w-full pt-10 mx-auto ">
      <div className=" max-w-[900px] mx-auto w-full flex flex-row justify-between px-10">
        <div className="flex flex-col">
          <a href="https://alphy.app" target="_blank">
            <div className="flex flex-row">
              <p className="text-zinc-100 font-semibold text-l">Powered by</p>
              <div className="flex flex-row ml-1">
                <Image
                  width={30}
                  alt="Alphy logo"
                  className="mx-1"
                  src={Alphy}
                />
                <p className="text-zinc-100 font-semibold text-l">ALPHY</p>
              </div>
            </div>
          </a>
          <p className="text-zinc-400 text-xs mt-2">
            For any further questions, reach us at{" "}
            <a
              className="underline text-primaryColor"
              href="mailto:support@alphy.app"
            >
              support@alphy.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
