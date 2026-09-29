/**
 * What a price block should say, given whether its introductory offer is still
 * open.
 *
 * This is separated from the component on purpose. The switch happens in the
 * browser, after mount, so nothing about it is visible in server-rendered HTML
 * and it cannot be checked by fetching the page. Keeping the decision here, as
 * a plain function with no React in it, means the behaviour that matters can
 * actually be tested rather than reasoned about.
 */

export type PriceView = {
  /** The large figure. */
  headlineUSD: number;
  /** The line under it, e.g. "per month for your first 9 months". */
  headlineUnit: string;
  /** The step up, or undefined once there is nothing to step up to. */
  stepUpUSD: number | undefined;
};

export function priceView(input: {
  /** The introductory amount, while the offer is open. */
  amountUSD: number;
  /** What the introductory amount buys. */
  unit: string;
  /** The standing price, if the introductory one steps up to something. */
  thenUSD?: number;
  /** What the standing price buys once the offer has closed. */
  standingUnit: string;
  /** Whether the offer has closed. */
  closed: boolean;
}): PriceView {
  const { amountUSD, unit, thenUSD, standingUnit, closed } = input;

  // With no standing price there is no offer to close, so the headline is the
  // only price there has ever been and the date is irrelevant.
  if (thenUSD === undefined) {
    return { headlineUSD: amountUSD, headlineUnit: unit, stepUpUSD: undefined };
  }

  if (closed) {
    return {
      headlineUSD: thenUSD,
      headlineUnit: standingUnit,
      stepUpUSD: undefined,
    };
  }

  return { headlineUSD: amountUSD, headlineUnit: unit, stepUpUSD: thenUSD };
}

/**
 * Whether an offer has closed. Separated for the same reason: a date
 * comparison that decides what price a page advertises is worth testing at
 * both ends rather than only on the day it was written.
 */
export function offerHasClosed(now: number, endsAt: number | undefined): boolean {
  if (endsAt === undefined) return false;
  return now >= endsAt;
}
