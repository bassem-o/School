import { supabase } from './supabaseClient'

export const delaysService = {
    // Get teacher's delay requests
    async getTeacherDelays(teacherId) {
        console.log('delaysService.getTeacherDelays: Starting query for teacherId:', teacherId);
        try {
            const { data, error } = await supabase
                .from('delay_requests')
                .select('*')
                .eq('teacher_id', teacherId)
                .order('date', { ascending: false })

            console.log('delaysService.getTeacherDelays: Query result:', { data, error });

            if (error) {
                console.error('delaysService.getTeacherDelays: Supabase error:', error);
                throw error;
            }

            return data
        } catch (err) {
            console.error('delaysService.getTeacherDelays: Caught error:', err);
            throw err;
        }
    },

    // Submit new delay request
    async submitDelayRequest(teacherId, teacherName, subject, classes, reason) {
        console.log('delaysService.submitDelayRequest: Starting submission:', { teacherId, teacherName, subject, classes, reason });
        try {
            const { data, error } = await supabase
                .from('delay_requests')
                .insert([
                    {
                        teacher_id: teacherId,
                        teacher_name: teacherName,
                        subject: subject,
                        classes: classes,
                        reason: reason,
                        status: 'pending'
                    }
                ])
                .select()
                .single()

            console.log('delaysService.submitDelayRequest: Insert result:', { data, error });

            if (error) throw error
            return data
        } catch (err) {
            console.error('delaysService.submitDelayRequest: Caught error:', err);
            throw err;
        }
    },

    // Delete delay request
    async deleteDelayRequest(requestId) {
        console.log('delaysService.deleteDelayRequest: Deleting request:', requestId);
        try {
            const { error } = await supabase
                .from('delay_requests')
                .delete()
                .eq('id', requestId)

            if (error) throw error
            return true
        } catch (err) {
            console.error('delaysService.deleteDelayRequest: Caught error:', err);
            throw err;
        }
    }
}
