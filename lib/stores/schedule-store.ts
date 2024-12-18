// lib/stores/schedule-store.ts
import { create } from 'zustand'
import { Employee } from '@/types/schedule'
import { getEmployees, updateEmployeeSchedule } from '@/lib/api'
import { BUSINESS_HOURS } from '@/lib/constants'

interface ScheduleState {
  employees: Employee[]
  loading: boolean
  error: string | null
  fetchEmployees: () => Promise<void>
  updateEmployeeSchedule: (
    employeeId: string,
    currentHour: number,
    newHour: number
  ) => Promise<void>
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null })
    try {
      const employees = await getEmployees()
      set({ employees, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch employees', loading: false })
    }
  },

  updateEmployeeSchedule: async (employeeId, currentHour, newHour) => {
    // Only update if within business hours
    if (newHour < BUSINESS_HOURS.START || newHour >= BUSINESS_HOURS.END) {
      return
    }

    try {
      const success = await updateEmployeeSchedule(employeeId, currentHour, newHour)
      if (success) {
        // Refresh employees data
        await get().fetchEmployees()
      }
    } catch (error) {
      set({ error: 'Failed to update schedule' })
    }
  }
}))