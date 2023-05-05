import orderAdd from "./order-add";
import orderList from "./order-list";
import orderRemove from "./order-remove";
import { CommandWithSubcommands } from "../command";
import { Subcommand } from "../subcommand";

class Order extends CommandWithSubcommands {
  getSubcommands(): Subcommand[] {
    return [orderAdd, orderRemove, orderList];
  }
}

export default new Order("order", "Manage your orders.");
