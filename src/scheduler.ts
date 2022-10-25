import { Job, scheduledJobs, scheduleJob } from "node-schedule";
import Product from "./models/Product";
import prisma from "./prisma";

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

      const startDate =
        time.getTime() < Date.now() ? new Date(Date.now() + 1000) : time;
      log(
        "Scheduling order for " +
          order.product.name +
          " at " +
          startDate.toLocaleString("fi")
      );
      this.jobs[key] = scheduleJob(startDate, () => {
        log("Running job at " + new Date().toString());
        Product.completeOrders(order.product);
      });
    }

    log(`Scheduled ${Object.keys(scheduledJobs).length} jobs`);
  }
}
