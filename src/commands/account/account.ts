import { Command } from "../command";
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export default class Account extends Command {
  async buildCommand(): Promise<
    SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
  > {
    return new SlashCommandBuilder()
      .setName(this.getName())
      .setDescription("Get info about your account.");
  }

  getName(): string {
    return "account";
  }

  shouldReplyEphemeral(): boolean {
    return true;
  }

  protected async onInteraction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const user = await this.requireUser(interaction);

    if (!user) return;

    await this.reply(
      interaction,
      `You are logged in as ${user.fullName} (${user.email}).`,
      true
    );
  }
}
