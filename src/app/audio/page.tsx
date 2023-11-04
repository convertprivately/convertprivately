"use client";

import { Extraction, FFmpegWrapper, ProgressCallback } from "@/FFmpegWrapper";
import { audioFormatToFileType } from "@/utils";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import ClearIcon from "@mui/icons-material/Clear";
import { Explainer } from "@/Explainer";
import Alphy from "@/Alphy";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const f = async () => {
      ffmpeg.current = await FFmpegWrapper.create();
      setFFmpegLoaded(true);
      console.log("FFmpeg loaded");
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
      setExtractionReady(true);
      console.log("Extraction created");
      /* setUploadFile(null); */
    };
    f();
  }, [ffmpegLoaded, uploadFile]);

  const handleFileUploadThroughDrop = async (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    let file;
    if (e.dataTransfer.files && e.dataTransfer.files.length === 1) {
      file = e.dataTransfer.files[0];
      setUploadFile(file);
      setUploadFileName(file.name);
    } else {
      setUploadFile(null);
      setUploadFileName("");
      console.log("Here", extraction.current);
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

    if (e.target.files && e.target.files.length === 1) {
      let file;

      file = e.target.files[0];

      setUploadFile(file);
      setUploadFileName(file.name);
    } else {
      setUploadFile(null);
      setUploadFileName("");
      console.log("Here", extraction.current);
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
    if (extraction.current) {
      setProgress({ progress: 0, microseconds: 0 });
      const namedPayload = await extraction.current.extractAudio(
        outputFormat,
        progressCallback
      );
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
    "", //TODO: needs a good name or explaining
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

  if (progress !== null) {
    console.log(progress.progress);
  }

  return (
    <div className={`max-w-[900px] mx-auto w-full px-10 lg:px-6`}>
      <p className="mb-4 text-lg   font-semibold text-white">
        Convert your video file to MP3, OGG, WAV, AAC, FLAC, M4A, OPUS, AC3
      </p>
      <div className="border-b border-gray-700  mx-auto items-center flex mb-5 mt-5"></div>

      <div className="mb-6 mt-8">
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
                Drag & Drop your video file here
                <br />
                <p className="text-xs text-gray-700">MP4, MKV, WEBM</p>
              </div>
            )}
          </p>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            id="upload"
            name="Upload"
            accept=".mp4, .mkv, .webm"
            onChange={handleFileUpload}
          />
        </div>

        <div
          className={`${
            uploadFile ? "flex flex-col mx-auto justify-center " : "hidden"
          }`}
        >
          <div className="flex flex-row justify-between">
            <p className="text-white text-xl font-semibold ">
              {uploadFileName.length > 0 ? uploadFileName : "Your File"}{" "}
              <ClearIcon
                onClick={() => setUploadFile(null)}
                fontSize="small"
                className="ml-4 mb-1 cursor-pointer"
              />
            </p>
          </div>

          {success && (
            <div className="flex flex-col">
              <p className="text-lg text-primaryColor mt-6">
                Your file has been successfully converted!
              </p>
              <p
                className="mt-6 underline cursor-pointer text-md text-zinc-200"
                onClick={() => setUploadFile(null)}
              >
                Convert another file
              </p>
            </div>
          )}
          <div
            className={`flex flex-col space-y-2 max-w-[200px] mt-6 ${
              (progress || success) && "hidden"
            }`}
          >
            <label
              htmlFor="output-format"
              className="block text-xs leading-5 font-medium text-zinc-300"
            >
              Pick Output Format
            </label>
            <select
              id="output-format"
              defaultValue="default"
              onChange={onOutputFormatChange}
              className="block w-full py-1.5 px-3 border border-gray-300 bg-zinc-900 text-zinc-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {outputFormatOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={extractAndDownloadAudio}
            aria-busy={progress !== null}
            disabled={!extractionReady}
            className={`bg-blue-200 max-w-[300px] text-black p-2 rounded mt-6 ${
              success && "hidden"
            }`}
          >
            {progress
              ? "Converting"
              : extractionReady
              ? "Convert"
              : "Preparing the file..."}
          </button>

          <div className="flex flex-col">
            {progress && (
              <div className="flex flex-col text-primaryColor mt-6 mb-6">
                Please do not close this tab or the browser until the process is
                complete. Your download will start automatically once the
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
          <div className="border-b border-gray-700  mx-auto items-center flex mb-5 mt-5"></div>
          <Alphy name={uploadFileName} />
        </div>
      )}

      <Explainer />
    </div>
  );
}
