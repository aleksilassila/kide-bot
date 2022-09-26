import { Command } from "./slash-command";
import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import Login from "./login/login";
import Order from "./order/order";

export function getCommands(): Command[] {
  return [new Login(), new Order()];
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
        console.error(error);
        await interaction
          .reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          })
          .catch(console.error);
      }
      return;
    }
  }

  await interaction.reply("Command not found.").catch(console.error);
}
