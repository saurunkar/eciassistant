# Cloud Run service
resource "google_cloud_run_v2_service" "electguide_api" {
  name     = "electguide-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/electguide/api:${var.image_tag}"

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "GCP_REGION"
        value = var.region
      }
      env {
        name  = "VERTEX_AI_LOCATION"
        value = var.region
      }
      env {
        name  = "VERTEX_AI_SEARCH_ENGINE_ID"
        value = var.vertex_ai_search_engine_id
      }
      env {
        name  = "GCS_BUCKET_NAME"
        value = google_storage_bucket.eci_docs.name
      }
      env {
        name  = "CORS_ORIGINS"
        value = var.cors_origins
      }
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      env {
        name  = "LOG_LEVEL"
        value = "INFO"
      }
      env {
        name  = "SESSION_TTL_HOURS"
        value = "24"
      }
      env {
        name  = "MAX_MESSAGES_PER_SESSION"
        value = "20"
      }

      ports {
        container_port = 8080
      }

      startup_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        initial_delay_seconds = 5
        timeout_seconds       = 3
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        period_seconds    = 30
        failure_threshold = 3
      }
    }

    timeout = "60s"
  }

  depends_on = [
    google_project_service.apis,
    google_project_iam_member.sa_roles,
  ]
}

# Allow unauthenticated public access
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.electguide_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
