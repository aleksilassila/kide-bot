import { fetch, logErrors } from "./api";
import { UserWithToken } from "../models/User";

export interface ProductResponse {
  finalPrice: number;
  reservationsCount: number;
  reservationsTimeLeft: number;
}

export function reserveVariant(
  userWithToken: UserWithToken,
  inventoryId: string,
  quantity: number
): Promise<ProductResponse | undefined> {
  return fetch(
    {
      url: "https://api.kide.app/api/reservations",
      method: "POST",
      data: {
        toCreate: [
          {
            inventoryId,
            quantity,
            productVariantUserForm: null,
          },
        ],
        toCancel: [],
      },
    },
    userWithToken
  )
    .then((res) => {
      return res.data?.model;
    })
    .catch(logErrors);
}
