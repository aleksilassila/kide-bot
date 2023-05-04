import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import Login from "./account/login";
import Order from "./order/order";
import { Command } from "./command";
import Logout from "./account/logout";
import Account from "./account/account";

export function getCommands(): Command[] {
  return [new Login(), new Logout(), new Account(), new Order()];
}

export async function execute(interaction: CommandInteraction) {
  const commandName = interaction.commandName;

  const commands = getCommands();

  if (!interaction.isChatInputCommand()) {
    await interaction.reply("Unknown interaction type.").catch(console.error);
    return;
  }

  for (const command of commands) {
    if (command.getName() === commandName) {
      try {
        await command.executeCommand(<ChatInputCommandInteraction>interaction);
      } catch (error) {
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
      return;
    }
  }

  await interaction
    .reply({ content: "Command not found.", ephemeral: true })
    .catch(console.error);
}
