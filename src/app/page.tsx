"use client";

import { Extraction, FFmpegWrapper, ProgressCallback } from "@/FFmpegWrapper";
import {
  audioFormatToFileType,
  durationStringToMicroseconds,
  microsecondsToString,
} from "@/utils";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import ClearIcon from "@mui/icons-material/Clear";
import { Explainer } from "@/Explainer";
import Alphy from "@/Alphy";
import SettingsIcon from "@mui/icons-material/Settings";
interface Progress {
  progress: number;
  microseconds: number;
}

export default function Audio() {
  const ffmpeg = useRef<FFmpegWrapper | null>(null);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | "">("");
  const extraction = useRef<Extraction | null>(null);
  const [extractionReady, setExtractionReady] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [outputFormat, setOutputFormat] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supportedFormats = useRef<Set<string> | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [value, setValue] = useState<number[]>([0, 100]);
  const [valueText, setValueText] = useState<string[]>(["", ""]);
  const [startTimeInput, setStartTimeInput] = useState<string>("");
  const [endTimeInput, setEndTimeInput] = useState<string>("");
  const [showAdvancedOptions, setShowAdvancedOptions] =
    useState<boolean>(false);
  const [originalOutputformat, setOriginalOutputFormat] = useState<string>("");
  const [originalFileType, setOriginalFileType] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isAudioFile, setIsAudioFile] = useState<boolean>(false);




  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const f = async () => {
      ffmpeg.current = await FFmpegWrapper.create();
      setFFmpegLoaded(true);
      console.log("FFmpeg loaded");
      const formats = await ffmpeg.current!.supportedFormats();
      supportedFormats.current = formats;
      console.log("FORMATS: ", formats); 
    };
    f();
  }, []);

  useEffect(() => {
    if (!ffmpegLoaded) return;
    if (!uploadFile) return;
    const f = async () => {
      if (extraction.current) {
        await extraction.current.delete();
        console.log("Extraction deleted");
        setExtractionReady(false);
      }
      extraction.current = await Extraction.create(ffmpeg.current!, uploadFile);
      // This can be used to set the output format in the select box as well.
      const metadata = await extraction.current.audioMetadata();
      if(!isAudioFile){
      
        const format = metadata.format.replace(/,$/, '');
        
        setOriginalOutputFormat(format);
        setOutputFormat(format);
        
      }
      else{
        setOutputFormat("mp3");
      }
      setDuration(metadata.duration);
      setStartTimeInput("00:00:00");
      setEndTimeInput(microsecondsToString(metadata.duration));

      

      setExtractionReady(true);
      console.log("Audio duration: " + microsecondsToString(metadata.duration));

      console.log("Extraction created");
      /* setUploadFile(null); */
    };
    f();
  }, [ffmpegLoaded, uploadFile]);

  function getFileType(filename: string): string | null {
    // Find the last occurrence of the dot
    const lastDotIndex = filename.lastIndexOf(".");

    // Check if the dot is in a valid position to represent a file extension
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return null; // No extension found
    }

    // Extract the file type
    const fileType = filename.substring(lastDotIndex + 1);
    return fileType;
  }

  
  const handleFileUploadThroughDrop = async (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    setError("");
    setSuccess(false);
    let file;

    if (e.dataTransfer.files && e.dataTransfer.files.length === 1) {
      file = e.dataTransfer.files[0];
      const fileType = getFileType(file.name);
      setOriginalFileType(fileType);
      
              if (
                fileType === "mp3" ||
                fileType === "ogg" ||
                fileType === "wav" ||
                fileType === "aac" ||
                fileType === "flac" ||
                fileType === "m4a" ||
                fileType === "opus" ||
                fileType === "ac3"
              ) {
                setIsAudioFile(true);
                setShowAdvancedOptions(true);
              }
              else{
                setIsAudioFile(false);
                setShowAdvancedOptions(false);
              }
      setUploadFile(file);
      setUploadFileName(file.name);
    } else {
      setUploadFile(null);
      setUploadFileName("");
      if (extraction.current) {
        await extraction.current.delete();
        extraction.current = null;
        setExtractionReady(false);
      }
      setProgress(null);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    setSuccess(false);
    setError("");

    if (e.target.files && e.target.files.length === 1) {
      let file;

      file = e.target.files[0];
      const fileType = getFileType(file.name);
      
      
          setOriginalFileType(fileType)
      
      
      if (
        fileType === "mp3" ||
        fileType === "ogg" ||
        fileType === "wav" ||
        fileType === "aac" ||
        fileType === "flac" ||
        fileType === "m4a" ||
        fileType === "opus" ||
        fileType === "ac3"
      ) {
        setIsAudioFile(true);
        setShowAdvancedOptions(true);
      }
      else{
        setIsAudioFile(false);
        setShowAdvancedOptions(false);
      }

      setUploadFile(file);
      setUploadFileName(file.name);
      setOriginalFileType(getFileType(file.name));
    } else {
      setUploadFile(null);
      setUploadFileName("");
      if (extraction.current) {
        await extraction.current.delete();
        extraction.current = null;
        setExtractionReady(false);
      }
      setProgress(null);
    }
  };

  const progressCallback: ProgressCallback = ({ progress, time }) => {
    setProgress({ progress, microseconds: time });
  };

  const extractAndDownloadAudio = async () => {
    if (extraction.current && outputFormat) {
     
      if ((originalOutputformat === outputFormat) && isAudioFile) {
        
        setError("Please select a different output format");
        return;
      }
      setError("");
      setProgress({ progress: 0, microseconds: 0 });
      
      const namedPayload = await extraction.current.extractAudio({
        format: outputFormat,
        start: (duration * value[0]) / 100,
        end: (duration * value[1]) / 100,
        progressCallback: progressCallback,
      });
      const blob = new Blob([namedPayload.payload], {
        type: audioFormatToFileType(namedPayload.format),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = namedPayload.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExtractionReady(false);
      setProgress(null);
      setSuccess(true);
    } else {
      console.error("extraction is not ready yet");
    }
  };

  // These can be anything FFMpeg supports
  // Maybe give as a textbox to cover all that is possible?
  const outputFormatOptions = [
    "mp3",
    "ogg",
    "wav",
    "aac",
    "flac",
    "m4a",
    "opus",
    "ac3",
  ];
  const onOutputFormatChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value;
    if (format === "") {
      setOutputFormat(null);
    } else {
      setOutputFormat(format);
    }
  };
  const [isDragging, setIsDragging] = useState(false);

  const dragOverHandler = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const dragEnterHandler = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const dragLeaveHandler = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const dropHandler = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    // Process dropped files...
    let files = e.dataTransfer.files;
    if (files.length > 1) {
      alert("Please drop only one file");
      return;
    } else {
      handleFileUploadThroughDrop(e);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBlurStart = (event: React.FocusEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Check if the current value matches the format "hh:mm:ss"
    if (!/^\d{2}:\d{2}:\d{2}$/.test(newValue)) {
      setStartTimeInput(microsecondsToString((value[0] * duration) / 100));
      return;
    } else {
      // Parse the timestamp
      const [hours, minutes, seconds] = newValue.split(":").map(Number);
      const [hoursEnd, minutesEnd, secondsEnd] = endTimeInput
        .split(":")
        .map(Number);
      const [hoursStart, minutesStart, secondsStart] = newValue
        .split(":")
        .map(Number);

      // Convert to microseconds
      const microseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1e6;
      const microsecondsEnd =
        (hoursEnd * 60 * 60 + minutesEnd * 60 + secondsEnd) * 1e6;
      const microsecondsStart =
        (hoursStart * 60 * 60 + minutesStart * 60 + secondsStart) * 1e6;

      if (microseconds > duration) {
        setValue([100, 100]);
        setStartTimeInput(microsecondsToString(duration));
      }

      if (microseconds > microsecondsEnd) {
        setStartTimeInput(microsecondsToString(microsecondsEnd));

        setValue([value[1], value[1]]);
      } else {
        setValue([(microseconds / duration) * 100, value[1]]);
        setStartTimeInput(microsecondsToString(microseconds));
      }
    }
    // Here you can handle the microseconds further as needed
  };
  const handleBlurEnd = (event: React.FocusEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Check if the current value matches the format "hh:mm:ss"
    if (!/^\d{2}:\d{2}:\d{2}$/.test(newValue)) {
      setEndTimeInput(microsecondsToString((value[1] * duration) / 100));
      return;
    } else {
      // Parse the timestamp
      const [hours, minutes, seconds] = newValue.split(":").map(Number);
      const [hoursEnd, minutesEnd, secondsEnd] = endTimeInput
        .split(":")
        .map(Number);
      const [hoursStart, minutesStart, secondsStart] = newValue
        .split(":")
        .map(Number);

      // Convert to microseconds
      const microseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1e6;
      const microsecondsEnd =
        (hoursEnd * 60 * 60 + minutesEnd * 60 + secondsEnd) * 1e6;
      const microsecondsStart =
        (hoursStart * 60 * 60 + minutesStart * 60 + secondsStart) * 1e6;

      if (microseconds > duration) {
        setValue([100, 100]);
        setEndTimeInput(microsecondsToString(duration));
      }

      if (microseconds < microsecondsStart) {
        setEndTimeInput(microsecondsToString(microsecondsStart));

        setValue([value[0], value[0]]);
      } else {
        setValue([value[0], (microseconds / duration) * 100]);
        setEndTimeInput(microsecondsToString(microseconds));
      }
    }
    // Here you can handle the microseconds further as needed
  };

  const handleEndInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndTimeInput(event.target.value);
  };

  const handleStartInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartTimeInput(event.target.value);
  };


/* 
  const handleTimeIntervalSet = (event: any, newValue: number[]) => {
    setValue(newValue);

    setValueText([
      microsecondsToString((newValue[0] * duration) / 100),
      microsecondsToString((newValue[1] * duration) / 100),
    ]);
    setStartTimeInput(microsecondsToString((newValue[0] * duration) / 100));
    setEndTimeInput(microsecondsToString((newValue[1] * duration) / 100));
  }; */


  const handleReset = () => {
    setUploadFile(null);
    setSuccess(false);
    setProgress(null);
    setError("");
  }
  return (
    <div className={`max-w-[900px] mx-auto w-full px-10 lg:px-6`}>
      {!success && !uploadFile && (
        <div>
       <div className="flex flex-row gap-6 ">
        <p className="mb-4 text-2xl   font-semibold text-white">
        <span className="text-blue-300  text-3xl">AUDIO</span> AND <span className="text-blue-300  text-3xl">VIDEO</span> CONVERTER
        </p>
{/*         <p className="mb-4 text-2xl   font-semibold text-white">
        VIDEO to AUDIO
        </p> */}
        </div>
        <p className="mb-4 text-md   text-white">
        Convert VIDEO ={`>`} AUDIO and AUDIO ={`>`} AUDIO on your browser,
          for free.
        </p>
        </div>
      )}

      <div className={`mb-6 ${!success && !uploadFile && "mt-8"}`}>
        <div
          className={`lg:min-w-[400px] min-h-[250px] h-300 m-auto rounded-lg border-dashed ${
            isDragging
              ? "border-2 border-blue-200"
              : "border-[2px] border-blue-800"
          } ${
            uploadFile === null
              ? "flex justify-center items-center cursor-pointer"
              : "hidden"
          } ${isDragging ? "" : "bg-blue-200 opacity-80"} text-black`}
          onDragOver={dragOverHandler}
          onDragEnter={dragEnterHandler}
          onDragLeave={dragLeaveHandler}
          onDrop={dropHandler}
          onClick={handleClick}
        >
          <p className="text-center text-gray-700 flex flex-col items-center">
            <VideoFileIcon
              fontSize="large"
              className="opacity-60 text-zinc-600 mb-2"
            />
            {isDragging ? (
              "Release to Drop"
            ) : (
              <div className="text-center text-gray-700 flex flex-col items-center">
                Drag & Drop an AUDIO or VIDEO file here
                <br />
                {/*                 <p className="text-xs text-gray-700">MP4, MKV, WEBM</p> */}
              </div>
            )}
          </p>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            id="upload"
            name="Upload"
            accept=".mp4, .mkv, .webm, .mp3, .mpeg,.ogg,.wav,.aac,.flac,.m4a,.opus,.ac3"
            onChange={handleFileUpload}
          />
        </div>

        <div
          className={`${
            uploadFile || success
              ? "flex flex-col mx-auto justify-center "
              : "hidden"
          }`}
        >
          <div
            className={` ${
              success ? "hidden" : "flex flex-row justify-between"
            }`}
          >
            <p className="text-white text-xl font-semibold ">
              {uploadFileName.length > 0 ? uploadFileName : "Your File"}{" "}
              <ClearIcon
                onClick={() => setUploadFile(null)}
                fontSize="small"
                className="ml-4 mb-1 cursor-pointer"
              />
            </p>
          </div>

          {!success && !progress && (
            <div
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className={`max-w-[200px] flex flex-row gap-4 my-10 cursor-pointer ${
                !extractionReady ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <SettingsIcon className="text-zinc-300" />
              <p className="text-zinc-300 "> Options</p>
            </div>
          )}

          {showAdvancedOptions && (
            <div>
              {success && (
                <div className="flex flex-col items-center ">
                  <p className="text-xl font-semibold text-white mt-6">
                    Your file has been successfully converted!
                  </p>
                  <button
                    className="mt-6  cursor-pointer text-md text-zinc-700 bg-primaryColor px-4 py-2 rounded-lg"
                    onClick={handleReset}
                  >
                    Convert another file
                  </button>
                </div>
              )}

              <div
                className={`flex flex-col space-y-2 max-w-[300px] mt-6 ${
                  (progress || success) && "hidden"
                }`}
              >
                <label
                  htmlFor="output-format"
                  className="block text-sm leading-5 font-medium text-zinc-300"
                >
                  1) Pick Output Format
                  <br />
                </label>
                <select
                  id="output-format"
                  defaultValue="mp3"
                  value={outputFormat || "mp3"}
                  onChange={onOutputFormatChange}
                  className={`block max-w-[200px] w-full py-1.5 px-3 border border-gray-300 bg-zinc-800 text-zinc-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm `}
                >
                  {outputFormatOptions.map((option, index) => (
                    <option key={index} value={option} className={``}>
                      {option === originalOutputformat
                        ? option + " (Original)"
                        : option}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 font-medium text-zinc-300">
                  Note: Default option automatically detects the original audio
                  format of the video file.
                </p>
              </div>

              <div
                className={`max-w-[300px] mt-10 mb-10 ${
                  (!uploadFile || success || progress) && "hidden "
                }`}
              >
                <p className="text-white text-sm mb-2">
                  2) Slice the audio file (optional)
                </p>
                {/*   <Slider value={value}
                                                    className="text-zinc-300"
                                                    onChange={(event: any, newValue: number | number[]) =>
                                                    {
                                                      handleTimeIntervalSet(event,newValue as number[])
                                                    }}
                                                    valueLabelDisplay="off"
                                                  
                                                    ></Slider> */}

                <div className="flex flex-row gap-6">
                  <div className="flex flex-col">
                    <label className="text-white text-xs">Start Time</label>
                    <input
                      className="w-[100px] bg-zinc-800 text-white text-xs rounded-md border border-zinc-600 focus:outline-none px-2 py-1 mt-2"
                      pattern="\d{2}:\d{2}:\d{2}"
                      value={startTimeInput}
                      onChange={handleStartInputChange}
                      onBlur={handleBlurStart}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-xs">End Time</label>
                    <input
                      className="w-[100px] bg-zinc-800 text-white text-xs rounded-md border border-zinc-600 focus:outline-none px-2 py-1 mt-2"
                      pattern="\d{2}:\d{2}:\d{2}"
                      value={endTimeInput}
                      onChange={handleEndInputChange}
                      onBlur={handleBlurEnd}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={extractAndDownloadAudio}
            aria-busy={progress !== null}
            disabled={!extractionReady}
            className={`bg-blue-200 max-w-[300px] text-black p-2 rounded mt-6 ${
              (progress || success) && "hidden"
            }`}
          >
            {progress
              ? "Converting"
              : extractionReady
              ? "Convert"
              : "Preparing the file..."}
          </button>
          {!progress && !success && error.length > 0 && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}

          <div className="flex flex-col">
            {progress && (
              <div className="flex flex-col text-primaryColor mt-6 mb-6">
                Please do not close this tab or the browser until the process is
                complete. <br /> Your download will start automatically once the
                conversion is complete.
              </div>
            )}
            {progress && (
              <div className="flex flex-col w-full">
                <div className="w-80 h-40">
                  <div className="flex flex-col space-y-2">
                    <progress
                      className="w-full bg-primaryColor rounded-lg"
                      value={progress?.progress}
                      max={1}
                    />
                    <div className="flex justify-end">
                      <span className="text-sm text-primaryColor">
                        {Math.floor(progress.progress * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div>
          <Alphy name={uploadFileName} />
        </div>
      )}

      <Explainer />
    </div>
  );
}
