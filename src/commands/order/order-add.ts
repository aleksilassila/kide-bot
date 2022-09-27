import { Subcommand } from "../slash-command";
import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import Order from "../../models/Order";

export default class OrderAdd extends Subcommand {
  buildSubcommand(
    builderWithName: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    return builderWithName
      .setDescription("Add an order for an item")
      .addStringOption((option) =>
        option
          .setName("event-id")
          .setDescription(
            "The Kide event id, either paste the id or the event share link."
          )
          .setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("target-price")
          .setDescription("The item with closest price will be selected.")
          .setRequired(true)
      );
  }

  protected async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const product = await this.requireProduct(interaction);
    const user = await this.requireUser(interaction);
    const price = interaction.options.getNumber("target-price", true);

    if (!user || !product) return;

    const order = await Order.updateOrCreate(user, product, price);

    if (order) {
      await this.replyEphemeral(
        interaction,
        "Order placed in " +
          product.name +
          " for target price of " +
          price +
          "€"
      );
    } else {
      await this.replyEphemeral(interaction, "Could not place an order.");
    }
  }

  shouldDelayResponses(): boolean {
    return true;
  }

  getName(): string {
    return "add";
  }
}
