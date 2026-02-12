import { S3Client } from "@aws-sdk/client-s3";

const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
  return value;
};

export const s3Client = new S3Client({
  region: getEnv("AWS_REGION"),
  credentials: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY")
  }
});

export const getS3Bucket = () => getEnv("AWS_S3_BUCKET");
