# backend/app/api/v1/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import uuid
from datetime import datetime
from app.data_transformation.key_map import FINAL_KEY_MAP 

# --- Modelos para Scraping/Procesamiento (Existentes) ---
class ScrapingRequest(BaseModel):
    url1: Optional[str] = None
    url2: Optional[str] = None
    url3: Optional[str] = None
    transmission_option: Optional[str] = "Por defecto"

class VehicleRow(BaseModel):
    key: str  # La clave final que recibirá el frontend (ej: "wheelbase")
    Valor_Sitio_1: Optional[Any] = Field(None, alias="Valor Sitio 1")
    Valor_Sitio_2: Optional[Any] = Field(None, alias="Valor Sitio 2")
    Valor_Sitio_3: Optional[Any] = Field(None, alias="Valor Sitio 3")
    Valor_Final: Optional[Any] = Field(None, alias="Valor Final")

    class Config:
        populate_by_name = True

# --- Modelos para Descargas (Existentes, movidos aquí para centralizar) ---
class DownloadCreate(BaseModel):
    user_id: uuid.UUID

class DownloadResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    downloaded_at: datetime

# --- NUEVOS Modelos para Autenticación ---
class UserLogin(BaseModel):
    username: str # Usaremos username en lugar de email
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AuthenticatedUser(BaseModel):
    id: uuid.UUID
    aud: str # Audience, parte del token JWT
    role: Optional[str] = None
    email: Optional[str] = None # El email original con el que se creó en Supabase
    user_metadata: Dict[str, Any] = Field(default_factory=dict) # Para el username y otros datos
    created_at: datetime
    # app_metadata: Dict[str, Any] = Field(default_factory=dict) # Por si necesitas esto también
    # updated_at: Optional[datetime] = None # Si está disponible

    class Config:
        populate_by_name = True

# --- NUEVOS/MODIFICADOS Modelos para el Payload de Exportación Simplificado ---
class KeyValuePair(BaseModel):
    Key: str
    Valor_Final: Optional[Any] = Field(None, alias="Valor Final") # Usamos alias por consistencia

    class Config:
        populate_by_name = True

class ExportDataRequest(BaseModel): # Renombrado de ExportRequest para claridad del payload
    language: str
    final_data: List[KeyValuePair]