import { LogData } from "@/lib/types/app-logs.types";
import { logger } from "@/services/app-logs.service";
import {
  S3UploadError,
  S3DownloadError,
  S3DeleteError,
} from "@/lib/errors/s3.errors";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({ region: process.env.AWS_REGION });
  }

  /**
   * Uploads a file to S3.
   * @param bucketName The name of the S3 bucket.
   * @param key The key (path) for the file in the bucket.
   * @param fileContent The content of the file to upload.
   * @param logData Contextual data for logging.
   * @returns The URL of the uploaded file.
   * @throws {S3UploadError} If the upload fails.
   */
  public async uploadFile(
    bucketName: string,
    key: string,
    fileContent: Buffer | string,
    logData: Omit<LogData, "meta">,
  ): Promise<string> {
    const context = "S3Service:uploadFile";
    const meta = { bucketName, key };
    logger.info("Attempting to upload file to S3.", {
      ...logData,
      context,
      meta,
    });

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: fileContent,
        }),
      );
      const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

      logger.info("Successfully uploaded file to S3.", {
        ...logData,
        context,
        meta: { ...meta, fileUrl },
      });
      return fileUrl;
    } catch (error: any) {
      logger.error(`Failed to upload file to S3: ${error.message}`, {
        ...logData,
        context,
        meta,
      });
      throw new S3UploadError(error.message);
    }
  }

  /**
   * Downloads a file from S3.
   * @param bucketName The name of the S3 bucket.
   * @param key The key (path) of the file in the bucket.
   * @param logData Contextual data for logging.
   * @returns The content of the downloaded file.
   * @throws {S3DownloadError} If the download fails.
   */
  public async downloadFile(
    bucketName: string,
    key: string,
    logData: Omit<LogData, "meta">,
  ): Promise<Buffer> {
    const context = "S3Service:downloadFile";
    const meta = { bucketName, key };
    logger.info("Attempting to download file from S3.", {
      ...logData,
      context,
      meta,
    });

    try {
      const { Body } = await this.s3Client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: key }),
      );
      if (Body === undefined) {
        throw new Error("File content is empty.");
      }
      const fileContent = await Body.transformToByteArray();

      logger.info("Successfully downloaded file from S3.", {
        ...logData,
        context,
        meta,
      });
      return Buffer.from(fileContent);
    } catch (error: any) {
      logger.error(`Failed to download file from S3: ${error.message}`, {
        ...logData,
        context,
        meta,
      });
      throw new S3DownloadError(error.message);
    }
  }

  /**
   * Deletes a file from S3.
   * @param bucketName The name of the S3 bucket.
   * @param key The key (path) of the file in the bucket.
   * @param logData Contextual data for logging.
   * @throws {S3DeleteError} If the deletion fails.
   */
  public async deleteFile(
    bucketName: string,
    key: string,
    logData: Omit<LogData, "meta">,
  ): Promise<void> {
    const context = "S3Service:deleteFile";
    const meta = { bucketName, key };
    logger.info("Attempting to delete file from S3.", {
      ...logData,
      context,
      meta,
    });

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
      );

      logger.info("Successfully deleted file from S3.", {
        ...logData,
        context,
        meta,
      });
    } catch (error: any) {
      logger.error(`Failed to delete file from S3: ${error.message}`, {
        ...logData,
        context,
        meta,
      });
      throw new S3DeleteError(error.message);
    }
  }
}

export const s3Service = new S3Service();
