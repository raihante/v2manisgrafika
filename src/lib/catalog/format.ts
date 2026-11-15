// Client-safe catalog helpers.
import type { Money } from "./types";

export const formatPrice = (amount: Money) => `Rp ${amount.toLocaleString("id-ID")}`;
