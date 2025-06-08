import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grjogszqtojhuuhfnbye.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyam9nc3pxdG9qaHV1aGZuYnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYxMjIsImV4cCI6MjA2NDY0MjEyMn0.yfreyWRzNvVxPpkl0NJqYt5903_ODZRwN18K8UNQ8CY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)