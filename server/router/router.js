import { Router } from 'express';
import {
    addUser, addEmployer, getEmployerData, getUserData,
    updateUserData, updateEmployerData, deleteUserData, deleteEmployerData,
    uploadEmployerProfilePicture, uploadUserProfilePicture, uploadUserResume,
} from '../controllers/userController.js';
import { loginUser } from '../controllers/loginController.js';
import { addJob, deleteJob, updateJob, 
    getJobsSummaryForEmployer, getJobsByDomain, getJobById, 
    getJobsForEmployer, searchJobsForUsers } from '../controllers/jobsController.js';
import { upload, uploadResume } from '../controllers/upload.js';
import { applyForJob, updateApplicationStatus, getUserAppliedJobs, revokeApplication } from '../controllers/applicationController.js';
import { getUserNotifications } from '../controllers/notificationController.js';

const router = Router();

// POST methods
router.post('/addUser', addUser);
router.post('/addEmployer', addEmployer);
router.post('/login', loginUser);
router.post('/addJob', addJob);
router.post('/uploadEmployerProfilePicture/:id', upload.single('profilePicture'), uploadEmployerProfilePicture);
router.post('/uploadUserProfilePicture/:id', upload.single('profilePicture'), uploadUserProfilePicture);
router.post('/uploadUserResume/:id', uploadResume.single('resume'), uploadUserResume)
router.post('/applyForJob/', applyForJob)

// GET methods
router.get('/getJobs/:employerId', getJobsForEmployer);
router.get('/getEmployerData/:employerId', getEmployerData);
router.get('/getUserData/:userId', getUserData);
router.get('/employer/:employerId/jobs-summary', getJobsSummaryForEmployer)
router.get('/notifications/:userId', getUserNotifications)
router.get('/appliedJobs/:userId', getUserAppliedJobs);
router.get('/jobs-by-domain', getJobsByDomain);
router.get('/getJobById/:jobId', getJobById);
router.get('/getJobsForUser', searchJobsForUsers)
router.get('/searchJobs', searchJobsForUsers);


// PUT methods
router.put('/updateJob/:jobId', updateJob);
router.put('/updateUser/:userId', updateUserData);
router.put('/updateEmployer/:employerId', updateEmployerData);
router.put('/:applicationId/status', updateApplicationStatus);

// DELETE methods
router.delete('/deleteJob/:jobId', deleteJob);
router.delete('/deleteUser/:userId', deleteUserData);
router.delete('/deleteEmployer/:employerId', deleteEmployerData);
router.delete('/revokeApplication/:application_id', revokeApplication);

//PATCH methods
router.patch('/application/update-status', async (req, res) => {
    try {
        const { applicationId, status } = req.body;

        if (!['In Progress', 'Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const updated = await Application.findByIdAndUpdate(applicationId, { status }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({ message: "Status updated", application: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
export default router;