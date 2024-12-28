export interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  staffCount: number;
}

export const MOCK_SHIFTS: Shift[] = [
  {
    id: '1',
    startTime: '6:00 AM',
    endTime: '2:00 PM',
    staffCount: 3,
  },
  {
    id: '2',
    startTime: '2:00 PM',
    endTime: '10:00 PM',
    staffCount: 2,
  },
];
