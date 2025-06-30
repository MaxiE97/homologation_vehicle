# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
import logging 
import os 


# Configuración básica del logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - [%(name)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Importamos los routers
from .api.v1 import processing, auth, export, profile, downloads 

app = FastAPI(
    title="Homologation Vehicle API",
    description="API para procesar y gestionar datos de homologación de vehículos.",
    version="1.0.0"
)

# --- 2. AÑADIR MIDDLEWARE DE CORS ---
# Lee los orígenes permitidos desde una variable de entorno.
# Si la variable no existe, usa una lista por defecto para el desarrollo local.
# Los orígenes en la variable de entorno deben estar separados por comas.
allowed_origins_str = os.environ.get(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://localhost:3000"
)
allowed_origins = allowed_origins_str.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, # Usamos la lista dinámica
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- FIN DE LA CONFIGURACIÓN DE CORS ---


# Incluimos los routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(processing.router, prefix="/api/v1", tags=["Processing"])
app.include_router(export.router, prefix="/api/v1", tags=["Export"]) 
app.include_router(profile.router, prefix="/api/v1/profile", tags=["Profile"])
app.include_router(downloads.router, prefix="/api/v1/downloads", tags=["Downloads"])


@app.get("/")
def home():
    return {"status": "Homologation Vehicle API is running!"}




    # nsaodnaosndas