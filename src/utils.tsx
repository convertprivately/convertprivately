import React from 'react';
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
  return `audio/${format}`
}


export function Dropdown({ options, defaultValue }: { options: string[], defaultValue: string }) {
  return (
    <select defaultValue={defaultValue}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
