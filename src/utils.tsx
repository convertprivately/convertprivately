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
