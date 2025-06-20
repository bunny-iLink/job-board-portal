import { Router } from 'express';
import {
    addUser, addEmployer, getEmployerData, getUserData,
    updateUserData, updateEmployerData, deleteUserData, deleteEmployerData,
} from '../controllers/userController.js';
import { loginUser } from '../controllers/loginController.js';
import {
    addJob, deleteJob, updateJob,
    getJobsSummaryForEmployer, getJobsByDomain, getJobById,
    getJobsForEmployer, searchJobsForUsers
} from '../controllers/jobsController.js';
import { applyForJob, updateApplicationStatus, getUserAppliedJobs, revokeApplication } from '../controllers/applicationController.js';
import { getUserNotifications } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { getApplicationsByDomain, getApplicationsDataForEmployerBasedOnStatus, getApplicationsDataForUserBasedOnStatus } from '../controllers/chartsDataController.js';

const router = Router();

// POST methods

/**
 * @swagger
 * /addUser:
 *   post:
 *     summary: Register a new user (candidate)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/addUser', addUser);

/**
 * @swagger
 * /addEmployer:
 *   post:
 *     summary: Register a new employer
 *     tags: [Employers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               company:
 *                 type: string
 *               experience:
 *                 type: number
 *               designation:
 *                 type: string
 *               domain:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employer registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/addEmployer', addEmployer);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login as user or employer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /addJob:
 *   post:
 *     summary: Add a new job posting by an employer
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - employerId
 *               - employerName
 *               - domain
 *               - description
 *               - company
 *               - location
 *               - salary
 *               - type
 *               - experience
 *               - vacancies
 *             properties:
 *               title:
 *                 type: string
 *               employerId:
 *                 type: string
 *               employerName:
 *                 type: string
 *               domain:
 *                 type: string
 *               description:
 *                 type: object
 *                 properties:
 *                   overview:
 *                     type: string
 *                   responsibilities:
 *                     type: array
 *                     items:
 *                       type: string
 *                   requiredSkills:
 *                     type: array
 *                     items:
 *                       type: string
 *                   preferredSkills:
 *                     type: array
 *                     items:
 *                       type: string
 *                   whatWeOffer:
 *                     type: array
 *                     items:
 *                       type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               salary:
 *                 type: number
 *               type:
 *                 type: string
 *                 example: Full-Time
 *               experience:
 *                 type: string
 *               vacancies:
 *                 type: number
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Validation error
 */
router.post('/addJob', verifyToken, requireRole("employer"), addJob);

/**
 * @swagger
 * /applyForJob:
 *   post:
 *     summary: Apply for a job
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - jobId
 *               - employer
 *             properties:
 *               userId:
 *                 type: string
 *               jobId:
 *                 type: string
 *               employer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job application submitted
 *       400:
 *         description: Invalid input
 */
router.post('/applyForJob/', verifyToken, requireRole("user"), applyForJob)

// GET methods

/**
 * @swagger
 * /getJobs/{employerId}:
 *   get:
 *     summary: Get jobs posted by a specific employer
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: employerId
 *         schema:
 *           type: string
 *         required: true
 *         description: Employer's ID
 *     responses:
 *       200:
 *         description: List of jobs posted by the employer
 *       404:
 *         description: Employer or jobs not found
 */
router.get('/getJobs/:employerId', verifyToken, requireRole("employer"), getJobsForEmployer);

/**
 * @swagger
 * /getEmployerData/{employerId}:
 *   get:
 *     summary: Get data of a specific employer
 *     tags: [Employers]
 *     parameters:
 *       - in: path
 *         name: employerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employer ID
 *     responses:
 *       200:
 *         description: Employer details
 *       404:
 *         description: Employer not found
 */
router.get('/getEmployerData/:employerId', verifyToken, requireRole("employer"), getEmployerData);

/**
 * @swagger
 * /getUserData/{userId}:
 *   get:
 *     summary: Get data of a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/getUserData/:userId', getUserData);

/**
 * @swagger
 * /employer/{employerId}/jobs-summary:
 *   get:
 *     summary: Get job posting summary for an employer
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: employerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employer ID
 *     responses:
 *       200:
 *         description: Jobs summary returned successfully
 *       404:
 *         description: Employer not found
 */
router.get('/employer/:employerId/jobs-summary', verifyToken, requireRole("employer"), getJobsSummaryForEmployer);

/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Get all notifications for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of notifications
 *       404:
 *         description: User or notifications not found
 */
router.get('/notifications/:userId', verifyToken, requireRole("user"), getUserNotifications)

/**
 * @swagger
 * /appliedJobs/{userId}:
 *   get:
 *     summary: Get all jobs a user has applied to
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of applications
 *       404:
 *         description: User or applications not found
 */
router.get('/appliedJobs/:userId', getUserAppliedJobs);

/**
 * @swagger
 * /jobs-by-domain:
 *   get:
 *     summary: Get jobs grouped by domain
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Jobs grouped by domain
 */
