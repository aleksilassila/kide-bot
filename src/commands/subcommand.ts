import {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandSubcommandBuilder,
  TextChannel,
} from "discord.js";
import { AbstractCommand } from "./abstract-command";

export abstract class Subcommand extends AbstractCommand {
  abstract buildSubcommand(
    builderWithName: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder;
}

export abstract class SubcommandWithGuild extends Subcommand {
  async onInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = await this.requireGuild(interaction);
    if (!guild) return;
    await this.executeWithGuild(interaction, guild);
  }

  abstract executeWithGuild(
    interaction: ChatInputCommandInteraction,
    guild: Guild
  ): Promise<void>;
}

export abstract class SubcommandWithChannel extends SubcommandWithGuild {
  shouldReplyEphemeral(): boolean {
    return true;
  }

  async executeWithGuild(
    interaction: ChatInputCommandInteraction,
    guild: Guild
  ): Promise<void> {
    const channel = await this.requireGuildTextChannel(interaction);
    if (!channel) return;
    await this.executeWithChannel(interaction, guild, channel);
  }

  abstract executeWithChannel(
    interaction: ChatInputCommandInteraction,
    guild: Guild,
    channel: TextChannel
  ): Promise<void>;
}
