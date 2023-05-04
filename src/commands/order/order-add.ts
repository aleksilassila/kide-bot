import {
  APIEmbed,
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import Order, { OrderFull } from "../../models/Order";
import { Subcommand } from "../subcommand";

const getEmbed = (order: OrderFull): APIEmbed => ({
  title: order.product.name,
  url: "https://kide.app/events/" + order.product.id,
  description: `Order successfully placed for **${order.product.name}**`,
  fields: [
    {
      name: "Target Price",
      value: `${order.targetPrice / 100}€`,
      inline: true,
    },
    {
      name: "Quantity",
      value: "1",
      inline: true,
    },
    ...(order.product.salesFrom
      ? [
          {
            name: "Sales Begin",
            value: new Date(order.product.salesFrom).toLocaleString("fi-Fi"),
            inline: true,
          },
        ]
      : []),
  ],
  color: 0x00ff00,
  ...(order.product.mediaFilename && {
    image: {
      url: `https://portalvhdsp62n0yt356llm.blob.core.windows.net/bailataan-mediaitems/${order.product.mediaFilename}`,
    },
  }),
});

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

  protected async onInteraction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const product = await this.requireProduct(interaction);
    const user = await this.requireUser(interaction);
    const price = interaction.options.getNumber("target-price", true);

    if (!user || !product) return;

    const order = await Order.updateOrCreate(user, product, price);

    if (order) {
      await interaction
        .editReply({
          embeds: [getEmbed(order)],
          options: {
            ephemeral: this.shouldReplyEphemeral(),
          },
        })
        .catch(console.error);
    } else {
      await this.reply(interaction, "Could not place an order.", true);
    }
  }

  shouldDelayResponses(): boolean {
    return true;
  }

  getName(): string {
    return "add";
  }
}
