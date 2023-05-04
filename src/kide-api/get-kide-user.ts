import axios from "axios";

export interface KideUserResponse {
  id: string;
  fullName: string;
  email: string;
}

export function getKideUser(
  token: string
): Promise<KideUserResponse | undefined> {
  return axios({
    url: "https://api.kide.app/api/authentication/user",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      return res.data?.model;
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });
}
