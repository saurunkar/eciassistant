# Firestore database (native mode)
resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.apis]
}

# TTL policy on sessions collection (24-hour auto-delete)
resource "google_firestore_field" "session_ttl" {
  project    = var.project_id
  database   = google_firestore_database.default.name
  collection = "sessions"
  field      = "expires_at"

  ttl_config {}
}
