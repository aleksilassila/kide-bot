import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import User from "../../models/User";
import { Command } from "../command";

class Login extends Command {
  buildCommand() {
    return super
      .buildCommand()
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
      ) as SlashCommandBuilder;
  }

  async onInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
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

  shouldDelayResponses(interaction: ChatInputCommandInteraction) {
    return true;
  }
}

export default new Login(
  "login",
  "Use this command to log in with your Kide account."
);
