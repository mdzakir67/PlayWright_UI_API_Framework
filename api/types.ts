import { APIResponse } from "@playwright/test";

export type ApiResult<T> = {
  raw_response: APIResponse;
  custom_response: T;
};