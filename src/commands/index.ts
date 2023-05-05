import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import login from "./account/login";
import order from "./order/order";
import { Command } from "./command";
import logout from "./account/logout";
import account from "./account/account";
import ValidationError from "./validation-error";

export const commands: Command[] = [login, logout, account, order];

export async function execute(interaction: CommandInteraction) {
  const commandName = interaction.commandName;

  if (!interaction.isChatInputCommand()) {
    await interaction.reply("Unknown interaction type.").catch(console.error);
    return;
  }

  for (const command of commands) {
    if (command.name === commandName) {
      if (command.shouldDelayResponses(interaction)) {
        await interaction.deferReply({ ephemeral: true });
      }

      try {
        await command.onInteraction(<ChatInputCommandInteraction>interaction);
      } catch (error) {
        if (error instanceof ValidationError) {
          await command.reply(interaction, error.message, true);
        } else {
          console.error("Error occurred while executing command: ", error);

          await command
            .reply(
              interaction,
              "There was an error while executing this command",
              true
            )
            .catch((err) =>
              console.error("Error while reporting another error :D", err)
            );
        }
      }
      return;
    }
  }

  await interaction
    .reply({ content: "Command not found.", ephemeral: true })
    .catch(console.error);
}
