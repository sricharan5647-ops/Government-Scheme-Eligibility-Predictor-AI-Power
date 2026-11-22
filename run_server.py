#!/usr/bin/env python3
"""
SchemeSathi Local Server Launcher
Launches the FastAPI backend which serves both API endpoints and the compiled React SPA.
"""
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("SchemeSathi - AI-Powered Government Scheme Eligibility Predictor")
    print("Pilot Scope: Telangana + Selected Central Government Schemes")
    print("=" * 60)
    print("Starting full-stack application server at http://127.0.0.1:8000")
    print("Interactive Swagger API Documentation: http://127.0.0.1:8000/docs")
    print("Administrator Sign-In: http://127.0.0.1:8000/admin/login")
    print("=" * 60)
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