router.get('/jobs-by-domain', getJobsByDomain);

/**
 * @swagger
 * /getJobById/{jobId}:
 *   get:
 *     summary: Get details of a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/getJobById/:jobId', verifyToken, requireRole("employer"), getJobById);

/**
 * @swagger
 * /getJobsForUser:
 *   get:
 *     summary: Get jobs for user based on search/filter criteria
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Filter by domain
 *     responses:
 *       200:
 *         description: List of matching jobs
 */
router.get('/getJobsForUser', searchJobsForUsers)

/**
 * @swagger
 * /searchJobs:
 *   get:
 *     summary: Search jobs using filters
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Search by job title
 *     responses:
 *       200:
 *         description: Filtered job results
 */
router.get('/searchJobs', searchJobsForUsers);

/**
 * @swagger
 * /echartStatusForEmployer/{employerId}:
 *   get:
 *     summary: Get count of applications per status for a given employer
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []  # Assuming you're using JWT token auth
 *     parameters:
 *       - in: path
 *         name: employerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the employer
 *     responses:
 *       200:
 *         description: Application status count for employer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Applied:
 *                   type: integer
 *                   example: 5
 *                 In Progress:
 *                   type: integer
 *                   example: 3
 *                 Accepted:
 *                   type: integer
 *                   example: 2
 *                 Rejected:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Missing or invalid employer ID
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - role not allowed
 *       500:
 *         description: Internal server error
 */
router.get('/echartStatus/:userId', getApplicationsDataForEmployerBasedOnStatus)

router.get('/user/:userId/status-summary', getApplicationsDataForUserBasedOnStatus);

/**
 * @swagger
 * /user/{userId}/applications-by-domain:
 *   get:
 *     summary: Get count of applications per job domain for a user
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []  # Assuming you're using JWT authentication
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Application count per domain
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *               example:
 *                 - Technology & IT: 5
 *                 - Finance: 2
 *       400:
 *         description: Missing or invalid user ID
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - role not allowed
 *       500:
 *         description: Internal server error
 */
router.get('/user/:userId/applications-by-domain', getApplicationsByDomain)

// PUT methods

/**
 * @swagger
 * /updateJob/{jobId}:
 *   put:
 *     summary: Update a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               title: Updated Job Title
 *               description:
 *                 overview: Job overview here
 *                 responsibilities: ["Task 1", "Task 2"]
 *                 requiredSkills: ["Skill A", "Skill B"]
 *               salary: 80000
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job not found
 */
router.put('/updateJob/:jobId', verifyToken, requireRole("employer"), updateJob);

/**
 * @swagger
 * /updateUser/{userId}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: Updated Name
 *               address: Updated Address
 *               phone: "1234567890"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/updateUser/:userId', verifyToken, requireRole("user"), updateUserData);

/**
 * @swagger
 * /updateEmployer/{employerId}:
 *   put:
 *     summary: Update employer profile
 *     tags: [Employers]
 *     parameters:
 *       - in: path
 *         name: employerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               company: New Company Name
 *               experience: 10
 *               domain: IT
 *     responses:
 *       200:
 *         description: Employer updated successfully
 *       404:
 *         description: Employer not found
 */
router.put('/updateEmployer/:employerId', updateEmployerData);

/**
 * @swagger
 * /{applicationId}/status:
 *   put:
 *     summary: Update status of a job application
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [In Progress, Accepted, Rejected]
 *                 example: Accepted
 *     responses:
 *       200:
 *         description: Application status updated
 *       404:
 *         description: Application not found
 *       400:
 *         description: Invalid status
 */
router.put('/:applicationId/status', verifyToken, requireRole("employer"), updateApplicationStatus);

// DELETE methods

/**
 * @swagger
 * /deleteJob/{jobId}:
 *   delete:
 *     summary: Delete a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 */
router.delete('/deleteJob/:jobId', verifyToken, requireRole("employer"), deleteJob);

/**
 * @swagger
 * /deleteUser/{userId}:
 *   delete:
 *     summary: Delete a user account
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/deleteUser/:userId', verifyToken, requireRole("user"), deleteUserData);

/**
 * @swagger
 * /deleteEmployer/{employerId}:
 *   delete:
 *     summary: Delete an employer account
 *     tags: [Employers]
 *     parameters:
 *       - in: path
 *         name: employerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employer ID
 *     responses:
 *       200:
 *         description: Employer deleted successfully
 *       404:
 *         description: Employer not found
 */
router.delete('/deleteEmployer/:employerId', verifyToken, requireRole("employer"), deleteEmployerData);

/**
 * @swagger
 * /revokeApplication/{application_id}:
 *   delete:
 *     summary: Revoke a job application
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: application_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application revoked successfully
 *       404:
 *         description: Application not found
 */
router.delete('/revokeApplication/:application_id', verifyToken, requireRole("user"), revokeApplication);

export default router;