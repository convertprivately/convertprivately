import React from "react";
import path from "path";

export function changeExtension(filename: string, newExtension: string) {
  const parsed = path.parse(filename);
  if (!newExtension.startsWith(".")) {
    newExtension = "." + newExtension;
  }
  parsed.ext = newExtension;
  parsed.base = `${parsed.name}${parsed.ext}`;
  return path.format(parsed);
}

export function audioFormatToFileType(format: string): string {
  if (format.startsWith(".")) {
    format = format.slice(1);
  }
  return `audio/${format}`;
}

export function Dropdown({
  options,
  defaultValue,
}: {
  options: string[];
  defaultValue: string;
}) {
  return (
    <select defaultValue={defaultValue}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function microsecondsToString(microseconds: number): string {
  const seconds = Math.floor(microseconds / 1000000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const secondsRemainder = seconds % 60;
  const minutesRemainder = minutes % 60;

  const hoursString = hours.toString().padStart(2, "0");
  const minutesString = minutesRemainder.toString().padStart(2, "0");
  const secondsString = secondsRemainder.toString().padStart(2, "0");

  return `${hoursString}:${minutesString}:${secondsString}`;
}

export function durationStringToMicroseconds(duration: string) {
  const pattern = /^(\d+):(\d{2}):(\d{2})(?:\.(\d*))?$/;
  const match = pattern.exec(duration.trim());

  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    // If milliseconds are not provided, default to zero
    const milliseconds = match[4] ? parseInt(match[4], 10) : 0;
    const microseconds = milliseconds * 1000; // Convert milliseconds to microseconds

    // Convert the duration parts to microseconds and sum them up
    return (
      hours * 3600000000 + minutes * 60000000 + seconds * 1000000 + microseconds
    );
  } else {
    throw new Error("Invalid duration format");
  }
}
