import {
  User,
  Variant,
  Order as PrismaOrder,
  Product,
  Prisma,
} from "@prisma/client";
import prisma from "../prisma";
import { getProduct } from "../kide-api/get-product";
import Order, { OrderFull } from "./Order";

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: {
    variants: true;
  };
}>;

const Product = {
  getOrCreate: async function (
    productId: string
  ): Promise<Product | undefined> {
    let product = await prisma.product
      .findUnique({
        where: {
          id: productId,
        },
      })
      .catch((err) => undefined);

    if (product === null) {
      product = await prisma.product.create({
        data: {
          id: productId,
          name: "",
          variants: {},
        },
      });

      product = await Product.update(product);
      if (product === undefined) {
        await prisma.product
          .delete({
            where: {
              id: productId,
            },
          })
          .catch();
        return undefined;
      }
    }

    return product;
  },

  update: async function (
    product: Product
  ): Promise<ProductWithVariants | undefined> {
    const productInfo = await getProduct(product.id);

    return (
      (await prisma.product
        .update({
          where: {
            id: product.id,
          },
          data: {
            name: <string>productInfo?.product?.name,
            mediaFilename: productInfo?.product?.mediaFilename,
            salesFrom: productInfo?.product?.dateSalesFrom,
            salesUntil: productInfo?.product?.dateSalesUntil,
            variants: {
              upsert: (productInfo?.variants || []).map((v) => ({
                where: {
                  id: v.id,
                },
                update: {
                  inventoryId: <string>v.inventoryId,
                  name: <string>v.name,
                  availability: <number>v.availability,
                  price: <number>v.pricePerItem,
                  currency: <string>v.currencyCode,
                  salesFrom: v.dateSalesFrom ? new Date(v.dateSalesFrom) : null,
                  salesUntil: v.dateSalesUntil
                    ? new Date(v.dateSalesUntil)
                    : null,
                },
                create: {
                  id: <string>v.id,
                  inventoryId: <string>v.inventoryId,
                  name: <string>v.name,
                  availability: <number>v.availability,
                  price: <number>v.pricePerItem,
                  currency: v.currencyCode,
                  salesFrom: v.dateSalesFrom ? new Date(v.dateSalesFrom) : null,
                  salesUntil: v.dateSalesUntil
                    ? new Date(v.dateSalesUntil)
                    : null,
                },
              })),
            },
          },
          include: {
            variants: true,
          },
        })
        .catch(console.error)) || undefined
    );
  },

  getOrders: async function (
    product: Product
  ): Promise<OrderFull[] | undefined> {
    return await prisma.order
      .findMany({
        where: {
          productId: product.id,
        },
        include: {
          user: {
            include: {
              token: true,
            },
          },
          product: true,
        },
      })
      .catch((err) => undefined);
  },

  completeOrders: async function (
    product: Product,
    attempts = 45
  ): Promise<void> {
    const orders = this.getOrders(product);

    const updatedProduct = await new Promise<ProductWithVariants | undefined>(
      async (resolve) => {
        for (let i = 0; i < attempts; i++) {
          if (updatedProduct !== undefined) break;

          console.log("Attempting to update product " + product.id);
          this.update(product)
            .then((p) => {
              if (p && p.variants.length > 0) {
                console.log("Product " + product.id + " updated");
                resolve(p);
              } else if (i === 8) {
                resolve(undefined);
              }
            })
            .catch();
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              100 + (i % 4 === 3 ? 500 : 0) + (i % 10 === 9 ? 1500 : 0)
            )
          );
        }
      }
    );

    if (updatedProduct === undefined) {
      console.error(
        `Could not update product ${product.id} and therefore complete orders.`
      );
      return;
    }

    await Promise.all(
      (
        await orders
      )?.map((order) =>
        Order.complete(<ProductWithVariants>updatedProduct, order)
      ) || []
    );
  },
};

export default Product;
