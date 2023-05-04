import { Client, GatewayIntentBits } from "discord.js";
import { DISCORD_TOKEN } from "./config";
import { execute } from "./commands";
import { syncAllGuildsCommands } from "./deploy-commands";
import prisma from "./prisma";
import ReservationEvent from "./commands/events/reservation-event";

export const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  await syncAllGuildsCommands(client);
  await ReservationEvent.updateEvents();
});

client.on("guildCreate", async () => {
  await syncAllGuildsCommands(client);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  await execute(interaction);
});

client.login(DISCORD_TOKEN).then();
