import { Job, scheduledJobs, scheduleJob } from "node-schedule";
import Order, { OrderFull } from "./models/Order";
import Product from "./models/Product";
import prisma from "./prisma";
import product from "./models/Product";

function log(text: string) {
  console.log(`[Scheduler] ${text}`);
}

export default class Scheduler {
  static jobs: { [time: string]: Job } = {};

  static cancelOrderJobs() {
    for (const key of Object.keys(this.jobs)) {
      this.jobs[key].cancel();
      delete this.jobs[key];
    }
  }

  static async recreateOrderJobs() {
    this.cancelOrderJobs();

    const orders = await prisma.order
      .findMany({
        include: {
          product: true,
        },
      })
      .catch((err) => undefined);

    if (!orders) return;

    for (const order of orders) {
      const time = order.product.salesFrom;
      const key = time?.toString();

      if (!key || !time || Object.keys(this.jobs).includes(key)) {
        continue;
      }

      if (time.getTime() < Date.now()) {
        this.jobs[key] = scheduleJob(new Date(Date.now() + 1000), () => {
          log("Running job in 1 second");
          Product.completeOrders(order.product);
        });
      } else {
        log(
          "Scheduling order for " +
            order.product.name +
            " at " +
            time.toString()
        );
        this.jobs[key] = scheduleJob(time, () => {
          log("Running job at " + new Date().toString());
          Product.completeOrders(order.product);
        });
      }
    }

    log(`Scheduled ${Object.keys(scheduledJobs).length} jobs`);
  }
}
