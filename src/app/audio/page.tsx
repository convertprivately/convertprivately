"use client";

import { Extraction, FFmpegWrapper, ProgressCallback } from "@/FFmpegWrapper";
import { audioFormatToFileType, microsecondsToString } from "@/utils";
import { ChangeEvent, useEffect, useRef, useState } from "react";

interface Progress {
  progress: number;
  microseconds: number;
}

export default function Audio() {
  const ffmpeg = useRef<FFmpegWrapper | null>(null);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const extraction = useRef<Extraction | null>(null);
  const [extractionReady, setExtractionReady] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [outputFormat, setOutputFormat] = useState<string | null>(null);

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
      setUploadFile(null);
    };
    f();
  }, [ffmpegLoaded, uploadFile]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length === 1) {
      const file = e.target.files[0];
      setUploadFile(file);
    } else {
      setUploadFile(null);
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
      const namedPayload = await extraction.current.extractAudio({
        format: outputFormat || undefined,
        progressCallback,
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
      setProgress(null);
    } else {
      console.error("extraction is not ready yet");
    }
  };

  const outputFormatOptions = [
    "default",
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
    if (format === "default") {
      setOutputFormat(null);
    } else {
      setOutputFormat(format);
    }
  };

  return (
    <>
      <div className="container" style={{ padding: "3em" }}>
        <p>For any video file given, extracts the audio for you.</p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "20em", height: "10em" }}>
          <input
            type="file"
            id="upload"
            name="Upload"
            accept=".mp4, .mkv, .webm"
            onChange={handleFileUpload}
          />

          <div style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
            <select
              id="output-format"
              defaultValue={"default"}
              onChange={onOutputFormatChange}
            >
              {outputFormatOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <label htmlFor="output-format">Output Format</label>
          </div>

          <button
            onClick={extractAndDownloadAudio}
            aria-busy={progress !== null}
            disabled={!extractionReady}
          >
            Extract
          </button>

          {progress && (
            <>
              <progress value={progress?.progress} max={1} />
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                <span>{microsecondsToString(progress.microseconds)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
