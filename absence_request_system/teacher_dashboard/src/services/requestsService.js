import { supabase } from './supabaseClient'

export const requestsService = {
    // Get teacher's requests
    async getTeacherRequests(teacherId) {
        console.log('requestsService.getTeacherRequests: Starting query for teacherId:', teacherId);
        try {
            const { data, error } = await supabase
                .from('absence_requests')
                .select('*')
                .eq('teacher_id', teacherId)
                .order('date', { ascending: false })

            console.log('requestsService.getTeacherRequests: Query result:', { data, error });

            if (error) {
                console.error('requestsService.getTeacherRequests: Supabase error:', error);
                throw error;
            }

            return data
        } catch (err) {
            console.error('requestsService.getTeacherRequests: Caught error:', err);
            throw err;
        }
    },

    // Submit new request
    async submitRequest(teacherId, teacherName, reason) {
        console.log('requestsService.submitRequest: Starting submission:', { teacherId, teacherName, reason });
        try {
            // First get teacher details to include subject and classes
            const { data: teacherDetails, error: teacherError } = await supabase
                .from('teachers')
                .select('subject, classes')
                .eq('user_id', teacherId)
                .single()

            console.log('requestsService.submitRequest: Teacher details:', { teacherDetails, teacherError });

            if (teacherError) throw teacherError

            const { data, error } = await supabase
                .from('absence_requests')
                .insert([
                    {
                        teacher_id: teacherId,
                        teacher_name: teacherName,
                        subject: teacherDetails.subject,
                        classes: teacherDetails.classes,
                        reason: reason,
                        status: 'pending'
                    }
                ])
                .select()
                .single()

            console.log('requestsService.submitRequest: Insert result:', { data, error });

            if (error) throw error
            return data
        } catch (err) {
            console.error('requestsService.submitRequest: Caught error:', err);
            throw err;
        }
    },

    // Get teacher details (helper)
    async getTeacherDetails(userId) {
        console.log('requestsService.getTeacherDetails: Fetching for userId:', userId);
        try {
            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('user_id', userId)
                .single()

            console.log('requestsService.getTeacherDetails: Result:', { data, error });

            if (error) throw error
            return data
        } catch (err) {
            console.error('requestsService.getTeacherDetails: Caught error:', err);
            throw err;
        }
    },

    // Delete request
    async deleteRequest(requestId) {
        console.log('requestsService.deleteRequest: Deleting request:', requestId);
        try {
            const { error } = await supabase
                .from('absence_requests')
                .delete()
                .eq('id', requestId)

            if (error) throw error
            return true
        } catch (err) {
            console.error('requestsService.deleteRequest: Caught error:', err);
            throw err;
        }
    }
}
