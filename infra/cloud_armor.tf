# Cloud Armor security policy (WAF + rate limiting)
# Requires compute.googleapis.com to be enabled and Backend Service attached.
# Apply this AFTER setting up a Global Load Balancer pointing to Cloud Run.

resource "google_compute_security_policy" "electguide_waf" {
  name        = "electguide-waf-policy"
  description = "WAF + rate limiting for ElectGuide India API"
  project     = var.project_id

  # Rate limit: 100 req/min per IP
  rule {
    action   = "rate_based_ban"
    priority = 100
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      ban_duration_sec = 300
      conform_action   = "allow"
      exceed_action    = "deny(429)"
      enforce_on_key   = "IP"
    }
    description = "Rate limit 100 req/min per IP"
  }

  # OWASP CRS rules — SQLi
  rule {
    action   = "deny(403)"
    priority = 200
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "Block SQL injection attempts"
  }

  # OWASP CRS rules — XSS
  rule {
    action   = "deny(403)"
    priority = 300
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "Block cross-site scripting"
  }

  # Default allow
  rule {
    action   = "allow"
    priority = 2147483647
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }
}
