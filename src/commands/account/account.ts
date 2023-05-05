import { Command } from "../command";
import { ChatInputCommandInteraction } from "discord.js";

class Account extends Command {
  async onInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = await this.requireUser(interaction);

    await this.reply(
      interaction,
      `You are logged in as ${user.fullName} (${user.email}).`,
      true
    );
  }
}

export default new Account("account", "Get info about your account.");
