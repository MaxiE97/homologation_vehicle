# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- 1. IMPORTAR
import logging 

# Configuración básica del logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - [%(name)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Importamos los routers
from .api.v1 import processing, auth, export

app = FastAPI(
    title="Homologation Vehicle API",
    description="API para procesar y gestionar datos de homologación de vehículos.",
    version="1.0.0"
)

# --- 2. AÑADIR MIDDLEWARE DE CORS ---
# Lista de orígenes permitidos (los dominios desde donde tu frontend hará las peticiones)
origins = [
    "http://localhost:5173", # El origen por defecto de Vite
    "http://localhost:3000", # Un origen común para React en desarrollo
    # "https://tu-dominio-de-produccion.com", # <--- AÑADE AQUÍ TU DOMINIO DE PRODUCCIÓN CUANDO LO TENGAS
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Permite cookies/credenciales de autorización
    allow_methods=["*"],    # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],    # Permite todas las cabeceras
)
# --- FIN DE LA CONFIGURACIÓN DE CORS ---


# Incluimos los routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(processing.router, prefix="/api/v1", tags=["Processing"])
app.include_router(export.router, prefix="/api/v1", tags=["Export"]) 

@app.get("/")
def home():
    return {"status": "Homologation Vehicle API is running!"}