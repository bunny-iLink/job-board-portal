import { Router } from 'express';
import { addUser, addEmployer } from '../controllers/addUserController.js';
import { loginUser } from '../controllers/loginController.js';

const router = Router();

// POST methods
router.post('/addUser', addUser);
router.post('/addEmployer', addEmployer);
router.post('/login', loginUser);

export default router;