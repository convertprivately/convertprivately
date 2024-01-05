import LockIcon from "@mui/icons-material/Lock";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GitHubIcon from "@mui/icons-material/GitHub";

export function Explainer() {
  return (
    <div className="flex flex-col  mx-auto max-w-[900px] pb-20 sm:px-6 lg:px-0 mt-20">
      <div className="flex flex-col  p-4">
        <p className="mt-4 text-lg font-bold text-zinc-300 ">
          What is ConvertPrivately and how does it work?
        </p>
        <p className="mt-4 text-sm text-zinc-300 ">
          Conversion is a fairly simple process. You can do it directly within your browser, with no need to upload files to a server or install additional software. <br /><br /><span className="font-semibold">ConvertPrivately</span> is a completely free audio and video conversion tool that uses FFMPEG to convert files using browser resources, assuring convenience and privacy.
        </p>

      </div>
      <div className="flex flex-col sm:flex-row justify-between max-w-screen-lg mx-auto sm:my-8">
        {/* Single Feature */}
        <div className="flex flex-col p-4  sm:w-1/2">
          <div className="flex flex-row text-center items-center">
            <LockIcon className="text-white" />

            <h2 className="font-bold text-lg ml-4 text-white">Private</h2>
          </div>
          <p className="mt-4 text-sm text-zinc-300 ">
            What you upload to ConvertPrivately is between you and your browser. We do not
            see or store your files. Your data stays yours.{" "}
          </p>
        </div>

        {/* Duplicate the above block for each feature */}
        <div className="flex flex-col p-4  sm:w-1/2 sm:ml-5">
          <div className="flex flex-row text-center items-center">
            <RocketLaunchIcon className="text-white" />

            <h2 className="font-bold text-lg sm:ml-4 text-white">Fast</h2>
          </div>
          <p className="mt-4 text-sm text-zinc-300">
            Local processing means no back and forth with servers, which makes
            the conversion process much faster.{" "}
          </p>
        </div>
      </div>

      <div className="flex flex-col  sm:flex-row justify-between max-w-screen-lg mx-auto sm:my-8">
        {/* Single Feature */}
        <div className="flex flex-col p-4 col-span-1 sm:w-1/2">
          <div className="flex flex-row text-center items-center">
            <CheckCircleIcon className="text-white" />

            <h2 className="font-bold text-lg ml-4 text-white">Free</h2>
          </div>
          <p className="mt-4 text-sm text-zinc-300">
            ConvertPrivately is a free tool. We do not charge for conversions and we
            don’t have any ads.{" "}
          </p>
        </div>

        {/* Duplicate the above block for each feature */}
        <div className="flex flex-col p-4 col-span-1 sm:w-1/2 sm:ml-5">
          <div className="flex flex-row text-center items-center">
            <GitHubIcon className="text-white" />

            <h2 className="font-bold text-lg sm:ml-4 text-white">Open Source</h2>
          </div>
          <p className="mt-4 text-sm text-zinc-300">
            The software behind ConvertPrivately is open source. You can check
            the GitHub page <a href="https://github.com/convertprivately/convertprivately" target="_blank" className="underline cursor-pointer">here</a>.{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
