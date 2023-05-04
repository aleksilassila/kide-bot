import { Product as PrismaProduct } from "@prisma/client";
import { Job, scheduledJobs, scheduleJob } from "node-schedule";
import Product, { ProductWithVariants } from "../../models/Product";
import prisma from "../../prisma";
import Order from "../../models/Order";
import User from "../../models/User";

export default class ReservationEvent {
  static async updateEvents() {
    const products = await prisma.product
      .findMany({
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      })
      .catch((err) => undefined);

    products?.forEach((product) => {
      if (product._count?.orders > 0) {
        ReservationEvent.create(product);
      } else if (product._count?.orders === 0) {
        scheduledJobs[product.id]?.cancel();
      }
    });
  }

  private static create(product: PrismaProduct): Job | undefined {
    if (Object.keys(scheduledJobs).includes(product.id)) {
      console.log("Job already exists for product " + product.id);
      return scheduledJobs[product.id];
    }

    const startDate = product.salesFrom;

    if (!startDate) return;

    if (startDate.getTime() < Date.now()) {
      this.completeOrders(product, 1).then();
      return undefined;
    }

    console.log("Creating job for product " + product.id);
    return scheduleJob(product.id, startDate, () =>
      this.completeOrders(product)
    );
  }

  private static async completeOrders(
    product: PrismaProduct,
    attempts = 30
  ): Promise<void> {
    const orders = Product.getOrders(product);

    const updatedProduct = await this.updateLoop(product, attempts);

    if (updatedProduct === undefined) {
      console.error(
        `Could not update product ${product.id} and therefore complete orders.`
      );

      for (const order of (await orders) || []) {
        await User.sendDirectMessage(
          order.user,
          "Could not reserve any tickets for **${product.name}**, could fetch tickets. Have the ticket sales ended?"
        );
      }

      return;
    }

    await Promise.all(
      (
        await orders
      )?.map((order) =>
        Order.complete(<ProductWithVariants>updatedProduct, order)
      ) || []
    );
  }

  private static async updateLoop(
    product: PrismaProduct,
    attempts: number
  ): Promise<ProductWithVariants | undefined> {
    const updatedProduct = await new Promise<ProductWithVariants | undefined>(
      async (resolve) => {
        for (let i = 0; i < attempts; i++) {
          if (updatedProduct !== undefined) break;

          console.log("Attempting to update product " + product.id);
          Product.update(product)
            .then(async (p) => {
              if (p?.salesUntil && p?.salesUntil.getTime() < Date.now()) {
                resolve(undefined);
                console.log(
                  `Removing product ${product.id} because of expired sales`
                );
                await prisma.product.delete({
                  where: {
                    id: product.id,
                  },
                });
              } else if (p && p.variants.length > 0) {
                console.log("Product " + product.id + " updated");
                resolve(p);
              }
              // else if (i === 8) {
              //   resolve(undefined);
              // }
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

    return updatedProduct;
  }
}
