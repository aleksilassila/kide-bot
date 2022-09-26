import {
  Order as PrismaOrder,
  Prisma,
  Product,
  User,
  Variant,
} from "@prisma/client";
import prisma from "../prisma";
import { ProductWithVariants } from "./Product";
import Scheduler from "../scheduler";
import { reserveVariant } from "../kide-api/make-reservation";
import { client } from "../app";

export type OrderFull = Prisma.OrderGetPayload<{
  include: {
    user: {
      include: {
        token: true;
      };
    };
    product: true;
  };
}>;

const Order = {
  updateOrCreate: async function (
    user: User,
    product: Product,
    targetPrice: number
  ): Promise<PrismaOrder | undefined> {
    const order = await prisma.order
      .upsert({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
        update: {
          targetPrice: Math.round(targetPrice * 100),
        },
        create: {
          targetPrice: Math.round(targetPrice * 100),
          userId: user.id,
          productId: product.id,
        },
      })
      .catch((err) => undefined);

    await Scheduler.recreateOrderJobs();

    return order;
  },
  remove: async function (
    user: User,
    product: Product
  ): Promise<number | undefined> {
    const deleted = await prisma.order
      .deleteMany({
        where: {
          userId: user.id,
          productId: product.id,
        },
      })
      .catch((err) => undefined);

    return deleted?.count;
  },
  complete: async function (
    product: ProductWithVariants,
    order: OrderFull
  ): Promise<PrismaOrder | undefined> {
    const variants = Array.from(product.variants).sort(
      (a, b) =>
        Math.abs(a.price - order.targetPrice) -
        Math.abs(b.price - order.targetPrice)
    );

    if (variants.length === 0) return;

    const reserveResponse = await reserveVariant(
      order.user,
      variants[0].inventoryId,
      1
    );

    const user = await client.users
      .fetch(order.user.discordId)
      .catch((err) => undefined);
    if (reserveResponse?.reservationsCount === 1) {
      user
        ?.send(
          `${reserveResponse?.reservationsCount} ticket(s) successfully reserved for ${product.name}!`
        )
        .catch();
    } else {
      user?.send(`Could not reserve any tickets from ${product.name}.`).catch();
    }

    if (reserveResponse?.reservationsCount) {
      return await prisma.order
        .delete({
          where: {
            userId_productId: {
              userId: order.userId,
              productId: order.productId,
            },
          },
        })
        .catch((err) => undefined);
    }
  },
};

export default Order;
