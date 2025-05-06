# Deploying to Google Cloud Run

This guide will walk you through the process of deploying the Tactical Drops application to Google Cloud Run.

## Prerequisites

1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed locally
2. Docker installed locally
3. A Google Cloud account with billing enabled

## Step 1: Create a Google Cloud Project

```bash
# Create a new project (or use an existing one)
gcloud projects create tactical-drops --name="Tactical Drops"

# Set the project as the default
gcloud config set project tactical-drops

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

## Step 2: Set Up Cloud SQL (PostgreSQL)

```bash
# Create a PostgreSQL instance
gcloud sql instances create tactical-drops-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=your-secure-password

# Create a database
gcloud sql databases create tactical_drops \
  --instance=tactical-drops-db

# Create a user
gcloud sql users create tactical_drops_user \
  --instance=tactical-drops-db \
  --password=your-user-password
```

## Step 3: Export Data from Replit Database

If you have existing data in Replit that you want to migrate:

1. Use a PostgreSQL client to connect to your Replit database
2. Export the data using pg_dump or a similar tool
3. Import the data to your Cloud SQL instance

## Step 4: Set Up Environment Variables in Secret Manager

```bash
# Create secrets for environment variables
echo -n "your-session-secret" | \
gcloud secrets create session-secret --data-file=-

# Create DATABASE_URL secret
echo -n "postgresql://tactical_drops_user:your-user-password@/tactical_drops?host=/cloudsql/your-project-id:us-central1:tactical-drops-db" | \
gcloud secrets create database-url --data-file=-

# Create Square API secrets
echo -n "your-square-application-id" | \
gcloud secrets create square-application-id --data-file=-

echo -n "your-square-location-id" | \
gcloud secrets create square-location-id --data-file=-
```

## Step 5: Build and Deploy to Cloud Run

```bash
# Build the container image
gcloud builds submit --tag gcr.io/tactical-drops/tactical-drops-app

# Deploy to Cloud Run
gcloud run deploy tactical-drops \
  --image gcr.io/tactical-drops/tactical-drops-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances tactical-drops:us-central1:tactical-drops-db \
  --set-secrets DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest,SQUARE_APPLICATION_ID=square-application-id:latest,SQUARE_LOCATION_ID=square-location-id:latest
```

## Step 6: Set Up Domain (Optional)

If you want to use a custom domain:

1. Go to the Cloud Run console
2. Select your service
3. Go to the "Domain Mappings" tab
4. Click "Add Mapping"
5. Follow the instructions to verify domain ownership and set up the mapping

## Continuous Deployment (Optional)

You can set up continuous deployment using Cloud Build:

1. Connect your GitHub or other repository to Cloud Build
2. Create a cloudbuild.yaml file in your repository
3. Configure the build steps to build and deploy to Cloud Run

Example cloudbuild.yaml:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/tactical-drops-app', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/tactical-drops-app']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'tactical-drops'
      - '--image'
      - 'gcr.io/$PROJECT_ID/tactical-drops-app'
      - '--platform'
      - 'managed'
      - '--region'
      - 'us-central1'
      - '--allow-unauthenticated'
      - '--add-cloudsql-instances'
      - '$PROJECT_ID:us-central1:tactical-drops-db'
      - '--set-secrets'
      - 'DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest,SQUARE_APPLICATION_ID=square-application-id:latest,SQUARE_LOCATION_ID=square-location-id:latest'

images:
  - 'gcr.io/$PROJECT_ID/tactical-drops-app'
```

## Monitoring and Logging

- View logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=tactical-drops"`
- Set up alerts in Cloud Monitoring
- Check service metrics in the Cloud Run console

## Cost Management

- Cloud Run charges based on usage (CPU, memory, request count)
- Cloud SQL has ongoing costs even when idle
- Consider using a smaller instance or serverless Postgres alternatives
- Set up budget alerts to monitor costs 