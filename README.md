# Drug Interaction Checker Service

## API Endpoints

### 1. `/ddi_checker_test` (GET)

- **Description**: A simple health check for the drug interaction checker service.
- **Response**: Returns a confirmation message that the drug interaction checker is registered.
- **Example Response**:
  ```json
  {
    "message": "Drug interaction checker is registered!"
  }
  ```

### 2. `/ddi_checker` (POST)

- **Description**: Checks for drug interactions between two specified drugs.
- **Request Body**: A JSON object containing the names of two drugs.
  ```json
  {
    "drugA": "DrugNameA",
    "drugB": "DrugNameB"
  }
  ```
- **Response**: Returns the interaction level between the specified drugs.
- **Example Response**:
  ```json
  {
    "interaction_level": "High"
  }
  ```

### 3. `/drugs_list` (GET)

- **Description**: Returns a list of available drugs that can be checked for interactions.
- **Response**: Returns two lists containing drug names for `drugA` and `drugB`.
- **Example Response**:
  ```json
  {
    "drugA_list": ["DrugA1", "DrugA2", "DrugA3"],
    "drugB_list": ["DrugB1", "DrugB2", "DrugB3"]
  }
  ```

### 4. `/health` (GET)

- **Description**: Checks the health status of the drug interaction checker service.
- **Response**: Returns a status message indicating the health of the service.
- **Example Response**:
  ```json
  {
    "status": "ddi-checker service UP"
  }
  ```

### 5. `/status` (GET)

- **Description**: Provides the current status of the drug interaction checker service.
- **Response**: Returns a status message indicating that the service is running.
- **Example Response**:
  ```json
  {
    "status": "ddi-checker service is running"
  }
  ```

# Disease Prediction Service

## API Endpoints

### 1. `/predictDiseaseFromSymptoms` (POST)

- **Description**: Predicts the disease based on the given symptoms.
- **Request Body**: A JSON object containing a string of symptoms.
  ```json
  {
    "symptoms": "symptom1, symptom2, symptom3"
  }
  ```
- **Response**: Returns the predicted disease based on the symptoms provided.
- **Example Response**:
  ```json
  {
    "predicted_disease": "DiseaseName"
  }
  ```

### 2. `/recommendDoctor/disease` (POST)

- **Description**: Recommends a doctor based on the given disease.
- **Request Body**: A JSON object containing the disease name.
  ```json
  {
    "disease": "DiseaseName"
  }
  ```
- **Response**: Returns a recommended doctor for the given disease.
- **Example Response**:
  ```json
  {
    "doctor": "DoctorName"
  }
  ```

### 3. `/recommendDoctor/symptoms` (POST)

- **Description**: Recommends a doctor based on the given symptoms by first predicting the disease.
- **Request Body**: A JSON object containing a string of symptoms.
  ```json
  {
    "symptoms": "symptom1, symptom2, symptom3"
  }
  ```
- **Response**: Returns a recommended doctor for the predicted disease based on the symptoms provided.
- **Example Response**:
  ```json
  {
    "doctor": "DoctorName"
  }
  ```

### 4. `/health` (GET)

- **Description**: Checks the health status of the disease prediction service.
- **Response**: Returns a status message indicating the health of the service.
- **Example Response**:
  ```json
  {
    "status": "disease prediction service UP"
  }
  ```

### 5. `/status` (GET)

- **Description**: Provides the current status of the disease prediction service.
- **Response**: Returns a status message indicating that the service is running.
- **Example Response**:
  ```json
  {
    "status": "disease prediction service is running"
  }
  ```
