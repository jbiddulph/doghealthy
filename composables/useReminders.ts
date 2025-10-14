import { useSupabase } from './useSupabase'
import { useAuthStore } from '~/stores/auth'

export const useReminders = () => {
  const supabase = useSupabase()
  const authStore = useAuthStore()

  // Check if reminders are enabled and user is authenticated
  const isRemindersEnabled = () => {
    if (!authStore.isAuthenticated) return false
    if (typeof window === 'undefined') return false
    
    // Check if user has enabled reminders (default: true)
    const enabled = localStorage.getItem('doghealthy_reminders_enabled')
    return enabled !== 'false'
  }

  // Check if we've already checked reminders today
  const hasCheckedToday = () => {
    if (typeof window === 'undefined') return true
    
    const lastCheck = localStorage.getItem('doghealthy_last_reminder_check')
    if (!lastCheck) return false
    
    const lastCheckDate = new Date(lastCheck)
    const today = new Date()
    
    return lastCheckDate.toDateString() === today.toDateString()
  }

  // Mark that we've checked reminders today
  const markCheckedToday = () => {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('doghealthy_last_reminder_check', new Date().toISOString())
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    
    return Notification.permission === 'granted'
  }

  // Show browser notification
  const showNotification = (title: string, message: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    
    new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      tag: 'doghealthy-reminder'
    })
  }

  // Check appointment reminders
  const checkAppointmentReminders = async () => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const { data: appointments, error } = await supabase
        .from('doghealthy_appointments')
        .select(`
          id,
          appointment_date,
          purpose,
          dog_id,
          user_id,
          dog:dog_id (
            name
          )
        `)
        .gte('appointment_date', tomorrow.toISOString().split('T')[0])
        .lt('appointment_date', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .eq('reminder_sent', false)

      if (error) throw error

      if (appointments && appointments.length > 0) {
        for (const appointment of appointments) {
          // Create notification in database
          await supabase
            .from('doghealthy_notifications')
            .insert({
              user_id: appointment.user_id,
              type: 'appointment',
              reference_id: appointment.dog_id,
              title: 'Appointment Reminder',
              message: `${appointment.dog?.name || 'Your dog'} has an appointment tomorrow: ${appointment.purpose || 'General checkup'}`,
              is_read: false,
              scheduled_for: new Date().toISOString()
            })

          // Show browser notification
          showNotification(
            'Appointment Reminder',
            `${appointment.dog?.name || 'Your dog'} has an appointment tomorrow: ${appointment.purpose || 'General checkup'}`
          )

          // Mark reminder as sent
          await supabase
            .from('doghealthy_appointments')
            .update({ reminder_sent: true })
            .eq('id', appointment.id)

          console.log(`Created appointment reminder for ${appointment.dog?.name}`)
        }
      }

      return appointments?.length || 0
    } catch (error) {
      console.error('Error checking appointment reminders:', error)
      return 0
    }
  }

  // Check medication reminders
  const checkMedicationReminders = async () => {
    try {
      const today = new Date()
      
      const { data: medications, error } = await supabase
        .from('doghealthy_medications')
        .select(`
          id,
          medication_name,
          dosage,
          frequency,
          dog_id,
          user_id,
          dog:dog_id (
            name
          )
        `)
        .eq('is_active', true)
        .eq('reminder_enabled', true)
        .lte('start_date', today.toISOString().split('T')[0])
        .or('end_date.is.null,end_date.gte.' + today.toISOString().split('T')[0])

      if (error) throw error

      if (medications && medications.length > 0) {
        for (const medication of medications) {
          // Create notification in database
          await supabase
            .from('doghealthy_notifications')
            .insert({
              user_id: medication.user_id,
              type: 'medication',
              reference_id: medication.dog_id,
              title: 'Medication Reminder',
              message: `Time to give ${medication.dog?.name || 'your dog'} their ${medication.medication_name} (${medication.dosage}) - ${medication.frequency}`,
              is_read: false,
              scheduled_for: new Date().toISOString()
            })

          // Show browser notification
          showNotification(
            'Medication Reminder',
            `Time to give ${medication.dog?.name || 'your dog'} their ${medication.medication_name} (${medication.dosage})`
          )

          console.log(`Created medication reminder for ${medication.dog?.name}`)
        }
      }

      return medications?.length || 0
    } catch (error) {
      console.error('Error checking medication reminders:', error)
      return 0
    }
  }

  // Check vaccination reminders
  const checkVaccinationReminders = async () => {
    try {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      
      const { data: vaccinations, error } = await supabase
        .from('doghealthy_vaccinations')
        .select(`
          id,
          vaccine_name,
          next_due_date,
          dog_id,
          user_id,
          dog:dog_id (
            name
          )
        `)
        .lte('next_due_date', nextWeek.toISOString().split('T')[0])
        .gte('next_due_date', new Date().toISOString().split('T')[0])
        .eq('reminder_sent', false)

      if (error) throw error

      if (vaccinations && vaccinations.length > 0) {
        for (const vaccination of vaccinations) {
          const dueDate = new Date(vaccination.next_due_date)
          const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          
          // Create notification in database
          await supabase
            .from('doghealthy_notifications')
            .insert({
              user_id: vaccination.user_id,
              type: 'vaccination',
              reference_id: vaccination.dog_id,
              title: 'Vaccination Due Soon',
              message: `${vaccination.dog?.name || 'Your dog'}'s ${vaccination.vaccine_name} vaccination is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
              is_read: false,
              scheduled_for: new Date().toISOString()
            })

          // Show browser notification
          showNotification(
            'Vaccination Due Soon',
            `${vaccination.dog?.name || 'Your dog'}'s ${vaccination.vaccine_name} vaccination is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
          )

          // Mark reminder as sent
          await supabase
            .from('doghealthy_vaccinations')
            .update({ reminder_sent: true })
            .eq('id', vaccination.id)

          console.log(`Created vaccination reminder for ${vaccination.dog?.name}`)
        }
      }

      return vaccinations?.length || 0
    } catch (error) {
      console.error('Error checking vaccination reminders:', error)
      return 0
    }
  }

  // Main function to check all reminders
  const checkAllReminders = async () => {
    if (!isRemindersEnabled()) {
      console.log('Reminders disabled or user not authenticated')
      return { appointments: 0, medications: 0, vaccinations: 0 }
    }

    if (hasCheckedToday()) {
      console.log('Already checked reminders today')
      return { appointments: 0, medications: 0, vaccinations: 0 }
    }

    try {
      console.log('Checking client-side reminders...')
      
      // Request notification permission if needed
      await requestNotificationPermission()
      
      // Check all types of reminders
      const appointments = await checkAppointmentReminders()
      const medications = await checkMedicationReminders()
      const vaccinations = await checkVaccinationReminders()
      
      // Mark that we've checked today
      markCheckedToday()
      
      const total = appointments + medications + vaccinations
      console.log(`Client-side reminders check completed: ${total} reminders created`)
      
      return { appointments, medications, vaccinations }
    } catch (error) {
      console.error('Error checking reminders:', error)
      return { appointments: 0, medications: 0, vaccinations: 0 }
    }
  }

  // Enable/disable reminders
  const setRemindersEnabled = (enabled: boolean) => {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('doghealthy_reminders_enabled', enabled.toString())
  }

  // Get reminder settings
  const getReminderSettings = () => {
    if (typeof window === 'undefined') return { enabled: true }
    
    return {
      enabled: localStorage.getItem('doghealthy_reminders_enabled') !== 'false',
      lastCheck: localStorage.getItem('doghealthy_last_reminder_check'),
      notificationsPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
    }
  }

  return {
    checkAllReminders,
    setRemindersEnabled,
    getReminderSettings,
    requestNotificationPermission,
    isRemindersEnabled,
    hasCheckedToday
  }
}
