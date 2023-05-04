import {
  ChatInputCommandInteraction,
  Guild,
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  TextChannel,
} from "discord.js";
import Product from "../models/Product";
import { Product as PrismaProduct, User as PrismaUser } from "@prisma/client";
import prisma from "../prisma";

export abstract class AbstractCommand {
  abstract getName(): string;
  async executeCommand(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    if (this.shouldDelayResponses()) {
      await interaction.deferReply({ ephemeral: this.shouldReplyEphemeral() });
    }

    return await this.onInteraction(interaction);
  }

  protected abstract onInteraction(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;

  shouldDelayResponses() {
    return true;
  }

  shouldReplyEphemeral() {
    return false;
  }
  async reply(
    interaction: ChatInputCommandInteraction,
    content: string,
    ephemeral: boolean = false
  ): Promise<void | Message | InteractionResponse> {
    if (this.shouldDelayResponses()) {
      return interaction
        .editReply({ content, options: { ephemeral } })
        .catch(console.error);
    } else {
      return interaction.reply({ content, ephemeral }).catch(console.error);
    }
  }

  async requireGuild(
    interaction: ChatInputCommandInteraction
  ): Promise<Guild | null> {
    const guild = interaction.guild;
    if (!guild)
      await this.reply(
        interaction,
        "This command can only be used in a server.",
        true
      );
    return guild;
  }

  async requireGuildTextChannel(
    interaction: ChatInputCommandInteraction
  ): Promise<TextChannel | undefined> {
    const channel = interaction.channel;
    if (!channel) {
      await this.reply(
        interaction,
        "This command can only be used in server's text channel.",
        true
      );
      return;
    }
    return <TextChannel>channel;
  }

  async requireProduct(
    interaction: ChatInputCommandInteraction
  ): Promise<PrismaProduct | undefined> {
    const eventId = interaction.options.getString("event-id");

    if (!eventId) {
      await this.reply(interaction, "This command requires event id.", true);
      return;
    }

    const splitId = eventId.split("/");
    const productId = splitId[splitId.length - 1];

    const product = await Product.getOrCreate(productId);

    if (!product) {
      await this.reply(
        interaction,
        "Sorry, could not fetch event at this time. Invalid event id?",
        true
      );
    }

    return product;
  }

  async requireUser(
    interaction: ChatInputCommandInteraction
  ): Promise<PrismaUser | undefined> {
    const user = await prisma.user
      .findUnique({
        where: {
          discordId: interaction.user.id,
        },
      })
      .catch((err) => undefined);

    if (!user) {
      await this.reply(
        interaction,
        "It seems like you haven't logged in with Kide yet. Try /login first.",
        true
      );
      return;
    }

    return user;
  }
}
