output "cloud_run_url" {
  description = "Cloud Run service URL — set as VITE_API_BASE_URL in Firebase Hosting env"
  value       = google_cloud_run_v2_service.electguide_api.uri
}

output "gcs_bucket_name" {
  description = "GCS bucket name for ECI docs and system prompt"
  value       = google_storage_bucket.eci_docs.name
}

output "service_account_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloud_run_sa.email
}
