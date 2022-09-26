import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import User, { UserWithToken } from "../models/User";
import { Token } from "@prisma/client";

function getConfig(
  config: AxiosRequestConfig,
  token?: Token
): AxiosRequestConfig {
  return {
    ...config,
    baseURL: "https://api.kide.app",
    headers: {
      ...config.headers,
      ...(token && { authorization: `Bearer ${token.token}` }),
      authority: "api.kide.app",
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en;q=0.5",
      "content-type": "application/json;charset=UTF-8",
      origin: "https://kide.app",
      referer: "https://kide.app/",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
    },
  };
}

export async function fetch(
  config: AxiosRequestConfig,
  userWithToken?: UserWithToken
): Promise<AxiosResponse> {
  let token = userWithToken?.token || undefined;

  if (token && token.expiresAt < new Date() && userWithToken) {
    console.log("Refreshing token...");
    token = await User.refreshToken(userWithToken);
  }

  const response = await axios(getConfig(config, token));

  if (response.status === 401 && userWithToken) {
    console.error("Authentication error, attempting refreshing token...");
    const newToken = await User.refreshToken(userWithToken);
    return axios(getConfig(config, newToken));
  } else {
    return response;
  }
}

export function logErrors(err: any): undefined {
  if (err instanceof AxiosError) {
    const axiosError = err as AxiosError;
    console.log(`Error: ${axiosError.message}`);
    console.log(axiosError.request);
  } else {
    console.error(err);
  }

  return undefined;
}
