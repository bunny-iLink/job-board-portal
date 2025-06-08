import { Router } from 'express';
import { addUser, addEmployer, getEmployerData, getUserData, updateUserData, updateEmployerData, deleteUserData, deleteEmployerData, uploadEmployerProfilePicture, uploadUserProfilePicture, uploadUserResume } from '../controllers/userController.js';
import { loginUser } from '../controllers/loginController.js';
import { addJob, deleteJob, getJobs, updateJob } from '../controllers/jobsController.js';
import { upload, uploadResume } from '../controllers/upload.js';

const router = Router();

// POST methods
router.post('/addUser', addUser);
router.post('/addEmployer', addEmployer);
router.post('/login', loginUser);
router.post('/addJob', addJob);
router.post('/uploadEmployerProfilePicture/:id', upload.single('profilePicture'), uploadEmployerProfilePicture);
router.post('/uploadUserProfilePicture/:id', upload.single('profilePicture'), uploadUserProfilePicture);
router.post('/uploadUserResume/:id', uploadResume.single('resume'), uploadUserResume)

// GET methods
router.get('/getJobs/:employerId', getJobs);
router.get('/getEmployerData/:employerId', getEmployerData);
router.get('/getUserData/:userId', getUserData);

// PUT methods
router.put('/updateJob/:jobId', updateJob);
router.put('/updateUser/:userId', updateUserData);
router.put('/updateEmployer/:employerId', updateEmployerData);

// DELETE methods
router.delete('/deleteJob/:jobId', deleteJob);
router.delete('/deleteUser/:userId', deleteUserData);
router.delete('/deleteEmployer/:employerId', deleteEmployerData);

export default router;