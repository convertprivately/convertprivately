// Write a class that has a async init method

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Mutex } from "async-mutex";
import path from "path";
import { changeExtension } from "./utils";
// import path from "path";

export class FFmpegWrapper {
  private ffmpeg: FFmpeg = new FFmpeg();
  readonly logLines: { type: string; message: string }[] = [];
  private mutex: Mutex = new Mutex();

  private constructor() {
    this.ffmpeg.on("log", (logEvent) => {
      this.log(logEvent.type, logEvent.message);
    });
  }

  /// Other than this function, the other functions are meant to be used from Extraction
  public static async create() {
    const instance = new FFmpegWrapper();
    await instance.init();
    return instance;
  }

  private async init() {
    await this.ffmpeg.load({
      coreURL: "/ffmpeg-core.js",
      wasmURL: "/ffmpeg-core.wasm",
    });
  }

  public async uploadPayload(filename: string, payload: Uint8Array) {
    await this.ffmpeg.writeFile(filename, payload);
  }

  public async uploadFile(file: File): Promise<string> {
    const filename = file.name;
    const payload = await file.arrayBuffer();
    await this.uploadPayload(filename, new Uint8Array(payload));
    return filename;
  }

  public async deleteFile(filename: string) {
    await this.ffmpeg.deleteFile(filename);
  }

  private log(type: string, message: string) {
    console.log(type, "=>", message);
    this.logLines.push({ type, message });
  }

  public async audioFormat(filename: string): Promise<string> {
    return await this.mutex.runExclusive(async () => {
      const len = this.logLines.length;
      this.log("COMMAND", "Querying audio format for " + filename);
      await this.ffmpeg.exec(["-i", filename, "-hide_banner"]);
      const lines = this.logLines.slice(len);
      const line = lines.find((line) => line.message.includes("Audio:"));
      if (!line) {
        throw new Error("No audio format for " + filename);
      }
      const format = line.message.split("Audio: ")[1].split(" ")[0];
      this.log("RESULT", "Audio format for " + filename + " is " + format);
      return format;
    });
  }

  public async extractAudio(
    filename: string,
  ): Promise<NamedPayload> {
    const format = await this.audioFormat(filename);
    const outputFilename = changeExtension(filename, format);

    return await this.mutex.runExclusive(async () => {
      this.log("COMMAND", "Extracting audio from " + filename);
      await this.ffmpeg.exec([
        "-i",
        filename,
        "-vn",
        "-acodec",
        "copy",
        outputFilename,
      ]);
      try {
        const payload = await this.ffmpeg.readFile(outputFilename);
        this.log("RESULT", "Extracted audio from " + filename);
        return { name: outputFilename, payload: payload as Uint8Array, format: format! };
      } catch (e) {
        throw new Error("Failed to extract audio from " + filename + ": " + e);
      }
    });
  }

  public async extractConvertAudio(
    filename: string,
    format: string
  ): Promise<NamedPayload> {
    const outputFilename = changeExtension(filename, format);

    return await this.mutex.runExclusive(async () => {
      this.log("COMMAND", "Extracting audio from " + filename + " and converting to " + format);
      await this.ffmpeg.exec([
        "-i",
        filename,
        "-q:a",
        "0",
        "-map",
        "a",
        outputFilename,
      ]);
      try {
        const payload = await this.ffmpeg.readFile(outputFilename);
        this.log("RESULT", "Extracted audio from " + filename);
        return { name: outputFilename, payload: payload as Uint8Array, format: format! };
      } catch (e) {
        throw new Error("Failed to extract audio from " + filename + ": " + e);
      }
    });
  }
}

interface NamedPayload {
  name: string;
  payload: Uint8Array;
  format: string
}

export class Extraction {
  private ffmpeg: FFmpegWrapper;
  private input: string;
  private outputs: string[] = [];

  private constructor(ffmpeg: FFmpegWrapper, input: string) {
    const extname = path.extname(input);
    if (extname === "" || extname === ".") {
      throw new Error("Input file must have an extension");
    }
    this.ffmpeg = ffmpeg;
    this.input = input;
  }

  public static async create(
    ffmpeg: FFmpegWrapper,
    upload: File | NamedPayload
  ) {
    let input: string;
    if (upload instanceof File) {
      input = upload.name;
      await ffmpeg.uploadFile(upload);
    } else {
      input = upload.name;
      await ffmpeg.uploadPayload(input, upload.payload);
    }
    const instance = new Extraction(ffmpeg, input);
    return instance;
  }

  public async delete() {
    for (const output of this.outputs) {
      await this.ffmpeg.deleteFile(output);
    }
    await this.ffmpeg.deleteFile(this.input);
  }

  public async audioFormat(): Promise<string> {
    return await this.ffmpeg.audioFormat(this.input);
  }

  public async extractAudio(format: string | null): Promise<NamedPayload> {
    let namedPayload: NamedPayload;
    if (format) {
      namedPayload = await this.ffmpeg.extractConvertAudio(this.input, format);
    } else {
      namedPayload = await this.ffmpeg.extractAudio(this.input);
    }
    this.outputs.push(namedPayload.name);
    return namedPayload;
  }
}
