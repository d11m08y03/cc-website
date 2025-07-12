import { NextResponse } from "next/server";
import { ApiErrorCode, ApiResponse } from "@/lib/types/api.types";

/**
 * Creates a standardized successful API response.
 * @param data The payload to be sent in the response.
 * @param status The HTTP status code, defaults to 200.
 * @returns A NextResponse object with a standardized success body.
 */
export function createSuccessResponse<T>(
	data: T,
	status: number = 200,
): NextResponse<ApiResponse<T>> {
	const responseBody: ApiResponse<T> = {
		success: true,
		data,
	};

	return NextResponse.json(responseBody, { status });
}

/**
 * Creates a standardized error API response.
 * @param message A human-readable error message.
 * @param code A machine-readable error code.
 * @param status The HTTP status code.
 * @returns A NextResponse object with a standardized error body.
 */
export function createErrorResponse(
	message: string,
	code: ApiErrorCode,
	status: number,
): NextResponse<ApiResponse<never>> {
	// 'never' because an error response has no data

	const responseBody: ApiResponse<never> = {
		success: false,
		error: {
			message,
			code,
		},
	};

	return NextResponse.json(responseBody, { status });
}
