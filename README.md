# CCA Project 2: Serverless Fullstack Deployment
### A Scalable, Highly Available Web Application on AWS and Netlify

![Architecture Diagram](/public/assets/architecture.png)

## Overview
This project demonstrates a production-grade fullstack architecture leveraging **AWS Serverless** technologies and **Netlify** for static hosting. The application frontend interacts with a decoupled backend API to display real-time metrics, logs, and request details.
---


https://github.com/user-attachments/assets/7a33ebaa-a72f-448e-aa20-1105454c3c81



## Architecture Components

*   **Frontend**: Next.js (Static Export) configured for highly efficient content delivery via CDNs.
*   **Hosting**: Netlify (Frontend) and AWS Lambda (Backend).
*   **API Layer**: AWS API Gateway (HTTP API) acting as the secure entry point.
*   **Compute**: AWS Lambda (Node.js 18.x) for serverless business logic execution.
*   **Observability**: AWS CloudWatch for structured logging, metrics, and monitoring.

---

## Step 1: Backend API Configuration (AWS)

Follow these steps to provision the backend infrastructure using the AWS Console.

### 1. Create the Lambda Function
1.  Navigate to **AWS Console > Lambda > Create function**.
2.  Select **Author from scratch**.
3.  Enter the details:
    *   **Function name**: `monitor-api`
    *   **Runtime**: `Node.js 24.x`
    *   **Architecture**: `x86_64`
4.  Under **Permissions**, create a new role with basic Lambda permissions.
5.  Click **Create function**.

**Deploy Code**:
Navigate to the **Code** tab and paste the following handler:
```javascript
export const handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      message: "API is working",
      method: event.requestContext?.http?.method,
      path: event.rawPath,
      time: new Date().toISOString(),
    }),
  };
};

```
Click **Deploy**.

**Verify Permissions**:
Go to **Configuration > Permissions**. Ensure the Execution Role has `AWSLambdaBasicExecutionRole` attached to allow CloudWatch logging.

### 2. Configure API Gateway
1.  Navigate to **AWS Console > API Gateway > Create API**.
2.  Select **HTTP API** and click **Build**.
3.  **Integration**:
    *   Select **Lambda**.
    *   Target: `monitor-api`.
4.  **Routes**:
    *   Method: `ANY`
    *   Resource path: `/api/{proxy+}`
5.  **Stages**:
    *   Name: `prod`
    *   Enable **Auto-deploy**.
6.  Click **Create**.

### 3. Enable Observability
1.  In your new API, go to **Monitor > Logging**.
2.  Enable **Access logging**.
3.  Set a standard log format (e.g., `$context.requestId $context.httpMethod $context.path $context.status`).
4.  Save changes.

### 4. Retrieve API Endpoint
Copy your **Invoke URL** from the API details page. It will resemble:
`https://abc123.execute-api.us-east-1.amazonaws.com`

Your functional endpoint is:
`https://abc123.execute-api.us-east-1.amazonaws.com/api/test`

---

## Step 2: Validation

### Terminal Test
Validate the deployment using `curl`:
```bash
curl -X POST https://your-api-url/api/test \
  -H "Content-Type: application/json" \
  -d '{"hello":"world"}'
```

### CloudWatch Verification
1.  **Lambda Logs**: Check Log Group `/aws/lambda/monitor-api`.
2.  **Metrics**: View API Gateway metrics for `Count`, `Latency`, and `4XX/5XX` errors.

---

## Step 3: Frontend Deployment

1.  Clone this repository.
2.  Create `.env.local` with your API URL:
    ```bash
    NEXT_PUBLIC_API_URL=https://your-api-url/api/test
    ```
3.  Install dependencies: `npm install`
4.  Run locally: `npm run dev`
5.  Build for production: `npm run build`

### Option A: Deploy to AWS Amplify (Recommended)
This workflow connects your Git repository to AWS Amplify for continuous deployment/CI.

1.  **Push Code**: Commit and push your code to a Git repository (GitHub, GitLab, AWS CodeCommit, etc.).
2.  **Amplify Console**:
    *   Go to **AWS Console > Amplify > Create new app**.
    *   Select your repository provider and branch.
3.  **Build Settings**:
    *   Amplify will automatically detect Next.js.
    *   Ensure the **Build command** is `npm run build`.
    *   Ensure the **Base directory** is `out` (critical for static export).
4.  **Environment Variables**:
    *   Expand **Advanced settings** (or go to **Environment variables** in App settings).
    *   Add Key: `NEXT_PUBLIC_API_URL`
    *   Value: `https://your-api-url/api/test` (The Invoke URL from Step 1)
5.  **Deploy**: Click **Save and Deploy**. Use the provided Amplify URL to test.

### Option B: Deploy to Netlify
1.  Run locally: `npm run dev`
2.  Build for production: `npm run build`
3.  Deploy the `out` directory to Netlify manually, or connect your Git repo.
    *   ensure to set `NEXT_PUBLIC_API_URL` in **Site configuration > Environment variables**.

---

### Infrastructure as Code (Optional)
For production environments, we recommend using Terraform:

```hcl
resource "aws_lambda_function" "api" {
  function_name = "monitor-api"
  runtime       = "nodejs18.x"
  handler       = "index.handler"
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "monitor-http-api"
  protocol_type = "HTTP"
}
```
