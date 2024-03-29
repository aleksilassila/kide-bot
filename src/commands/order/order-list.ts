import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import prisma from "../../prisma";
import { Subcommand } from "../subcommand";

class OrderList extends Subcommand {
  buildSubcommand(
    builderWithName: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    return super.buildSubcommand(builderWithName);
  }

  async onInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = await this.requireUser(interaction);

    const orders = await prisma.order
      .findMany({
        where: {
          userId: user.id,
        },
        include: {
          product: true,
        },
      })
      .catch((err) => undefined);

    if (orders === undefined) {
      await this.reply(interaction, "Could not list orders.", true);
    } else if (orders.length === 0) {
      await this.reply(interaction, "You don't have any orders.", true);
    } else {
      let response = "Your current orders:\n";
      for (const order of orders) {
        response += `- **${order.product.name}** (${order.product.id}): ${
          order.targetPrice / 100
        }e\n`;
      }

      await this.reply(interaction, response, true);
    }
  }
}

export default new OrderList("list", "List all orders");
