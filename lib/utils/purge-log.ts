// lib/utils/purge-log.ts
import { supabase } from '@/lib/supabase';

export interface PurgeLogOptions {
  purgeLevel: 'soft' | 'hard' | 'complete';
  role: 'teacher' | 'para-educator' | 'all';
  initiatedBy?: string; // Optional user ID
  recordsAffected?: number;
  backupCreated?: boolean;
}

/**
 * Log a data purge operation
 * @param options Purge operation details
 * @returns Purge log entry or null if logging fails
 */
export async function logPurgeOperation(options: PurgeLogOptions) {
  try {
    const { data, error } = await supabase
      .from('data_purge_log')
      .insert({
        purge_level: options.purgeLevel,
        role: options.role,
        initiated_by: options.initiatedBy,
        records_affected: options.recordsAffected,
        backup_created: options.backupCreated
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error logging purge operation:', error);
    return null;
  }
}

/**
 * Retrieve purge logs with optional filtering
 * @param options Optional filtering options
 * @returns Array of purge log entries
 */
export async function getPurgeLogs(options: {
  role?: 'teacher' | 'para-educator' | 'all';
  startDate?: Date;
  endDate?: Date;
} = {}) {
  try {
    let query = supabase
      .from('data_purge_log')
      .select('*')
      .order('initiated_at', { ascending: false });

    // Apply role filter if specified
    if (options.role) {
      query = query.eq('role', options.role);
    }

    // Apply date range if specified
    if (options.startDate) {
      query = query.gte('initiated_at', options.startDate.toISOString());
    }
    if (options.endDate) {
      query = query.lte('initiated_at', options.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error retrieving purge logs:', error);
    return [];
  }
}