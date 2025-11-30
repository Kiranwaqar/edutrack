EduTrack Microservices – Cloud Computing Assignment (GKE Deployment)

This repository hosts the microservices developed for the EduTrack learning platform as part of the Cloud Computing (SE-315) assignment. The goal of the project is to design a cloud-native backend using microservices, containerization, and Kubernetes orchestration on Google Cloud Platform (GCP). The system demonstrates core cloud concepts such as scalability, service isolation, monitoring, secret management, and integration with managed databases.

Features

The project is composed of three microservices that operate independently while communicating through REST APIs.

Student Service
Handles student registration, profile retrieval, and CRUD operations.

Course Service
Stores and manages course-related information including listings and course details.

Enrollment Service
Allows a student to enroll in a course and ensures relational integrity between the two.

Each service is containerized with Docker, pushed to Google Artifact Registry, deployed on GKE, and connected to a centralized Cloud SQL PostgreSQL database. All services are exposed using LoadBalancer Service type so they can be accessed externally for demo and testing.

Project Structure

The repository is organized to clearly separate backend logic from Kubernetes deployment configurations.

student-service/ – Node.js service for managing student data

course-service/ – Node.js service for course management

enrollment-service/ – Node.js service for enrolling students in courses

k8s/deployments/ – Kubernetes Deployment manifests for each microservice

k8s/services/ – Kubernetes Service manifests (LoadBalancer)

k8s/hpa/ – Horizontal Pod Autoscaler configuration to support autoscaling

README.md – Documentation summarizing the project

High-Level Workflow

This project demonstrates the full lifecycle of building and deploying microservices on the cloud:

1. Service Development
Each microservice is built using Node.js/Express and structured to expose REST endpoints for CRUD functionality.

2. Containerization
All services are packaged using Docker. The Dockerfiles specify environment setup, dependencies, and runtime configuration.

3. Artifact Storage
The container images are uploaded to Google Artifact Registry, providing a centralized and secure repository for deployments.

4. Database Integration
A Cloud SQL PostgreSQL instance is used to provide reliable, persistent storage. The microservices read connection credentials from Kubernetes Secrets.

5. Kubernetes Deployment
The cluster on GKE hosts the microservices using Deployments, Services, and optional Horizontal Pod Autoscalers.
LoadBalancer Services provide external IPs for accessing each microservice.

6. Observability
Google Cloud Monitoring and Logging allow real-time tracking of pod health, logs, CPU usage, and error events.

7. Cleanup
Once the assignment is complete, cluster resources are deleted to avoid unnecessary costs.









