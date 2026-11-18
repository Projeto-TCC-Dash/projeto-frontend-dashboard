import { describe, it, expect } from "vitest"
import { setBudgetPlanSchema } from "./budget"

describe("lib/validations/budget", () => {
  it("validates positive global limit and at least one positive category budget", () => {
    const valid = setBudgetPlanSchema.safeParse({
      totalLimitAmount: 6500,
      categoryBudgets: [
        { category: "Moradia", limitAmount: 2500 },
        { category: "Alimentação", limitAmount: 1800 },
      ],
    })
    expect(valid.success).toBe(true)
  })

  it("rejects non-positive limits and empty categoryBudgets array", () => {
    const zeroGlobal = setBudgetPlanSchema.safeParse({
      totalLimitAmount: 0,
      categoryBudgets: [{ category: "Moradia", limitAmount: 2500 }],
    })
    expect(zeroGlobal.success).toBe(false)

    const emptyCats = setBudgetPlanSchema.safeParse({
      totalLimitAmount: 5000,
      categoryBudgets: [],
    })
    expect(emptyCats.success).toBe(false)

    const zeroCat = setBudgetPlanSchema.safeParse({
      totalLimitAmount: 5000,
      categoryBudgets: [{ category: "Moradia", limitAmount: -100 }],
    })
    expect(zeroCat.success).toBe(false)
  })
})
