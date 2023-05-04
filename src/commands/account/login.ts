import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import User from "../../models/User";
import { Command } from "../command";

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

  protected async onInteraction(
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
      await this.reply(
        interaction,
        "Could not log in. Invalid credentials?",
        true
      );
      return;
    }

    await this.reply(
      interaction,
      `Successfully logged in as ${user.fullName}.`,
      true
    );
  }

  shouldDelayResponses(): boolean {
    return true;
  }

  getName(): string {
    return "login";
  }
}
