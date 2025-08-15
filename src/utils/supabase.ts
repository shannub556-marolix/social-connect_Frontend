import { createClient } from '@supabase/supabase-js';

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase environment variables are not set. Please add the following to your .env file:\n' +
    'VITE_SUPABASE_URL=your_supabase_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n' +
    'Real-time notifications will not work without these variables.'
  );
}

// Create Supabase client only if environment variables are available
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const subscribeToNotifications = (userId: number, onNotification: (notification: any) => void) => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Cannot subscribe to notifications. Please check your .env file.');
    return () => {};
  }

  try {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      }, (payload) => {
        console.log('New notification received:', payload.new);
        onNotification(payload.new);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to notifications');
        }
      });

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  } catch (error) {
    console.error('Error setting up notification subscription:', error);
    return () => {};
  }
};

export const unsubscribeFromNotifications = (channel: any) => {
  if (channel && supabase) {
    supabase.removeChannel(channel);
  }
};
