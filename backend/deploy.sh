#!/bin/bash

# FamLink API Deployment Script for AWS ECS Fargate
# This script builds, pushes, and deploys the FamLink API to AWS ECS

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="famlink-api"
ECS_CLUSTER="famlink-cluster"
ECS_SERVICE="famlink-api-service"
TASK_DEFINITION_FAMILY="famlink-api-task"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting FamLink API deployment...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo -e "${YELLOW}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${YELLOW}ECR Repository URI: ${ECR_URI}${NC}"

# Step 1: Build the Docker image
echo -e "${GREEN}Step 1: Building Docker image...${NC}"
docker build -t ${ECR_REPOSITORY}:latest .

# Step 2: Tag the image for ECR
echo -e "${GREEN}Step 2: Tagging image for ECR...${NC}"
docker tag ${ECR_REPOSITORY}:latest ${ECR_URI}:latest

# Step 3: Login to ECR
echo -e "${GREEN}Step 3: Logging in to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

# Step 4: Create ECR repository if it doesn't exist
echo -e "${GREEN}Step 4: Ensuring ECR repository exists...${NC}"
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} || \
aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION}

# Step 5: Push the image to ECR
echo -e "${GREEN}Step 5: Pushing image to ECR...${NC}"
docker push ${ECR_URI}:latest

# Step 6: Update task definition with new image URI
echo -e "${GREEN}Step 6: Updating task definition...${NC}"
sed "s|YOUR_ECR_REPOSITORY_URI|${ECR_URI}|g" aws-ecs-task-definition.json > temp-task-definition.json
sed -i "s|YOUR_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" temp-task-definition.json

# Step 7: Register new task definition
echo -e "${GREEN}Step 7: Registering new task definition...${NC}"
aws ecs register-task-definition \
    --cli-input-json file://temp-task-definition.json \
    --region ${AWS_REGION}

# Step 8: Update ECS service
echo -e "${GREEN}Step 8: Updating ECS service...${NC}"
aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --task-definition ${TASK_DEFINITION_FAMILY} \
    --region ${AWS_REGION}

# Step 9: Wait for deployment to complete
echo -e "${GREEN}Step 9: Waiting for deployment to complete...${NC}"
aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION}

# Cleanup
rm -f temp-task-definition.json

echo -e "${GREEN}Deployment completed successfully!${NC}"

# Get service information
echo -e "${YELLOW}Service Information:${NC}"
aws ecs describe-services \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION} \
    --query 'services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount,TaskDefinition:taskDefinition}'

echo -e "${GREEN}FamLink API is now deployed and running on AWS ECS Fargate!${NC}"