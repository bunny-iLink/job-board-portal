import { Router } from 'express';
import { addUser, addEmployer, getEmployerData, getUserData, updateUserData, updateEmployerData, deleteUserData, deleteEmployerData } from '../controllers/userController.js';
import { loginUser } from '../controllers/loginController.js';
import { addJob, deleteJob, getJobs, updateJob } from '../controllers/jobsController.js';

const router = Router();

// POST methods
router.post('/addUser', addUser);
router.post('/addEmployer', addEmployer);
router.post('/login', loginUser);
router.post('/addJob', addJob);

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
router.delete('/deleteEmployer', deleteEmployerData);

export default router;