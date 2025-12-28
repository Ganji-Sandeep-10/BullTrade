import z from 'zod';

const MAX_SLIPPAGE_PERCENT = Number(process.env.MAX_SLIPPAGE_PERCENT ?? 2);

export const openOrderSchema = z.object({
  asset: z.string(),
  side: z.enum(['LONG', 'SHORT']),
  quantity: z.number(),
  leverage: z.number().default(1),
  slippage: z.number().min(0).max(MAX_SLIPPAGE_PERCENT),
  tradeOpeningPrice: z.number(),
  takeProfit: z.number().optional(),
  stopLoss: z.number().optional(),
});

export const closeOrderSchema = z.object({
  orderId: z.string(),
});