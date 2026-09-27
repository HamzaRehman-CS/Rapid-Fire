import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://suqbfqjbdncwneuvoppr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cWJmcWpiZG5jd25ldXZvcHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0ODE1NjUsImV4cCI6MjEwNjA1NzU2NX0.pp4sE4rRTGz8cchPmKvsOYAErEtfv0SzYGlnNP58Xz8';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const EVENT_STATUS_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Saves a completed attempt to Supabase (and attempts local /api/save if running locally).
 */
export async function saveAttemptRecord({ attemptId, name, universityId, number, score, correct, wrong, attempted }) {
  const result = { savedToSupabase: false, savedToLocal: false, error: null };

  // 1. Save to Supabase
  if (supabase) {
    try {
      const { error } = await supabase.from('rapid_fire_attempts').insert([
        {
          id: attemptId,
          name: name.trim(),
          university_id: universityId.trim(),
          phone: number.trim(),
          score: Number(score) || 0,
          correct: Number(correct) || 0,
          wrong: Number(wrong) || 0,
          attempted: Number(attempted) || 0,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) {
        console.warn('Supabase save error:', error.message);
        result.error = error.message;
      } else {
        result.savedToSupabase = true;
      }
    } catch (err) {
      console.warn('Failed to reach Supabase:', err);
      result.error = err.message;
    }
  }

  // 2. Also attempt local Vite backend /api/save if available (for desktop Excel update)
  try {
    const localRes = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, name, universityId, number, score, correct, wrong, attempted })
    });
    if (localRes.ok) {
      result.savedToLocal = true;
    }
  } catch {
    // Expected on Vercel / static hosting where /api/save doesn't exist
  }

  // Return success if at least one storage succeeded
  if (result.savedToSupabase || result.savedToLocal) {
    return { ok: true, ...result };
  }

  throw new Error(result.error || 'Failed to record attempt to database.');
}

/**
 * Fetches public leaderboard entries and checks if the event is officially closed.
 * Note: Never includes phone numbers to safeguard participant privacy.
 */
export async function fetchLeaderboardEntries() {
  let isEventClosed = false;

  // Try Supabase first
  if (supabase) {
    try {
      // Check if event has been marked as closed by coordinator
      const { data: statusData } = await supabase
        .from('rapid_fire_attempts')
        .select('university_id')
        .eq('name', '__EVENT_STATUS__')
        .order('created_at', { ascending: false })
        .limit(1);

      if (statusData && statusData.length > 0 && statusData[0].university_id === 'CLOSED') {
        isEventClosed = true;
      }

      // Fetch participants (excluding any system marker rows)
      const { data, error } = await supabase
        .from('rapid_fire_attempts')
        .select('id, name, university_id, score, correct, wrong, attempted, created_at')
        .not('name', 'like', '__EVENT%')
        .order('score', { ascending: false })
        .order('correct', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && Array.isArray(data)) {
        return {
          isEventClosed,
          entries: data.map((row) => ({
            id: row.id,
            name: row.name,
            universityId: row.university_id,
            score: row.score,
            correct: row.correct,
            wrong: row.wrong,
            attempted: row.attempted,
            timestamp: row.created_at
          }))
        };
      }
    } catch (err) {
      console.warn('Supabase leaderboard fetch fallback:', err);
    }
  }

  // Fallback to local /api/leaderboard if available
  const response = await fetch('/api/leaderboard', { cache: 'no-store' });
  if (!response.ok) throw new Error('Leaderboard is currently unavailable.');
  const json = await response.json();
  return {
    isEventClosed: false,
    entries: json.entries || []
  };
}

/**
 * Marks the Rapid Fire event as officially closed in Supabase.
 * The public leaderboard will switch to the Official Top 5 Winners page.
 */
export async function closeEventSession() {
  if (!supabase) return;
  const { error } = await supabase.from('rapid_fire_attempts').insert([
    {
      id: crypto.randomUUID(),
      name: '__EVENT_STATUS__',
      university_id: 'CLOSED',
      phone: 'SYSTEM',
      score: -999999,
      correct: 0,
      wrong: 0,
      attempted: 0,
      created_at: new Date().toISOString()
    }
  ]);
  if (error) throw new Error(error.message);
}

/**
 * Re-opens the Rapid Fire event (in case coordinator wants to resume).
 */
export async function reopenEventSession() {
  if (!supabase) return;
  const { error } = await supabase.from('rapid_fire_attempts').insert([
    {
      id: crypto.randomUUID(),
      name: '__EVENT_STATUS__',
      university_id: 'OPEN',
      phone: 'SYSTEM',
      score: -999999,
      correct: 0,
      wrong: 0,
      attempted: 0,
      created_at: new Date().toISOString()
    }
  ]);
  if (error) throw new Error(error.message);
}

/**
 * Checks if the event is currently closed.
 */
export async function checkEventStatus() {
  if (!supabase) return false;
  try {
    const { data } = await supabase
      .from('rapid_fire_attempts')
      .select('university_id')
      .eq('name', '__EVENT_STATUS__')
      .order('created_at', { ascending: false })
      .limit(1);
    return data && data.length > 0 && data[0].university_id === 'CLOSED';
  } catch {
    return false;
  }
}

/**
 * Downloads a complete CSV of all participant records (Admin only).
 * Includes Name, University ID, Phone, Score, and Timestamps.
 */
export async function downloadAttemptsCsv() {
  let records = [];

  if (supabase) {
    const { data, error } = await supabase
      .from('rapid_fire_attempts')
      .select('*')
      .not('name', 'like', '__EVENT%')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    records = data || [];
  } else {
    // If supabase not present, try local api
    const response = await fetch('/api/leaderboard', { cache: 'no-store' });
    const json = await response.json();
    records = json.entries || [];
  }

  if (records.length === 0) {
    alert('No participant records to export yet.');
    return;
  }

  // Generate CSV rows
  const headers = ['Attempt ID', 'Participant Name', 'University ID', 'Phone Number', 'Score', 'Correct', 'Wrong', 'Attempted', 'Date/Time'];
  const csvRows = [headers.join(',')];

  for (const item of records) {
    const escapeCsv = (val) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const row = [
      escapeCsv(item.id || item.attemptId),
      escapeCsv(item.name),
      escapeCsv(item.university_id || item.universityId),
      escapeCsv(item.phone || item.number || 'N/A'),
      item.score ?? 0,
      item.correct ?? 0,
      item.wrong ?? 0,
      item.attempted ?? 0,
      escapeCsv(item.created_at || item.completedAt || item.timestamp || '')
    ];
    csvRows.push(row.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\r\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  const now = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `Science_Festa_Rapid_Fire_Attempts_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
