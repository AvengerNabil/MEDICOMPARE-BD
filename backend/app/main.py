from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.endpoints import medicines, comparison, manufacturers
from backend.app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Official API for MediCompare BD — Bangladesh Pharmaceutical Intelligence & Price Comparison",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(medicines.router, prefix=f"{settings.API_V1_STR}/medicines", tags=["Medicines"])
app.include_router(comparison.router, prefix=f"{settings.API_V1_STR}/comparison", tags=["Comparison & Savings"])
app.include_router(manufacturers.router, prefix=f"{settings.API_V1_STR}/manufacturers", tags=["Manufacturers"])

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "operational",
        "platform": "MediCompare BD",
        "regulatory_alignment": "DGDA / DGHS FHIR Registered Drugs ValueSet",
        "version": "1.0.0"
    }
