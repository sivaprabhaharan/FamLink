# FamLink Deployment Guide

This guide provides step-by-step instructions for deploying the FamLink application to AWS.

## Prerequisites

- AWS CLI installed and configured
- Docker installed
- .NET 8 SDK installed
- Node.js 18+ installed
- Angular CLI installed

## Backend Deployment

### 1. Deploy AWS Infrastructure

First, deploy the AWS infrastructure using CloudFormation:

```bash
# Deploy the infrastructure stack
aws cloudformation create-stack \
  --stack-name famlink-infrastructure-dev \
  --template-body file://backend/aws-infrastructure.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
               ParameterKey=DatabasePassword,ParameterValue=YourSecurePassword123! \
               ParameterKey=DomainName,ParameterValue=famlink.com \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Wait for stack creation to complete
aws cloudformation wait stack-create-complete \
  --stack-name famlink-infrastructure-dev \
  --region us-east-1
```

### 2. Create Secrets in AWS Secrets Manager

```bash
# Database connection string
aws secretsmanager create-secret \
  --name "famlink/database-connection" \
  --description "FamLink database connection string" \
  --secret-string "Server=YOUR_RDS_ENDPOINT;Database=FamLinkDB;User Id=admin;Password=YourSecurePassword123!;TrustServerCertificate=true;" \
  --region us-east-1

# Cognito configuration
aws secretsmanager create-secret \
  --name "famlink/cognito-config" \
  --description "FamLink Cognito configuration" \
  --secret-string '{"UserPoolId":"YOUR_USER_POOL_ID","ClientId":"YOUR_CLIENT_ID","Authority":"https://cognito-idp.us-east-1.amazonaws.com/YOUR_USER_POOL_ID"}' \
  --region us-east-1

# S3 configuration
aws secretsmanager create-secret \
  --name "famlink/s3-config" \
  --description "FamLink S3 configuration" \
  --secret-string '{"BucketName":"YOUR_S3_BUCKET_NAME"}' \
  --region us-east-1
```

### 3. Deploy Backend API

```bash
# Navigate to backend directory
cd backend

# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

### 4. Create ECS Service

```bash
# Create ECS service
aws ecs create-service \
  --cluster famlink-cluster-dev \
  --service-name famlink-api-service \
  --task-definition famlink-api-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/famlink-tg-dev/xxx,containerName=famlink-api,containerPort=80 \
  --region us-east-1
```

## Frontend Deployment

### 1. Build Angular Application

```bash
# Navigate to frontend directory
cd frontend/famlink-app

# Install dependencies
npm install

# Build for production
ng build --configuration production
```

### 2. Deploy to AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting

# Publish the application
amplify publish
```

## Database Setup

### 1. Run Entity Framework Migrations

```bash
# Navigate to API project
cd backend/FamLink.Api

# Install EF tools
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

## Configuration

### Environment Variables

Update the following environment variables in your deployment:

#### Backend (.NET API)
- `ConnectionStrings__DefaultConnection`: Database connection string
- `AWS__Region`: AWS region (e.g., us-east-1)
- `AWS__Cognito__UserPoolId`: Cognito User Pool ID
- `AWS__Cognito__ClientId`: Cognito Client ID
- `AWS__S3__BucketName`: S3 bucket name for media storage

#### Frontend (Angular)
- `API_BASE_URL`: Backend API base URL
- `AWS_REGION`: AWS region
- `COGNITO_USER_POOL_ID`: Cognito User Pool ID
- `COGNITO_CLIENT_ID`: Cognito Client ID

## Monitoring and Logging

### CloudWatch Logs
- Backend logs: `/ecs/famlink-api-dev`
- Application logs are automatically sent to CloudWatch

### Health Checks
- Backend health endpoint: `https://your-alb-dns/health`
- Frontend health: Amplify provides built-in monitoring

## Security Considerations

1. **Database Security**
   - Database is in private subnets
   - Security groups restrict access to ECS tasks only
   - Encryption at rest enabled

2. **API Security**
   - HTTPS enforced (configure SSL certificate)
   - CORS configured for frontend domain only
   - Authentication required for protected endpoints

3. **S3 Security**
   - Public access blocked
   - Encryption enabled
   - IAM roles for access control

## Scaling

### Auto Scaling
```bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/famlink-cluster-dev/famlink-api-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name famlink-api-scaling-policy \
  --service-namespace ecs \
  --resource-id service/famlink-cluster-dev/famlink-api-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Troubleshooting

### Common Issues

1. **ECS Task Fails to Start**
   - Check CloudWatch logs for error messages
   - Verify secrets are properly configured
   - Ensure security groups allow traffic

2. **Database Connection Issues**
   - Verify connection string in Secrets Manager
   - Check security group rules
   - Ensure database is in correct subnets

3. **Frontend Can't Connect to API**
   - Verify CORS configuration
   - Check API base URL configuration
   - Ensure load balancer is healthy

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster famlink-cluster-dev --services famlink-api-service

# View ECS task logs
aws logs get-log-events --log-group-name /ecs/famlink-api-dev --log-stream-name ecs/famlink-api/TASK_ID

# Check load balancer health
aws elbv2 describe-target-health --target-group-arn YOUR_TARGET_GROUP_ARN
```

## Cost Optimization

1. **Use Fargate Spot** for non-critical workloads
2. **Configure S3 lifecycle policies** for old media files
3. **Use RDS reserved instances** for production
4. **Monitor CloudWatch costs** and set up billing alerts

## Backup and Recovery

1. **Database Backups**: Automated daily backups with 7-day retention
2. **S3 Versioning**: Enabled for media files
3. **Infrastructure as Code**: All infrastructure defined in CloudFormation

## Next Steps

1. Set up CI/CD pipeline using AWS CodePipeline
2. Configure custom domain with Route 53
3. Set up SSL certificates with ACM
4. Implement comprehensive monitoring with CloudWatch dashboards
5. Set up log aggregation and analysis