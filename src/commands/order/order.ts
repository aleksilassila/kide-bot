import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import OrderAdd from "./order-add";
import OrderList from "./order-list";
import OrderRemove from "./order-remove";
import { CommandWithSubcommands } from "../command";
import { Subcommand } from "../subcommand";

export default class Order extends CommandWithSubcommands {
  async buildCommandWithSubcommands(
    builderWithName: SlashCommandBuilder
  ): Promise<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder> {
    return builderWithName.setDescription("Place an order on an item");
  }

  getName(): string {
    return "order";
  }

  getSubcommands(): Subcommand[] {
    return [new OrderAdd(), new OrderRemove(), new OrderList()];
  }
}
