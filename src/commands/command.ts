import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { AbstractCommand } from "./abstract-command";
import { Subcommand } from "./subcommand";

export abstract class Command extends AbstractCommand {
  abstract buildCommand(): Promise<
    SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
  >;
}

export abstract class CommandWithSubcommands extends Command {
  abstract getSubcommands(): Subcommand[];

  shouldDelayResponses(): boolean {
    return false;
  }

  abstract buildCommandWithSubcommands(
    builderWithName: SlashCommandBuilder
  ): Promise<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder>;

  protected onInteraction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    return this.executeSubcommand(interaction);
  }

  async buildCommand(): Promise<
    SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
  > {
    let builder = await this.buildCommandWithSubcommands(
      new SlashCommandBuilder().setName(this.getName())
    );

    for (const subcommand of this.getSubcommands()) {
      builder = builder.addSubcommand((command) =>
        subcommand.buildSubcommand(command).setName(subcommand.getName())
      );
    }

    return builder;
  }

  async executeSubcommand(interaction: ChatInputCommandInteraction) {
    const input = interaction.options.getSubcommand();

    for (const subcommand of this.getSubcommands()) {
      if (subcommand.getName() === input) {
        await subcommand.executeCommand(interaction);
        return;
      }
    }

    await this.reply(interaction, "Subcommand not found.");
  }
}
