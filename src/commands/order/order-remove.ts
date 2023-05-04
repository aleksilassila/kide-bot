import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import Order from "../../models/Order";
import { Subcommand } from "../subcommand";

export default class OrderRemove extends Subcommand {
  buildSubcommand(
    builderWithName: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    return builderWithName
      .setDescription("Remove all orders based on Kide event id.")
      .addStringOption((option) =>
        option
          .setName("event-id")
          .setDescription(
            "The Kide event id, either paste the id or the event share link."
          )
          .setRequired(true)
      );
  }

  protected async onInteraction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const user = await this.requireUser(interaction);
    const product = await this.requireProduct(interaction);

    if (!user || !product) return;

    const removedCount = await Order.remove(user, product);

    if (removedCount === undefined) {
      await this.reply(interaction, "Could not remove orders.", true);
    } else {
      await this.reply(
        interaction,
        `Removed ${removedCount} orders for **${product.name}**.`,
        true
      );
    }
  }

  getName(): string {
    return "remove";
  }
}
