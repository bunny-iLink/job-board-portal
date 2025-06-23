// swaggerConfig.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Board Portal API",
      version: "1.0.0",
      description: "API documentation for the Job Board Portal",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            role: { type: "string" },
            preferredDomain: { type: "string" },
            address: { type: "string" },
            phone: { type: "string" },
            profilePicture: {
              type: "object",
              properties: {
                data: { type: "string" },
                contentType: { type: "string" },
              },
            },
            experience: { type: "number" },
            resume: {
              type: "object",
              properties: {
                data: { type: "string" },
                contentType: { type: "string" },
              },
            },
          },
        },
        Employer: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            role: { type: "string" },
            company: { type: "string" },
            experience: { type: "number" },
            designation: { type: "string" },
            domain: { type: "string" },
            profilePicture: {
              type: "object",
              properties: {
                data: { type: "string" },
                contentType: { type: "string" },
              },
            },
          },
        },
        Job: {
          type: "object",
          properties: {
            title: { type: "string" },
            employerId: { type: "string" },
            employerName: { type: "string" },
            domain: { type: "string" },
            description: {
              type: "object",
              properties: {
                overview: { type: "string" },
                responsibilities: { type: "array", items: { type: "string" } },
                requiredSkills: { type: "array", items: { type: "string" } },
                preferredSkills: { type: "array", items: { type: "string" } },
                whatWeOffer: { type: "array", items: { type: "string" } },
              },
            },
            company: { type: "string" },
            location: { type: "string" },
            salary: { type: "number" },
            type: { type: "string" },
            experience: { type: "string" },
            vacancies: { type: "number" },
            status: { type: "string" },
          },
        },
        Application: {
          type: "object",
          properties: {
            userId: { type: "string" },
            jobId: { type: "string" },
            employer: { type: "string" },
            status: {
              type: "string",
              enum: ["In Progress", "Accepted", "Rejected"],
            },
            appliedAt: { type: "string", format: "date-time" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            userId: { type: "string" },
            message: { type: "string" },
            isRead: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./router/*.js"], // This scans your routes for Swagger comments
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
