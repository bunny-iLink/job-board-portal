// utils/jobCounters.js

import  { Job }  from '../models/jobs.js'; // adjust path to your Job model

export const changeApplicantCount = async (jobId, action = 'inc') => {
    try {
        const incrementValue = action === 'dec' ? -1 : 1;

        const result = await Job.updateOne(
            { _id: jobId },
            { $inc: { applicantCount: incrementValue } }
        );

        if (result.modifiedCount === 0 && result.nModified === 0) {
            console.warn(`[changeApplicantCount] No job found with ID: ${jobId}`);
        } else {
            console.info(
                `[changeApplicantCount] Successfully ${action === 'dec' ? 'decremented' : 'incremented'} applicantCount for job ${jobId}`
            );
        }
    } catch (error) {
        console.error(
            `[changeApplicantCount] Error ${action === 'dec' ? 'decrementing' : 'incrementing'} applicantCount for job ${jobId}:`,
            error
        );
    }
};

export const changeVacancyCount = async (jobId, action = 'inc') => {
    try {
        const incrementValue = action === 'dec' ? -1 : 1;

        const result = await Job.updateOne(
            { _id: jobId },
            { $inc: { vacancies: incrementValue } }
        );

        if (result.modifiedCount === 0 && result.nModified === 0) {
            console.warn(`[changeVacancyCount] No job found with ID: ${jobId}`);
        } else {
            console.info(
                `[changeVacancyCount] Successfully ${action === 'dec' ? 'decremented' : 'incremented'} vacancies for job ${jobId}`
            );
        }
    } catch (error) {
        console.error(
            `[changeVacancyCount] Error ${action === 'dec' ? 'decrementing' : 'incrementing'} vacancies for job ${jobId}:`,
            error
        );
    }
};
