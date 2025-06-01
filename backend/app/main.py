# backend/app/main.py
from fastapi import FastAPI
import logging 

# Configuración básica del logging (opcional, pero recomendado)
logging.basicConfig(
    level=logging.DEBUG, # O logging.DEBUG si necesitas más detalle // INFO  si menos
    format="%(asctime)s - %(levelname)s - [%(name)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Importamos los routers
from .api.v1 import processing
from .api.v1 import auth
from .api.v1 import export # <-- NUEVO

app = FastAPI(
    title="Homologation Vehicle API",
    description="API para procesar y gestionar datos de homologación de vehículos.",
    version="1.0.0"
)

# Incluimos los routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(processing.router, prefix="/api/v1", tags=["Processing"])
app.include_router(export.router, prefix="/api/v1", tags=["Export"]) 

@app.get("/")
def home():
    return {"status": "Homologation Vehicle API is running!"}