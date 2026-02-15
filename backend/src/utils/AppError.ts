export class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
