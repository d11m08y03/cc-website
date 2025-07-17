import { CustomError } from "./custom.errors";

export class S3UploadError extends CustomError {
  constructor(message: string = "Failed to upload file to S3.") {
    super(message, "S3_UPLOAD_ERROR", 500);
  }
}

export class S3DownloadError extends CustomError {
  constructor(message: string = "Failed to download file from S3.") {
    super(message, "S3_DOWNLOAD_ERROR", 500);
  }
}

export class S3DeleteError extends CustomError {
  constructor(message: string = "Failed to delete file from S3.") {
    super(message, "S3_DELETE_ERROR", 500);
  }
}
