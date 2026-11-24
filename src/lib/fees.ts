import { PRICING } from "@/config/pricing";

export type FeeInput = {
  bountyIdr: number;
  postFeePaid?: boolean;
  postFeeIdr?: number;
  commissionRate?: number;
};

export type FeeBreakdown = {
  bountyIdr: number;
  commissionIdr: number;
  postFeeIdr: number;
  postFeeDueIdr: number;
  totalIdr: number;
};

function assertRupiah(name: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative whole number of rupiah, got ${value}`);
  }
}

// The poster pays bounty + commission + posting fee; the finder later receives the full bounty.
// When the posting fee was already paid with the report, it is shown but not charged again.
export function computeFees({
  bountyIdr,
  postFeePaid = false,
  postFeeIdr = PRICING.POST_FEE_IDR,
  commissionRate = PRICING.COMMISSION_RATE,
}: FeeInput): FeeBreakdown {
  assertRupiah("bountyIdr", bountyIdr);
  assertRupiah("postFeeIdr", postFeeIdr);
  if (!(commissionRate >= 0 && commissionRate < 1)) {
    throw new RangeError(`commissionRate must be in [0, 1), got ${commissionRate}`);
  }

  const commissionIdr = Math.round(bountyIdr * commissionRate);
  const postFeeDueIdr = postFeePaid ? 0 : postFeeIdr;

  return {
    bountyIdr,
    commissionIdr,
    postFeeIdr,
    postFeeDueIdr,
    totalIdr: bountyIdr + commissionIdr + postFeeDueIdr,
  };
}

export function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}
