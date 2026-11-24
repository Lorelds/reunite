import { describe, expect, it } from "vitest";
import { computeFees, formatRupiah } from "@/lib/fees";
import { PRICING } from "@/config/pricing";

describe("computeFees", () => {
  it("charges only the posting fee when there is no bounty", () => {
    expect(computeFees({ bountyIdr: 0 })).toEqual({
      bountyIdr: 0,
      commissionIdr: 0,
      postFeeIdr: PRICING.POST_FEE_IDR,
      postFeeDueIdr: PRICING.POST_FEE_IDR,
      totalIdr: PRICING.POST_FEE_IDR,
    });
  });

  it("adds 10% commission and the posting fee to a 5.000.000 bounty", () => {
    expect(computeFees({ bountyIdr: 5_000_000 })).toEqual({
      bountyIdr: 5_000_000,
      commissionIdr: 500_000,
      postFeeIdr: 150_000,
      postFeeDueIdr: 150_000,
      totalIdr: 5_650_000,
    });
  });

  it("does not charge the posting fee twice", () => {
    expect(computeFees({ bountyIdr: 5_000_000, postFeePaid: true }).totalIdr).toBe(5_500_000);
  });

  it("follows a changed POST_FEE_IDR", () => {
    const fees = computeFees({ bountyIdr: 5_000_000, postFeeIdr: 75_000 });
    expect(fees.postFeeIdr).toBe(75_000);
    expect(fees.totalIdr).toBe(5_575_000);
  });

  it("rejects fractional or negative rupiah", () => {
    expect(() => computeFees({ bountyIdr: 100.5 })).toThrow(RangeError);
    expect(() => computeFees({ bountyIdr: -1 })).toThrow(RangeError);
  });
});

describe("formatRupiah", () => {
  it("uses Indonesian thousand separators", () => {
    expect(formatRupiah(5_650_000)).toBe("Rp 5.650.000");
  });
});
