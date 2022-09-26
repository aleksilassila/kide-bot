import { fetch } from "./api";

export interface ProductResponse {
  product?: {
    id?: string;
    name?: string;
    dateSalesFrom?: string;
    dateSalesUntil?: string;
  };
  variants?: {
    id?: string;
    inventoryId?: string;
    name?: string;
    availability?: number;
    pricePerItem?: number;
    currencyCode?: string;
    dateSalesFrom?: string | null;
    dateSalesUntil?: string | null;
    isProductVariantMarkedAsOutOfStock?: boolean;
    isProductVariantVisible?: boolean;
    isProductVariantTransferable?: boolean;
    productVariantMaximumReservableQuantity?: number;
    productVariantMinimumReservableQuantity?: number;
    productVariantMaximumItemQuantityPerUser?: number;
  }[];
}

export function getProduct(
  productId: string
): Promise<ProductResponse | undefined> {
  return fetch({
    url: "https://api.kide.app/api/products/" + productId,
  })
    .then((res) => {
      return res.data?.model;
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });
}
