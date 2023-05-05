import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { AbstractCommand } from "./abstract-command";
import { Subcommand } from "./subcommand";

export abstract class Command extends AbstractCommand {
  buildCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}

export abstract class CommandWithSubcommands extends Command {
  abstract getSubcommands(): Subcommand[];

  getSubcommand(interaction: ChatInputCommandInteraction) {
    const input = interaction.options.getSubcommand();

    for (const subcommand of this.getSubcommands()) {
      if (subcommand.name === input) {
        return subcommand;
      }
    }
  }

  buildCommand(): SlashCommandBuilder {
    let builder = super.buildCommand() as SlashCommandSubcommandsOnlyBuilder;

    for (const subcommand of this.getSubcommands()) {
      builder = builder.addSubcommand((command) =>
        subcommand.buildSubcommand(command)
      );
    }

    return builder as SlashCommandBuilder;
  }

  async onInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = this.getSubcommand(interaction);

    if (subcommand) {
      await subcommand.onInteraction(interaction);
      return;
    }

    await this.reply(interaction, "Subcommand not found.");
  }

  shouldDelayResponses(interaction: ChatInputCommandInteraction) {
    const subcommand = this.getSubcommand(interaction);

    if (subcommand) {
      return subcommand.shouldDelayResponses(interaction);
    }

    return super.shouldDelayResponses(interaction);
  }
}
