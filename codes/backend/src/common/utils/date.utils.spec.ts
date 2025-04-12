import { getToday } from "./date.utils";

describe("getToday", () => {
  it("should return current date in YYYY-MM-DD format", () => {
    // Mock date to a specific value
    const mockDate = new Date("2025-04-12T15:23:00Z");
    jest
      .spyOn(global, "Date")
      .mockImplementation(() => mockDate as unknown as Date);

    const result = getToday();
    expect(result).toBe("2025-04-12");

    jest.restoreAllMocks();
  });
});
