"""Unit tests for content endpoints: timeline, glossary, voter-guide."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.unit
class TestContentEndpoints:

    def test_timeline_returns_seven_phases(self, client: TestClient):
        """Timeline must have exactly 7 phases."""
        resp = client.get("/api/v1/timeline")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["phases"]) == 7

    def test_timeline_phases_have_required_fields(self, client: TestClient):
        """Each phase has id, title, description, icon, steps."""
        resp = client.get("/api/v1/timeline")
        for phase in resp.json()["phases"]:
            assert "id" in phase
            assert "title" in phase
            assert "title_hi" in phase
            assert "description" in phase
            assert "steps" in phase
            assert isinstance(phase["steps"], list)

    def test_glossary_returns_terms(self, client: TestClient):
        """Glossary returns at least 10 terms."""
        resp = client.get("/api/v1/glossary")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["terms"]) >= 10

    def test_glossary_terms_bilingual(self, client: TestClient):
        """Every glossary term has English and Hindi fields."""
        resp = client.get("/api/v1/glossary")
        for term in resp.json()["terms"]:
            assert term["term"]
            assert term["term_hi"]
            assert term["definition"]
            assert term["definition_hi"]

    def test_voter_guide_returns_five_steps(self, client: TestClient):
        """Voter guide has 5 ordered steps."""
        resp = client.get("/api/v1/voter-guide")
        assert resp.status_code == 200
        steps = resp.json()["steps"]
        assert len(steps) == 5
        assert [s["step"] for s in steps] == [1, 2, 3, 4, 5]
