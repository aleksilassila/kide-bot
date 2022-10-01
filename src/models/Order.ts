import { Order as PrismaOrder, Prisma, Product, User } from "@prisma/client";
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
  ): Promise<OrderFull | undefined> {
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

    await Scheduler.recreateOrderJobs();

    return order;
  },
  remove: async function (
    user: User,
    product: Product
  ): Promise<PrismaOrder | undefined> {
    return await prisma.order
      .delete({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
      })
      .catch((err) => undefined);
  },
  complete: async function (
    product: ProductWithVariants,
    order: OrderFull
  ): Promise<PrismaOrder | undefined> {
    const variants = Array.from(product.variants)
      .sort(
        (a, b) =>
          Math.abs(a.price - order.targetPrice) -
          Math.abs(b.price - order.targetPrice)
      )
      .filter((v) => v.availability !== 0);

    const user = await client.users
      .fetch(order.user.discordId)
      .catch((err) => undefined);

    if (variants.length === 0) {
      await user
        ?.send(
          `Could not reserve any tickets for **${product.name}**, no tickets left.`
        )
        .catch();
    } else {
      const reserveResponse = await reserveVariant(
        order.user,
        variants[0].inventoryId,
        1
      );

      if (reserveResponse?.reservationsCount === 1) {
        await user
          ?.send(
            `${reserveResponse?.reservationsCount} ticket(s) successfully reserved for **${product.name}**. You have 25 minutes to complete the order at https://kide.app/events/${product.id}`
          )
          .catch();
      } else {
        await user
          ?.send(
            `One of the following is broken: Kide.app API, this bot or my network connection. Anyways, I didn't get any tickets. You?`
          )
          .catch();
      }
    }

    return await this.remove(order.user, order.product);
  },
};

export default Order;
