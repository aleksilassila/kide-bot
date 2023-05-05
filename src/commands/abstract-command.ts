import {
  ChatInputCommandInteraction,
  Guild,
  InteractionResponse,
  Message,
  TextChannel,
} from "discord.js";
import Product from "../models/Product";
import { Product as PrismaProduct, User as PrismaUser } from "@prisma/client";
import prisma from "../prisma";
import ValidationError from "./validation-error";

export abstract class AbstractCommand {
  name: string;
  description: string;

  constructor(name: string, description: string = "") {
    this.name = name;
    this.description = description;
  }

  abstract onInteraction(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;

  shouldDelayResponses(interaction: ChatInputCommandInteraction) {
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
    if (this.shouldDelayResponses(interaction)) {
      return interaction
        .editReply({ content, options: { ephemeral } })
        .catch(console.error);
    } else {
      return interaction.reply({ content, ephemeral }).catch(console.error);
    }
  }

  async requireGuild(interaction: ChatInputCommandInteraction): Promise<Guild> {
    const guild = interaction.guild;
    if (!guild)
      throw new ValidationError("This command can only be used in a server.");
    return guild;
  }

  async requireGuildTextChannel(
    interaction: ChatInputCommandInteraction
  ): Promise<TextChannel> {
    const channel = interaction.channel;
    if (!channel) {
      throw new ValidationError(
        "This command can only be used in server's text channel."
      );
    }
    return channel as TextChannel;
  }

  async requireProduct(
    interaction: ChatInputCommandInteraction
  ): Promise<PrismaProduct> {
    const eventId = interaction.options.getString("event-id");

    if (!eventId) {
      throw new ValidationError("This command requires event id.");
    }

    const splitId = eventId.split("/");
    const productId = splitId[splitId.length - 1];

    const product = await Product.getOrCreate(productId);

    if (!product) {
      throw new ValidationError(
        "Sorry, could not fetch event at this time. Invalid event id?"
      );
    }

    return product;
  }

  async requireUser(
    interaction: ChatInputCommandInteraction
  ): Promise<PrismaUser> {
    const user = await prisma.user
      .findUnique({
        where: {
          discordId: interaction.user.id,
        },
      })
      .catch((err) => undefined);

    if (!user) {
      throw new ValidationError(
        "It seems like you haven't logged in with Kide yet. Try /login first."
      );
    }

    return user;
  }
}
