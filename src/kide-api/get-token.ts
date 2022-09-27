import axios from "axios";
import { logErrors } from "./api";

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export function getToken(
  username: string,
  password: string
): Promise<TokenResponse | undefined> {
  return axios({
    url: "https://auth.kide.app/oauth2/token",
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    data: `client_id=56d9cbe22a58432b97c287eadda040df&grant_type=password&password=${password}&rememberMe=true&username=${username}`,
  })
    .then((res) => {
      return res.data;
    })
    .catch(logErrors);
}
