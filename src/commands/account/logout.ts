import { Command } from "../command";
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import User from "../../models/User";

export default class Logout extends Command {
  async buildCommand(): Promise<
    SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
  > {
    return new SlashCommandBuilder()
      .setName(this.getName())
      .setDescription(
        "Log out and remove your credentials from the bot's database."
      );
  }

  getName(): string {
    return "logout";
  }

  protected async onInteraction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const user = await this.requireUser(interaction);
    if (!user) return;

    const deleted = await User.destroy(user);

    if (!deleted) {
      await this.reply(interaction, "Sorry, something went wrong.", true);
      return;
    }

    await this.reply(interaction, "Successfully logged out.", true);
  }

  shouldReplyEphemeral(): boolean {
    return true;
  }
}
