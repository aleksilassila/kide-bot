import { Command } from "../slash-command";
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import User from "../../models/User";

export default class Login extends Command {
  async buildCommand(): Promise<SlashCommandBuilder | any> {
    return new SlashCommandBuilder()
      .setName(this.getName())
      .setDescription("Use this command to log in with your Kide account.")
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("Your Kide username")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("password")
          .setDescription("Your Kide password.")
          .setRequired(true)
      );
  }

  protected async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const username = interaction.options.getString("username", true);
    const password = interaction.options.getString("password", true);

    const user = await User.createOrUpdate(
      username,
      password,
      interaction.user.id
    );

    if (!user) {
      await this.replyEphemeral(
        interaction,
        "Could not log in. Invalid credentials?"
      );
      return;
    }

    await this.replyEphemeral(
      interaction,
      `Successfully logged in as ${user.fullName}.`
    );
  }

  shouldDelayResponses(): boolean {
    return true;
  }

  getName(): string {
    return "login";
  }
}
