import { Subcommand } from "../slash-command";
import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import prisma from "../../prisma";

export default class OrderList extends Subcommand {
  buildSubcommand(
    builderWithName: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    return builderWithName.setDescription("List all orders");
  }

  protected async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const user = await this.requireUser(interaction);

    if (!user) return;

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
      await this.replyEphemeral(interaction, "Could not list orders.");
    } else if (orders.length === 0) {
      await this.replyEphemeral(interaction, "You don't have any orders.");
    } else {
      let response = "Your current orders:\n";
      for (const order of orders) {
        response += `- **${order.product.name}** (${order.product.id}): ${
          order.targetPrice / 100
        }e\n`;
      }

      await this.replyEphemeral(interaction, response);
    }
  }

  getName(): string {
    return "list";
  }
}
