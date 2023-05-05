import { Command } from "../command";
import { ChatInputCommandInteraction } from "discord.js";
import User from "../../models/User";

class Logout extends Command {
  async onInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = await this.requireUser(interaction);

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

export default new Logout(
  "logout",
  "Log out and remove your credentials from the bot's database."
);
