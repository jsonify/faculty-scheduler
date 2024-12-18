// lib/api.ts
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Employee, TimeBlock } from '@/types/schedule'

export async function getEmployees(): Promise<Employee[]> {
  const { data: employees, error } = await supabase
    .from('employees')
    .select(`
      id,
      name,
      role,
      schedules (
        hour,
        is_active
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching employees:', error)
    return []
  }

  return employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    role: emp.role,
    schedule: (emp.schedules || []).map(schedule => ({
      hour: schedule.hour,
      isActive: schedule.is_active
    })),
    availability: [] // We'll implement this later
  }))
}

export async function updateEmployeeSchedule(
  employeeId: string,
  currentHour: number,
  newHour: number
): Promise<boolean> {
  const { error: deactivateError } = await supabase
    .from('schedules')
    .update({ is_active: false })
    .match({ employee_id: employeeId, hour: currentHour })

  if (deactivateError) {
    console.error('Error deactivating schedule:', deactivateError)
    return false
  }

  const { error: activateError } = await supabase
    .from('schedules')
    .upsert({
      employee_id: employeeId,
      hour: newHour,
      is_active: true
    })

  if (activateError) {
    console.error('Error activating schedule:', activateError)
    return false
  }

  return true
}

export async function addEmployee(name: string, role: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('employees')
    .insert({ name, role })
    .select()
    .single()

  if (error) {
    console.error('Error adding employee:', error)
    return null
  }

  return data.id
}

export async function getShifts(date: string) {
  const { data: shifts, error } = await supabase
    .from('shifts')
    .select(`
      *,
      breaks (*)
    `)
    .eq('date', date)
    .order('start_time')

  if (error) {
    console.error('Error fetching shifts:', error)
    return []
  }

  return shifts
}

export async function addShift(
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      employee_id: employeeId,
      date,
      start_time: startTime,
      end_time: endTime
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding shift:', error)
    return null
  }

  return data
}