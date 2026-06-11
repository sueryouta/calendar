import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ffmmyjofuamfzbjoexnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbW15am9mdWFtZnpiam9leG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODAzMzIsImV4cCI6MjA5Njc1NjMzMn0.eq3GewXou2YxravQrefLXI_CGTDilb8993WF5CdqPKU'
)
