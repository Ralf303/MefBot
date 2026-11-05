import { transferCurrency } from "../../services/currency-transfer-command.js";

export const giveDonate = (ctx) => transferCurrency(ctx, "donate");
