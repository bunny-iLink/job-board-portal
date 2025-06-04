import { Router } from 'express';
import { addUser, addEmployer } from '../controllers/addUserController.js';

const router = Router();

// POST methods
router.post('/addUser', addUser);
router.post('/addEmployer', addEmployer);

export default router;