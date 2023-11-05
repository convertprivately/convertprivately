import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Mutex } from "async-mutex";
import path from "path";
import {
  changeExtension,
  durationStringToMicroseconds,
  microsecondsToString,
} from "./utils";

export type ProgressCallback = ({
  progress,
  time,
}: {
  progress: number;
  time: number;
}) => void;

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

  public async audioMetadata(
    filename: string
  ): Promise<{ duration: number; format: string }> {
    return await this.mutex.runExclusive(async () => {
      const len = this.logLines.length;
      this.log("COMMAND", "Querying audio metadata for " + filename);
      await this.ffmpeg.exec(["-i", filename, "-hide_banner"]);
      const lines = this.logLines.slice(len);

      // format
      let line = lines.find((line) => line.message.includes("Audio:"));
      if (!line) {
        throw new Error("No audio format for " + filename);
      }
      const format = line.message.split("Audio: ")[1].split(" ")[0];

      // duration
      line = lines.find((line) => line.message.includes("Duration:"));
      if (!line) {
        throw new Error("No duration for " + filename);
      }
      const durationStr = line.message.split("Duration: ")[1].split(",")[0];
      const duration = durationStringToMicroseconds(durationStr);

      this.log(
        "RESULT",
        "For file " +
          filename +
          ", format is " +
          format +
          " and duration is " +
          duration
      );
      return { duration, format };
    });
  }

  /**
   * Builds a command array for audio extraction using FFmpeg.
   *
   * @param {Object} options - The options for the audio extraction command.
   * @param {string} options.filename - The name of the input audio file.
   * @param {number} [options.start] - The start time in microseconds for the audio extraction.
   * @param {number} [options.end] - The end time in microseconds for the audio extraction.
   * @param {string} [options.format] - The desired output format of the audio file, if not provided the original format is used.
   *
   * @returns A promise that resolves to an object containing an array of command line arguments for FFmpeg and the outputFilename.
   *
   * @example
   * // Example with format specified, extracting a portion from 30 seconds to 1 minute as a WAV file
   * // returns command ['-i', 'audio.mp3', '-ss', '00:00:30', '-to', '00:01:00', '-q:a', '0', '-map', 'a', 'audio.wav']
   * buildAudioExtractionCommand({
   *   filename: 'audio.mp3',
   *   start: 30000000,
   *   end: 60000000,
   *   format: 'wav'
   * });
   *
   * @example
   * // Example without format specified, extracting the full audio without re-encoding
   * // returns command ['-i', 'audio.mp3', '-ss', '00:00:30', '-vn', '-acodec', 'copy', 'audio.mp3']
   * buildAudioExtractionCommand({
   *   filename: 'audio.mp3'
   *   start: 30000000,
   * });
   *
   * @async
   * @function buildAudioExtractionCommand
   */
  private async buildAudioExtractionCommand({
    filename,
    format,
    start,
    end,
  }: {
    filename: string;
    start?: number;
    end?: number;
    format?: string;
  }): Promise<{
    command: string[];
    outputFilename: string;
    outputFormat: string;
  }> {
    const command = ["-i", filename];
    let finalFormat: string | undefined = format;
    if (start) {
      command.push("-ss", microsecondsToString(start));
    }
    if (end) {
      command.push("-to", microsecondsToString(end));
    }
    if (finalFormat) {
      command.push("-q:a", "0", "-map", "a");
    } else {
      command.push("-vn", "-acodec", "copy");
      const metadata = await this.audioMetadata(filename);
      finalFormat = metadata.format;
    }
    const outputFilename = changeExtension(filename, finalFormat);
    command.push(outputFilename);

    return { command, outputFilename, outputFormat: finalFormat };
  }

  public async extractAudio({
    filename,
    format,
    start,
    end,
    progressCallback,
  }: {
    filename: string;
    format?: string;
    start?: number;
    end?: number;
    progressCallback?: ProgressCallback;
  }): Promise<NamedPayload> {
    if (progressCallback) {
      this.ffmpeg.on("progress", progressCallback);
    }

    const { command, outputFilename, outputFormat } =
      await this.buildAudioExtractionCommand({
        filename,
        format,
        start,
        end,
      });

    return await this.mutex.runExclusive(async () => {
      this.log("COMMAND", "Extracting audio with command " + command.join(" "));
      await this.ffmpeg.exec(command);
      try {
        const payload = await this.ffmpeg.readFile(outputFilename);
        this.log("RESULT", "Extracted audio from " + filename);
        return {
          name: outputFilename,
          payload: payload as Uint8Array,
          format: outputFormat,
        };
      } catch (e) {
        throw new Error("Failed to extract audio from " + filename + ": " + e);
      } finally {
        if (progressCallback) {
          this.ffmpeg.off("progress", progressCallback);
        }
      }
    });
  }
}

interface NamedPayload {
  name: string;
  payload: Uint8Array;
  format: string;
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

  /**
   * @returns {Promise<{duration: number, format: string}>} The format of the audio file and duration (in microseconds).
   */
  public async audioMetadata(): Promise<{ duration: number; format: string }> {
    return await this.ffmpeg.audioMetadata(this.input);
  }

  /**
   * Extracts a portion of an audio file within specified start and end times or converts the entire file to a different format.
   * It also allows conversion of the extracted segment to a specified format.
   *
   * @param {Object} options - Configuration options for audio extraction.
   * @param {string} [options.format] - The desired output format of the audio segment (e.g., 'mp3', 'wav', 'ogg'). Defaults to the original format if not specified.
   * @param {number} [options.start] - The start time in microseconds for the audio segment extraction. Omitting this starts from the beginning of the audio.
   * @param {number} [options.end] - The end time in microseconds for the audio segment extraction. Omitting this extracts until the end of the audio.
   * @param {ProgressCallback} [options.progressCallback] - A callback to receive progress updates on the extraction process.
   * @returns {Promise<NamedPayload>} - A promise that resolves to an object with 'name', 'payload', and 'format' of the extracted audio.
   * @throws {Error} - If audio extraction fails, an error is thrown.
   *
   * @example
   * // Extract audio from 30 seconds (30,000,000 microseconds) to 2 minutes (120,000,000 microseconds) in 'wav' format.
   * const segment = await extractionInstance.extractAudio({
   *   format: 'wav',
   *   start: 30000000,  // Start at 30 seconds
   *   end: 120000000    // End at 2 minutes
   * });
   * // The 'segment' will be a 'wav' file containing the specified 1.5-minute audio portion.
   *
   * @example
   * // Extract audio from the beginning of the file to 1 minute (60,000,000 microseconds) with progress updates.
   * const oneMinuteAudio = await extractionInstance.extractAudio({
   *   end: 60000000,  // End at 1 minute
   *   progressCallback: ({ progress, time }) => {
   *     console.log(`Current progress: ${progress}%, Current time: [${microsecondsToString(time)}]`);
   *   }
   * });
   * // The 'oneMinuteAudio' will contain the first minute of the audio in its original format.
   * // Progress will be logged to the console.
   */
  public async extractAudio(options: {
    format?: string;
    start?: number;
    end?: number;
    progressCallback?: ProgressCallback;
  }): Promise<NamedPayload> {
    return await this.ffmpeg.extractAudio({ ...options, filename: this.input });
  }
}
