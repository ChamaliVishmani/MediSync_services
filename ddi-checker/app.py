from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from py_eureka_client.eureka_client import EurekaClient

from drugsData import get_interaction_level, create_drug_dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class drugs(BaseModel):
    drugA: str
    drugB: str


@app.get("/ddi_checker_test")
def ddi_checker_test():
    return "Drug interaction checker is registered!"


@app.post("/ddi_checker")
def ddi_checker(drugs: drugs):
    try:
        interaction_level = get_interaction_level(
            drugs.drugA, drugs.drugB)
        return {"interaction_level": interaction_level}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/drugs_list")
def drugs_list():
    try:
        drugA_list, drugB_list = create_drug_dict()
        return {"drugA_list": drugA_list, "drugB_list": drugB_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Eureka client configuration
app_name = "drug-interaction-checker"
eureka_server_url = "http://localhost:8761/"
instance_port = 8084

# Initialize Eureka client
eureka_client = EurekaClient(app_name=app_name, eureka_server=eureka_server_url,
                             # Health check endpoint
                             instance_port=instance_port, instance_ip="127.0.0.1", health_check_url="http://127.0.0.1:{instance_port}/health",
                             status_page_url="http://127.0.0.1:{instance_port}/status",)


@app.on_event("startup")
async def startup_event():
    await eureka_client.start()


@app.on_event("shutdown")
async def shutdown_event():
    await eureka_client.stop()


@app.get("/health")
async def health_check():
    return {"status": "ddi-checker service UP"}


@app.get("/status")
async def status():
    return {"status": "ddi-checker service is running"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=instance_port, reload=True)
