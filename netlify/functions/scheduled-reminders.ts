import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const handler: Handler = async (event, context) => {
  // Allow both scheduled events and manual testing
  if (event.headers['x-netlify-scheduled'] !== 'true' && process.env.NODE_ENV === 'production') {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden' })
    }
  }

  try {
    console.log('Starting scheduled reminders check...')
    
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Check for appointments within next 24 hours
    await checkAppointmentReminders(tomorrow)
    
    // Check for medications due today
    await checkMedicationReminders(today)
    
    // Check for vaccinations due next week
    await checkVaccinationReminders(nextWeek)

    console.log('Scheduled reminders check completed successfully')
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Reminders processed successfully',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Error in scheduled reminders:', error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

async function checkAppointmentReminders(reminderDate: Date) {
  try {
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
      .gte('appointment_date', reminderDate.toISOString().split('T')[0])
      .lt('appointment_date', new Date(reminderDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .eq('reminder_sent', false)

    if (error) throw error

    console.log(`Found ${appointments?.length || 0} appointments needing reminders`)

    if (appointments && appointments.length > 0) {
      for (const appointment of appointments) {
        // Create notification
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

        // Mark reminder as sent
        await supabase
          .from('doghealthy_appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id)

        console.log(`Created appointment reminder for ${appointment.dog?.name}`)
      }
    }
  } catch (error) {
    console.error('Error checking appointment reminders:', error)
  }
}

async function checkMedicationReminders(today: Date) {
  try {
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

    console.log(`Found ${medications?.length || 0} medications needing reminders`)

    if (medications && medications.length > 0) {
      for (const medication of medications) {
        // Create notification
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

        console.log(`Created medication reminder for ${medication.dog?.name}`)
      }
    }
  } catch (error) {
    console.error('Error checking medication reminders:', error)
  }
}

async function checkVaccinationReminders(nextWeek: Date) {
  try {
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

    console.log(`Found ${vaccinations?.length || 0} vaccinations needing reminders`)

    if (vaccinations && vaccinations.length > 0) {
      for (const vaccination of vaccinations) {
        const dueDate = new Date(vaccination.next_due_date)
        const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        // Create notification
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

        // Mark reminder as sent
        await supabase
          .from('doghealthy_vaccinations')
          .update({ reminder_sent: true })
          .eq('id', vaccination.id)

        console.log(`Created vaccination reminder for ${vaccination.dog?.name}`)
      }
    }
  } catch (error) {
    console.error('Error checking vaccination reminders:', error)
  }
}
