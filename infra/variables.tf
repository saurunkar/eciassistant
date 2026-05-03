variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region (default: asia-south1 for India)"
  type        = string
  default     = "asia-south1"
}

variable "image_tag" {
  description = "Docker image tag to deploy (use SHORT_SHA from Cloud Build)"
  type        = string
  default     = "latest"
}

variable "cors_origins" {
  description = "Comma-separated list of allowed CORS origins"
  type        = string
  default     = "https://electguide-india.web.app"
}

variable "vertex_ai_search_engine_id" {
  description = "Vertex AI Search engine ID (leave empty to use fallback KB)"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "environment must be development, staging, or production."
  }
}
