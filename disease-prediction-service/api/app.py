from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from py_eureka_client.eureka_client import EurekaClient

from utils import predictDiseaseUsingSymptoms, recommendDocotr

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class symptoms(BaseModel):
    symptoms: str


class disease(BaseModel):
    disease: str


@app.post("/predictDiseaseFromSymptoms")
def predictDiseaseFromSymptoms(symptomsList: symptoms):
    try:
        predictions = predictDiseaseUsingSymptoms(symptomsList.symptoms)
        return {"predicted_disease": predictions["final_prediction"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendDoctor/disease")
def recommendDrWithDisease(disease: disease):
    try:
        doctor = recommendDocotr(disease.disease)
        return {"doctor": doctor}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendDoctor/symptoms")
def recommendDrWithSymptoms(symptoms: symptoms):
    try:
        predictions = predictDiseaseUsingSymptoms(symptoms.symptoms)
        doctor = recommendDocotr(predictions["final_prediction"])
        return {"doctor": doctor}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Eureka client configuration
app_name = "disease-prediction-service"
eureka_server_url = "http://localhost:8761/"
instance_port = 8085

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
    return {"status": "disease prediction service UP"}


@app.get("/status")
async def status():
    return {"status": "disease prediction service is running"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=instance_port, reload=True)
