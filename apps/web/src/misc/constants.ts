import { ErrorReason } from "./utils";

export const APPLICATION_NAME = "Reposible";
export const APPLICATION_DESCRIPTION = "Integrations made easy";
export const WEBSITE_URL = "https://reposible.com";

export const GOOGLE_SVG = "/auth-providers/google.svg";
export const DISCORD_SVG = "/auth-providers/discord.svg";
export const GITHUB_DARK_SVG = "/auth-providers/github-dark.svg";
export const GITHUB_LIGHT_SVG = "/auth-providers/github-light.svg";

export const REPOSIBLE_DARK_SVG = "/reposible/reposible-icon-dark.svg";
export const REPOSIBLE_LIGHT_SVG = "/reposible/reposible-icon-light.svg";

export const messageMap: Record<ErrorReason, string> = {
  invalid_token: "The invitation is invalid.",
  expired_token: "The invitation has expired.",
  expected_error: "An error occurred.",
};
