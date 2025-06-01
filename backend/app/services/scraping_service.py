# backend/app/services/scraping_service.py
import asyncio
import pandas as pd
from typing import Dict, Optional, Any

# Importamos tus clases Scraper desde la carpeta scraping
# La ruta es relativa desde 'app'
from ..scraping.scraping_site_1 import Site1Scraper
from ..scraping.scraping_site_2 import Site2Scraper
from ..scraping.scraping_site_3 import Site3Scraper

# Creamos instancias de tus scrapers
site1_scraper = Site1Scraper()
site2_scraper = Site2Scraper()
site3_scraper = Site3Scraper()

async def run_scraping_for_site(scraper, url: str, *args) -> Optional[pd.DataFrame]:
    """
    Ejecuta el método scrape de un scraper de forma asíncrona.
    Maneja errores básicos.
    """
    if not url:
        return None
    try:
        print(f"Iniciando scraping para: {url}")
        # asyncio.to_thread ejecuta una función síncrona (como tu scrape)
        # en un hilo separado, para no bloquear el servidor FastAPI.
        df = await asyncio.to_thread(scraper.scrape, url, *args)
        print(f"Scraping completado para: {url}. Filas: {len(df)}")
        return df
    except Exception as e:
        print(f"ERROR al scrapear {url}: {e}")
        return None

async def process_all_urls(
    url1: Optional[str],
    url2: Optional[str],
    url3: Optional[str],
    transmission_manual: Optional[bool] = None
) -> Dict[str, Optional[pd.DataFrame]]:
    """
    Ejecuta el scraping para todas las URLs proporcionadas en paralelo.
    """
    tasks = []

    # Creamos tareas para cada scraper si la URL está presente
    if url1:
        tasks.append(run_scraping_for_site(site1_scraper, url1))
    if url2:
        tasks.append(run_scraping_for_site(site2_scraper, url2, transmission_manual))
    if url3:
        tasks.append(run_scraping_for_site(site3_scraper, url3))

    # Si no hay tareas, devolvemos un diccionario vacío
    if not tasks:
        return {}

    # Ejecutamos todas las tareas de scraping concurrentemente
    results = await asyncio.gather(*tasks)

    # Mapeamos los resultados de vuelta a los sitios
    processed_data = {}
    task_index = 0
    if url1:
        processed_data["site1"] = results[task_index]
        task_index += 1
    if url2:
        processed_data["site2"] = results[task_index]
        task_index += 1
    if url3:
        processed_data["site3"] = results[task_index]

    return processed_data