import { transferCurrency } from "../../services/currency-transfer-command.js";

export const giveStars = (ctx) => transferCurrency(ctx, "balance", 1);
