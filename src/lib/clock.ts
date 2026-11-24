let mockTime: Date | null = null;

export const clock = {
  now(): Date {
    return mockTime ? new Date(mockTime.getTime()) : new Date();
  },
  nowIso(): string {
    return this.now().toISOString();
  },
  setMockTime(date: Date | string | null) {
    mockTime = date ? (typeof date === 'string' ? new Date(date) : date) : null;
  },
};
