# FOMO Firewall Product Spec

## Product category

Real-time Solana exit-liquidity detector powered by Birdeye Data.

## Problem

Most trader tools help users chase momentum. The dangerous moment is when a token is already green, public attention is rising, and high-quality wallets are quietly leaving. Retail users see a pump; insiders may see an exit window.

## Solution

FOMO Firewall monitors trending Solana tokens and calculates a transparent TrapScore from 0 to 100.

- 0-30: Clean Pump
- 31-60: Risky Chase
- 61-80: Exit Warning
- 81-100: Critical Trap

## Main user question

"Is this pump safe to chase, or am I becoming exit liquidity?"

## Core signals

1. Smart Money Divergence
   - Price is up while smart wallets are net-selling.
2. Insider Exit Pressure
   - Insider, dev, or related wallets are reducing exposure.
3. Liquidity Fragility
   - Liquidity is falling while price is up.
4. Sell Pressure While Price Is Green
   - Sell volume rises despite positive price action.
5. Holder Concentration Risk
   - Top holders control too much supply.
6. Static Token Risk
   - Mutable metadata, freeze authority, transfer fees, token authority risks.
7. Abnormal Volume/Liquidity Ratio
   - Volume is too high relative to available liquidity.

## MVP dashboard sections

- Highest TrapScore
- Clean Pumps
- Smart Money Divergence
- Insider Exit Pressure
- Liquidity Drain Alerts
- Recently Triggered Alerts
- Token Case Files

## Token case file

Each token should show:

- Current verdict
- TrapScore
- Price, volume, liquidity, market cap
- Smart wallet netflow
- Insider/dev netflow
- Top holder concentration
- Token security flags
- Timeline of score changes
- Explainable reasons
- Telegram alert preview

## Non-goals

- No auto trading
- No wallet signing
- No portfolio management
- No generic meme radar
- No generic rug checker
- No black-box AI score
