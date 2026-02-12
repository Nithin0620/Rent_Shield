import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { s3Client, getS3Bucket } from "../config/s3";

export const uploadObject = async (key: string, buffer: Buffer, mimeType: string) => {
  const bucket = getS3Bucket();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType
    })
  );

  return `https://${bucket}.s3.amazonaws.com/${key}`;
};

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

export const downloadObject = async (key: string): Promise<Buffer> => {
  const bucket = getS3Bucket();
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );

  if (!response.Body) {
    throw new Error("S3 object body missing");
  }

  return streamToBuffer(response.Body as Readable);
};
