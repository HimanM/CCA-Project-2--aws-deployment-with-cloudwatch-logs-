"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBackend = async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("Error: NEXT_PUBLIC_API_URL environment variable is not set.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        const jsonData = await response.json();
        data = JSON.stringify(jsonData, null, 2);
      } else {
        data = await response.text();
      }

      setApiResponse(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch from backend");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>CCA Project 2</h1>
        <p className={styles.description}>
          Deploy and monitor a fullstack (serverless backend) on AWS with AWS Amplify,
          API Gateway, AWS Lambda and CloudWatch.
        </p>

        <div className={styles.card}>
          <button
            className={styles.button}
            onClick={checkBackend}
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Check Backend"}
          </button>

          <div className={styles.responseArea}>
            <div className={styles.responseTitle}>API Output</div>

            {isLoading && (
              <div className={styles.loading}>Connecting to backend...</div>
            )}

            {error && (
              <div className={`${styles.codeBlock} ${styles.error}`}>
                {error}
              </div>
            )}

            {apiResponse && !error && (
              <pre className={styles.codeBlock}>
                {apiResponse}
              </pre>
            )}

            {!isLoading && !error && !apiResponse && (
              <div className={styles.codeBlock} style={{ color: '#64748b' }}>
                Click the button to test connectivity.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
