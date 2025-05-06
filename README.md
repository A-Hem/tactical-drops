# Tactical Drops

A web application for managing product drops and sales, built with Node.js, Express, React, and PostgreSQL.

## Project Overview

This application was originally developed on Replit and has been migrated to Google Cloud Run for improved scalability and reliability. The application uses:

- **Backend**: Node.js with Express.js
- **Frontend**: React with Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **Payments**: Square SDK

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tactical-drops
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/tactical_drops
   SESSION_SECRET=your-local-session-secret
   SQUARE_APPLICATION_ID=your-square-application-id
   SQUARE_LOCATION_ID=your-square-location-id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The application will be available at `http://localhost:5000`

## Docker Development

You can also run the application using Docker:

```bash
# Build the Docker image
docker build -t tactical-drops-app .

# Run the container
docker run -p 8080:8080 --env-file .env tactical-drops-app
```

The application will be available at `http://localhost:8080`

## Deployment to Google Cloud Run

For detailed deployment instructions, see the [Cloud Run Setup Guide](cloud-run-setup.md).

### Quick Deployment Steps

1. Create Google Cloud project and resources
2. Set up Cloud SQL with PostgreSQL
3. Configure environment variables in Secret Manager
4. Deploy using Cloud Build and Cloud Run

## Database Management

### Migrations

To create and apply database migrations:

```bash
# Generate migrations based on schema changes
npm run db:push
```

### Connecting to Cloud SQL

To connect to your Cloud SQL instance:

```bash
# Using the Cloud SQL Auth Proxy
gcloud auth login
cloud_sql_proxy -instances=YOUR_INSTANCE_CONNECTION_NAME=tcp:5432
```

## Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

## License

MIT 