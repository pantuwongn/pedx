import { RcFile } from "antd/lib/upload";

export function randomIntInRange(max: number, min: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
