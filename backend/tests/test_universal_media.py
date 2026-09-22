import io
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fastapi.testclient import TestClient
from app.main import app
from pypdf import PdfWriter

client = TestClient(app)

def test_universal_media_ingestion_and_streaming():
    print("==========================================================")
    print("TESTING UNIVERSAL MEDIA INGESTION & FILE STREAMING")
    print("==========================================================")

    # 1. Health check
    health = client.get("/api/health")
    assert health.status_code == 200

    # 2. Test PDF Upload & Streaming
    print("\n1. Testing PDF upload and streaming...")
    pdf_writer = PdfWriter()
    pdf_writer.add_blank_page(width=100, height=100)
    pdf_bytes = io.BytesIO()
    pdf_writer.write(pdf_bytes)
    pdf_bytes.seek(0)

    pdf_resp = client.post(
        "/api/ingest/file",
        files={"file": ("Architecture_RFC_50.pdf", pdf_bytes.getvalue(), "application/pdf")},
        data={"custom_title": "Architecture RFC 50"}
    )
    assert pdf_resp.status_code == 200, pdf_resp.text
    pdf_doc_id = pdf_resp.json()["document_id"]
    print(f"   PDF Ingested ID: {pdf_doc_id}")

    # Verify PDF file streaming
    pdf_file_resp = client.get(f"/api/documents/{pdf_doc_id}/file")
    assert pdf_file_resp.status_code == 200
    assert "pdf" in pdf_file_resp.headers.get("content-type", "")
    assert pdf_file_resp.headers.get("accept-ranges") == "bytes"
    print("   PDF streaming verified: 200 OK with application/pdf")

    # 3. Test Image Upload & Streaming
    print("\n2. Testing Image artifact upload and streaming...")
    # Minimal 1x1 PNG bytes
    png_bytes = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        b'\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00'
        b'\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    img_resp = client.post(
        "/api/ingest/file",
        files={"file": ("System_Topology_Diagram.png", png_bytes, "image/png")}
    )
    assert img_resp.status_code == 200
    img_doc_id = img_resp.json()["document_id"]
    print(f"   Image Ingested ID: {img_doc_id}")

    img_file_resp = client.get(f"/api/documents/{img_doc_id}/file")
    assert img_file_resp.status_code == 200
    assert "image" in img_file_resp.headers.get("content-type", "")
    print("   Image streaming verified: 200 OK with image/png")

    # 4. Test Video Upload & Streaming
    print("\n3. Testing Video artifact upload and streaming...")
    video_dummy_bytes = b"MP4_VIDEO_MOCK_STREAMING_TEST_BINARY_DATA_0123456789"
    video_resp = client.post(
        "/api/ingest/file",
        files={"file": ("Architecture_Review_Meeting.mp4", video_dummy_bytes, "video/mp4")}
    )
    assert video_resp.status_code == 200
    video_doc_id = video_resp.json()["document_id"]
    assert video_resp.json()["source_type"] == "video"
    print(f"   Video Ingested ID: {video_doc_id}")

    video_file_resp = client.get(f"/api/documents/{video_doc_id}/file")
    assert video_file_resp.status_code == 200
    assert "video" in video_file_resp.headers.get("content-type", "")
    assert video_file_resp.headers.get("accept-ranges") == "bytes"
    print("   Video streaming verified: 200 OK with video/mp4 & Accept-Ranges: bytes")

    # 5. Test Audio Upload & Streaming
    print("\n4. Testing Audio artifact upload and streaming...")
    audio_dummy_bytes = b"RIFF....WAVEfmt ....dataMOCK_AUDIO_CONTENT"
    audio_resp = client.post(
        "/api/ingest/file",
        files={"file": ("Incident_WarRoom_Audio.wav", audio_dummy_bytes, "audio/wav")}
    )
    assert audio_resp.status_code == 200
    audio_doc_id = audio_resp.json()["document_id"]
    assert audio_resp.json()["source_type"] == "audio"
    print(f"   Audio Ingested ID: {audio_doc_id}")

    audio_file_resp = client.get(f"/api/documents/{audio_doc_id}/file")
    assert audio_file_resp.status_code == 200
    assert "audio" in audio_file_resp.headers.get("content-type", "")
    print("   Audio streaming verified: 200 OK with audio/wav")

    # 6. Test Code / JSON Upload & Streaming
    print("\n5. Testing Code / JSON artifact upload...")
    code_text = "{\n  \"service\": \"PaymentGateway\",\n  \"database\": \"PostgreSQL\",\n  \"migrated_at\": \"2024-08-12\"\n}"
    code_resp = client.post(
        "/api/ingest/file",
        files={"file": ("service_config.json", code_text.encode("utf-8"), "application/json")}
    )
    assert code_resp.status_code == 200
    code_doc_id = code_resp.json()["document_id"]
    print(f"   Code Ingested ID: {code_doc_id}")

    code_file_resp = client.get(f"/api/documents/{code_doc_id}/file")
    assert code_file_resp.status_code == 200
    print("   Code streaming verified: 200 OK")

    # 7. Document Details Endpoint
    print("\n6. Testing Document Details endpoint...")
    details_resp = client.get(f"/api/documents/{video_doc_id}")
    assert details_resp.status_code == 200
    details = details_resp.json()
    assert details["source_type"] == "video"
    assert "file_url" in details and details["file_url"] is not None
    print(f"   Details verified for '{details['title']}': URL={details['file_url']}")

    print("\n==========================================================")
    print("ALL UNIVERSAL MEDIA INGESTION & STREAMING TESTS PASSED! [100%]")
    print("==========================================================")

if __name__ == "__main__":
    test_universal_media_ingestion_and_streaming()
