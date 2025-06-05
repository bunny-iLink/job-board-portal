import { Router } from 'express';
import { addUser, addEmployer, getEmployerData } from '../controllers/userController.js';
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
router.get('/getEmployerData/:employerId', getEmployerData)

// PUT methods
router.put('/updateJob/:jobId', updateJob);

// DELETE methods
router.delete('/deleteJob/:jobId', deleteJob)

export default router;