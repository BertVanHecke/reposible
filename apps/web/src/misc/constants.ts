import { ErrorReason } from "./utils";

export const APPLICATION_NAME = "Reposible";
export const APPLICATION_DESCRIPTION = "Integrations made easy";
export const WEBSITE_URL = "https://reposible.com";

export const messageMap: Record<ErrorReason, string> = {
  invalid_token: "The invitation is invalid.",
  expired_token: "The invitation has expired.",
  expected_error: "An error occurred.",
};
