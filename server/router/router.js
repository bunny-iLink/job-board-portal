import { Router } from 'express';
import { addUser, addEmployer } from '../controllers/addUserController.js';
import { loginUser } from '../controllers/loginController.js';
import { addJob, getJobs } from '../controllers/jobsController.js';

const router = Router();

// POST methods
router.post('/addUser', addUser);
router.post('/addEmployer', addEmployer);
router.post('/login', loginUser);
router.post('/addJob', addJob);

// GET methods
router.get('/getJobs/:employerId', getJobs);

export default router;