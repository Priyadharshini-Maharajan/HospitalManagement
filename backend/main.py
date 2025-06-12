from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from bson.objectid import ObjectId
from database import patients_collection
from database import doctor_collection
from database import appointment_collection
from database import receptionist_collection
from pydantic import BaseModel
from twilio.rest import Client
import pandas as pd
import base64
import requests
import re
import os
import traceback
from dotenv import load_dotenv
from fastapi import Body
from bson import ObjectId
from datetime import datetime
import face_recognition
import numpy as np
import cv2
from io import BytesIO
from PIL import Image, UnidentifiedImageError
from database import patients_collection
from db2 import router as db2_router  # Import the router from db2
import io
import faiss
from fastapi import APIRouter
import json
from concurrent.futures import ThreadPoolExecutor
import asyncio
#from flask import Flask, jsonify 
import h5py
import uuid
from fastapi.encoders import jsonable_encoder
from fastapi import Query
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime
from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient


##-----------
#1.GET /Root
#2.POST /login doctor and receptionist
#3.
#4.GET /previous visit logs for patient 
#5.GET /patients 
#6.GET /doctors
#7.POST /appointments
#8.GET /appointments for doctors
#9.DELETE /appointments
#10.GET /predicting patient visit type
#11.POST / Match Face Endpoint
#12.GET /matched patients
#13.POST /clear matched_patients
#14.POST /Registering Patients
#15.GET /Patient by their medical_id
#16.POST /predict and notify 
#17.GET /check notification


# Load environment variables

load_dotenv()

app = FastAPI()
router = APIRouter()


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(db2_router)


# Twilio setup
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
#twilio_client = Client(account_sid, auth_token)

# Patient Model for prediction
class Patient(BaseModel):
    age: int
    gender: str
    admissionheight: int
    admissionweight: int
    unitvisitnumber: int
    apacheadmissiondx: str


class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    department: str
    date: str
    time: str
    reason: str

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str

class PatientUpdate(BaseModel):
    height: str
    weight: str
    blood_pressure: str
    
#1.GET /Root
@app.get("/")
def read_root():
    return {"message": "FastAPI server is running!"}


@app.put("/patients/{patient_id}")
async def update_patient(patient_id: str, patient_update: PatientUpdate):
    try:
        update_fields = {}
        if patient_update.height:
            update_fields["height"] = patient_update.height
        if patient_update.weight:
            update_fields["weight"] = patient_update.weight
        if patient_update.blood_pressure:
            update_fields["blood_pressure"] = patient_update.blood_pressure

        result = patients_collection.update_one(
            {"_id": ObjectId(patient_id)},
            {"$set": update_fields}
        )

        if not result or result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Patient not found.")

        return {"message": "Patient details updated successfully."}

    except Exception as e:
        import traceback
        print(" ERROR in update_patient route:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
#2.POST /login doctor and receptionist
@app.post("/login")
async def login(data: LoginRequest):
    if data.role == "doctor":
        # Match on 'name' and 'password' fields for doctors
        user = await doctor_collection.find_one({
            "name": data.username,
            "password": data.password
        })

        if not user:
            raise HTTPException(status_code=401, detail="Invalid doctor credentials")

        return {
            "message": "Login successful",
            "doctor_id": str(user["_id"]),
            "name": user["name"],
            "department": user.get("department", "")
        }

    elif data.role == "receptionist":
        # Match on 'name' and 'password' fields for receptionists
        user = await receptionist_collection.find_one({
            "name": data.username,
            "password": data.password
        })

        if not user:
            raise HTTPException(status_code=401, detail="Invalid receptionist credentials")

        return {
            "message": "Login successful",
            "receptionist_id": str(user["_id"]),
            "name": user["name"]
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid role")




from datetime import datetime

@app.put("/appointments/{appointment_id}/log_visit")
async def log_visit(appointment_id: str, log: dict):
    try:
        appointment = await appointment_collection.find_one({"_id": ObjectId(appointment_id)})
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found.")

        prev_next_advised_date_str = appointment.get("nextAdvisedDate")
        actual_visit_date_str = log.get("date", datetime.today().strftime("%Y-%m-%d"))

        def is_sudden_visit(actual_date, next_advised_date):
            fmt = "%Y-%m-%d"
            actual_dt = datetime.strptime(actual_date, fmt)
            next_dt = datetime.strptime(next_advised_date, fmt)
            return actual_dt < next_dt

        sudden_visit_flag = False
        if prev_next_advised_date_str:
            sudden_visit_flag = is_sudden_visit(actual_visit_date_str, prev_next_advised_date_str)

        visit_entry = {
            "date": actual_visit_date_str,
            "time": log.get("time", datetime.now().strftime("%H:%M")),
            "reason": log.get("reason", ""),
            "diagnosis": log.get("diagnosis", ""),
            "remarks": log.get("remarks", ""),
            "nextAdvisedDate": log.get("nextAdvisedDate", None),
            "suddenVisit": sudden_visit_flag,
        }

        await appointment_collection.update_one(
            {"_id": ObjectId(appointment_id)},
            {
                "$push": {"visit_logs": visit_entry},
                "$set": {
                    "doctorDiagnosis": visit_entry["diagnosis"],
                    "remarks": visit_entry["remarks"],
                    "nextAdvisedDate": visit_entry["nextAdvisedDate"],
                    "suddenVisit": sudden_visit_flag,
                    "visitLogged": True  # ✅ mark the appointment as completed
                }
            }
        )

        return {"message": "Visit log added successfully.", "visit": visit_entry}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
#4.GET /previous visit logs for patient  
@app.get("/appointments/patient/{patient_id}/visit_logs")
async def get_visit_logs_for_patient(patient_id: str):
    try:
        cursor = appointment_collection.find({"patient_id": ObjectId(patient_id)})
        visit_logs = []

        async for appt in cursor:
            logs = appt.get("visit_logs", [])
            visit_logs.extend(logs)

        # Sort logs by date and time (optional)
        visit_logs.sort(key=lambda log: (log.get("date", ""), log.get("time", "")))

        return visit_logs

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



#5.GET /patients
@app.get("/patients")
async def get_patients():
    patients = []
    cursor = patients_collection.find({}, {"name": 1, "age": 1})  # Projection to include only name and age
    async for patient in cursor.limit(100):
        patients.append(patient)
    return JSONResponse(content=jsonable_encoder(patients, custom_encoder={ObjectId: str}))





#6.GET /doctors
@app.get("/doctors")
async def get_doctors(department: str = Query(None)):
    doctors = []
    query = {"department": department} if department else {}
    async for doctor in doctor_collection.find(query).limit(100):
        doctors.append(doctor)
    return JSONResponse(content=jsonable_encoder(doctors, custom_encoder={ObjectId: str}))



#7.POST /appointments
from datetime import datetime

@app.post("/appointments")
async def create_appointment(appointment: AppointmentCreate):
    try:
        patient_appointments = appointment_collection.find(
            {"patient_id": ObjectId(appointment.patient_id)}
        ).sort("date", -1)

        last_advised_date = None
        async for appt in patient_appointments:
            if "nextAdvisedDate" in appt:
                last_advised_date = appt["nextAdvisedDate"]
                break
        
        appointment_date = datetime.strptime(appointment.date, "%Y-%m-%d")
        
        # Don't assign visitType unless there is an advised date
        visit_type = None
        if last_advised_date:
            advised_date = datetime.strptime(last_advised_date, "%Y-%m-%d")
            if appointment_date < advised_date:
                visit_type = "sudden"
            elif appointment_date > advised_date:
                visit_type = "late"
            else:
                visit_type = "expected"

        # Build appointment data dynamically
        appointment_doc = {
            "patient_id": ObjectId(appointment.patient_id),
            "doctor_id": ObjectId(appointment.doctor_id),
            "department": appointment.department,
            "date": appointment.date,
            "time": appointment.time,
            "reason": appointment.reason
        }

        if visit_type:
            appointment_doc["visitType"] = visit_type

        appointment_collection.insert_one(appointment_doc)

        return {
            "message": "Appointment created successfully",
            **({"visitType": visit_type} if visit_type else {})
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#8.GET /appointments for doctors
@app.get("/appointments/doctor/{doctor_id}")
async def get_appointments_for_doctor(doctor_id: str):
    appointments = []
    async for a in appointment_collection.find({
        "doctor_id": ObjectId(doctor_id),
        "$or": [{"visitLogged": {"$exists": False}}, {"visitLogged": False}]
    }):
        patient = await patients_collection.find_one({"_id": a["patient_id"]})

        if patient:
            appointments.append({
                "id": str(a["_id"]),
                "appointmentDate": a["date"],
                "appointmentTime": a["time"],
                "reason": a["reason"],
                "doctorDiagnosis": a.get("doctorDiagnosis", ""),
                "remarks": a.get("remarks", ""),
                "patient_id": str(a["patient_id"]),
                "visitType": a.get("visitType"),
                "patient": {
                    "name": patient.get("name", ""),
                    "age": patient.get("age", ""),
                    "gender": patient.get("gender", ""),
                    "face": patient.get("face", ""),
                    "diagnosis": patient.get("diagnosis", ""),
                    "address": patient.get("address", ""),
                    "height": patient.get("height", ""),
                    "weight": patient.get("weight", ""),
                    "bloodSugarLevel": patient.get("bloodSugarLevel", ""),
                    "bloodPressure": patient.get("bloodPressure", ""),
                    "reasonForVisit": a["reason"]
                }
            })

    return appointments

#9.DELETE /appointments
@app.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    result = await appointment_collection.delete_one({"_id": ObjectId(appointment_id)})
    if result.deleted_count == 1:
        return {"message": "Appointment deleted successfully."}
    else:
        raise HTTPException(status_code=404, detail="Appointment not found.")









################################
# Clean dataset for few-shot prompting
df = pd.read_csv("EHR_cleaned.csv")

def to_float(val):
    try:
        return float(val)
    except:
        return None

df["admissionheight"] = df["admissionheight"].apply(to_float)
df["admissionweight"] = df["admissionweight"].apply(to_float)
df["unitvisitnumber"] = df["unitvisitnumber"].apply(to_float)

df = df.dropna(subset=["age", "admissionheight", "admissionweight", "unitvisitnumber", "apacheadmissiondx", "gender", "visittype"])

# Few-shot prompt generation
def row_to_prompt(row):
    return f"""Patient:
- Age: {int(row['age'])}
- Gender: {row['gender']}
- Height: {int(row['admissionheight'])} cm
- Weight: {int(row['admissionweight'])} kg
- Unit Visit Number: {int(row['unitvisitnumber'])}
- Diagnosis: {row['apacheadmissiondx']}
Visit Type: {row['visittype']}"""

few_shot_examples = "\n\n".join([row_to_prompt(row) for _, row in df.sample(5, random_state=42).iterrows()])

def build_prompt(data: Patient):
    return f"""You are a medical assistant. Based on the patient's information, predict the hospital visit type (Emergency, Follow-up, or Regular) without any reasoning.

{few_shot_examples}

Patient:
- Age: {data.age}
- Gender: {data.gender}
- Height: {data.admissionheight} cm
- Weight: {data.admissionweight} kg
- Unit Visit Number: {data.unitvisitnumber}
- Diagnosis: {data.apacheadmissiondx}
Visit Type:"""

def call_groq_api(prompt: str, api_key: str):
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "llama3-70b-8192",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 50,
        },
    )
    if response.status_code != 200:
        raise Exception(f"Groq API Error: {response.status_code}, {response.text}")
    return response.json()

def parse_response(result_json):
    content = result_json["choices"][0]["message"]["content"].strip()
    match = re.search(r"visit type to be: (\w+)", content, re.IGNORECASE)
    return match.group(1) if match else content


def get_valid_int(doc, field_name):
    value = doc.get(field_name, "")
    if value is None or str(value).strip() == "":
        raise ValueError(f"{field_name} is missing or empty.")
    return int(value)


#10.GET /predicting patient visit type
@app.get("/predict/{patient_id}")
async def predict_visit_type_from_db(patient_id: str):
    try:
        # 1. Fetch patient document
        patient_doc = await patients_collection.find_one({"_id": ObjectId(patient_id)})
        if not patient_doc:
            raise HTTPException(status_code=404, detail="Patient not found")

        # 2. Parse and validate all required fields
        try:
            patient = Patient(
                age=get_valid_int(patient_doc, "age"),
                gender=str(patient_doc.get("gender", "")).strip(),
                admissionheight=get_valid_int(patient_doc, "admissionheight"),
                admissionweight=get_valid_int(patient_doc, "admissionweight"),
                unitvisitnumber=get_valid_int(patient_doc, "unitvisitnumber"),
                apacheadmissiondx=str(patient_doc.get("apacheadmissiondx", "")).strip()
            )
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))

        # 3. Build prompt & call model
        prompt = build_prompt(patient)
        GROQ_API_KEY = "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"
        result = call_groq_api(prompt, GROQ_API_KEY)
        prediction = parse_response(result)

        return {
            "patient_details": patient.dict(),
            "predicted_visit_type": prediction
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
#######################

##Face capture using Yolo and face match using Faiss##



metadata = []
faiss_index = None

ENCODINGS_PATH = "encodings.h5"
#ENCODINGS_PATH = "encodings.npy"
METADATA_PATH = "metadata.json"

# Load FAISS Index
async def load_index_from_disk():
    global faiss_index, metadata

    if not os.path.exists(ENCODINGS_PATH) or not os.path.exists(METADATA_PATH):
        raise FileNotFoundError("Encodings or metadata files are missing.")


    try:
        with h5py.File(ENCODINGS_PATH, "r") as f:
            encodings_np = f["encodings"][:]
        faiss.normalize_L2(encodings_np)  # Normalize for IndexFlatIP
        with open(METADATA_PATH, "r") as f:
            metadata = json.load(f)

        faiss_index = faiss.IndexFlatIP(128)
        faiss_index.add(encodings_np)
        print("✅ FAISS index loaded from disk.")
    except Exception as e:
        print(f"❌ Error loading FAISS index: {e}")
        raise e

#11.POST / Match Face Endpoint
matched_patients = [] 
index_lock=asyncio.Lock()
@app.post("/match_face/")
async def match_face(file: UploadFile = File(...)):
    global faiss_index, metadata

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        np_image = np.array(image)

        encodings = face_recognition.face_encodings(np_image)
        if not encodings:
            raise HTTPException(status_code=400, detail="No face detected in the image.")

        uploaded_encoding = np.array(encodings[0], dtype=np.float32).reshape(1, -1)
        faiss.normalize_L2(uploaded_encoding)
        
        async with index_lock:
            if faiss_index is None or len(metadata) == 0 or faiss_index.ntotal == 0:
               await load_index_from_disk()

        print("✅ Performing FAISS search...")
        D, I = faiss_index.search(uploaded_encoding, k=1)

        similarity = D[0][0]
        index = I[0][0]

        print(f"🔎 Similarity: {similarity}")
        print(f"🔎 Index: {index}")

        if index < len(metadata):
            print(f"🔎 Closest Match: {metadata[index]}")

        if similarity > 0.9:  # Reduce threshold to test
            match = metadata[index]
            medical_id=match.get("medical_id")
            patient_from_db = await patients_collection.find_one({"medical_id": medical_id})            
            #to store matched patient and send result to frontend
            patient={
                "name":match.get("name"),
                "medical_id":match.get("medical_id"),
                "gender":patient_from_db["gender"],
                "age":patient_from_db['age'],
                "diagnosis":patient_from_db['reason'],
                "base_64":patient_from_db["image_base64"]
                
            }
            matched_patients.append(patient)
            
            return {
                "status": "matched",
                "name": match["name"], 
                #"medical_id":match["medical_id"]
            }

        return {"status": "not_found"}

    except Exception as e:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "message": f"Exception occurred: {str(e)}"
        })
executor = ThreadPoolExecutor()  

#12.GET /matched patients
@app.get("/match_patients")
async def get_matched_patients():
    return matched_patients

#13.POST /clear matched_patients
@app.post("/clear_matched_patients/")
async def clear_matched_patients():
    global matched_patients
    matched_patients.clear()
    return {"status": "cleared", "message": "All matched patients removed."}


async def append_encoding_to_index(new_encoding, new_metadata):
    global faiss_index, metadata

    new_encoding = np.array(new_encoding, dtype=np.float32).reshape(1, 128)
    faiss.normalize_L2(new_encoding)
    
    # Append to HDF5 encodings file
    if not os.path.exists(ENCODINGS_PATH):
        with h5py.File(ENCODINGS_PATH, "w") as f:
            f.create_dataset(
                "encodings",
                data=new_encoding,
                maxshape=(None, 128),
                chunks=True,
                dtype='float32'
            )
    else:
        with h5py.File(ENCODINGS_PATH, "a") as f:
            ds = f["encodings"]
            current_len = ds.shape[0]
            ds.resize((current_len + 1, 128))
            ds[current_len] = new_encoding

    # Update metadata JSON
    if not os.path.exists(METADATA_PATH):
        metadata = []
    else:
        with open(METADATA_PATH, "r") as f:
            metadata = json.load(f)
    metadata.append(new_metadata)

    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f)

    # Update in-memory FAISS index
    if faiss_index is None or faiss_index.ntotal == 0:
        with h5py.File(ENCODINGS_PATH, "r") as f:
            all_encodings = f["encodings"][:]
        faiss_index = faiss.IndexFlatIP(128)
        faiss_index.add(all_encodings)
    else:
        faiss_index.add(new_encoding)

        


#14.POST /Registering Patients
@app.post("/api/patients")
async def register_patient(
    name: str = Form(...),
    dob: str = Form(...),
    address: str = Form(...),
    phone_number: str = Form(...),
    email_id: str = Form(...),
    height: str = Form(...),
    weight: str = Form(...),
    blood_pressure: str = Form(...),
    age: str = Form(...),
    gender: str = Form(...),
    unitvisitnumber: str = Form(...),
    apacheadmissiondx: str = Form(...),
    picture: UploadFile = File(...)
):
    try:
        # Read image and convert to base64
        image_bytes = await picture.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # Load image using PIL and convert to numpy array
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))

        # Detect face and extract embeddings
        face_encodings = face_recognition.face_encodings(image)

        if not face_encodings:
            return JSONResponse(status_code=400, content={"error": "No face found in the image."})

        face_embedding = face_encodings[0].tolist()  # Convert NumPy array to list for MongoDB

        # Format phone number
        if not phone_number.startswith("+"):
            phone_number = "+91" + phone_number.lstrip("0")
        
        #medical id 
        medical_id = f"MD{str(uuid.uuid4())[:4].upper()}"
        # Create the patient document
        patient_doc = {
            "medical_id":medical_id,
            "name": name,
            "dob": dob,
            "address": address,
            "phone_number": phone_number,
            "email_id": email_id,
            "height": height,
            "weight": weight,
            "blood_pressure": blood_pressure,
            "age": age,
            "gender": gender,
            "unitvisitnumber": unitvisitnumber,
            "apacheadmissiondx": apacheadmissiondx,
            "image_base64": image_base64,
            "face_embedding": face_embedding
        }

        # Insert into MongoDB
        insert_result = await patients_collection.insert_one(patient_doc)
        
        #only append if encodoing exists 
        if face_embedding:
            await append_encoding_to_index(
                face_embedding,
                {"name":name,
                "medical_id":medical_id}
            )
            
        # # Send SMS using Twilio
        # message = twilio_client.messages.create(
        #     body=f"Hi {name}, you are successfully registered at the hospital.",
        #     from_=twilio_number,
        #     to=phone_number
        # )

        return {
            "message": "Patient registered successfully",
            #"sms_sid": message.sid,
            #"patient_id": str(insert_result.inserted_id)
        }

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})




executor = ThreadPoolExecutor()



def blocking_get_patient(object_id):
    patient = patients_collection.find_one({"_id": object_id})
    print("🔍 blocking_get_patient result:", patient)
    return patient

# ✅ This wraps the blocking function in a thread
async def get_patient_from_db(object_id):
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(executor, blocking_get_patient, object_id)
    print("✅ get_patient_from_db result:", result)
    return result

#15.GET /Patient by their medical_id
@app.get("/get_patient/{medical_id}")
async def get_patient(medical_id: str):
    from bson import ObjectId

    try:
        patient = await patients_collection.find_one({"_id": ObjectId(medical_id)})
    except Exception as e:
        print(f"⚠️ Error converting to ObjectId: {e}")
        raise HTTPException(status_code=400, detail="Invalid medical ID format")

    if not patient:
        print("❌ Patient not found in DB")
        raise HTTPException(status_code=404, detail="Patient not found")

    patient["_id"] = str(patient["_id"])
    return patient



##16.POST /predict and notify

@app.post("/predict_and_notify/{patient_id}")
async def predict_and_notify(patient_id: str, reason_for_visit: str = Body(...)):
    try:
        # Convert and validate ObjectId
        try:
            patient_obj_id = ObjectId(patient_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid patient ID format")

        # Fetch patient document
        patient_doc = await patients_collection.find_one({"_id": patient_obj_id})
        if not patient_doc:
            raise HTTPException(status_code=404, detail="Patient not found")

        # Parse and validate fields
        try:
            patient = Patient(
                age=get_valid_int(patient_doc, "age"),
                gender=str(patient_doc.get("gender", "")).strip(),
                admissionheight=get_valid_int(patient_doc, "height"),
                admissionweight=get_valid_int(patient_doc, "weight"),
                unitvisitnumber=get_valid_int(patient_doc, "unitvisitnumber"),
                apacheadmissiondx=str(patient_doc.get("apacheadmissiondx", "")).strip()
            )
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))

        # Build enhanced prompt
        prompt = build_prompt(patient) + f"\nAdditional Visit Reason: {reason_for_visit}\nVisit Type:"

        # Call GROQ API
        GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        result = call_groq_api(prompt, GROQ_API_KEY)
        prediction_raw = parse_response(result)
        prediction = prediction_raw.strip().capitalize()

        print(f"Prediction raw: '{prediction_raw}' → normalized: '{prediction}'")

        # Department contact mapping
        department_mapping = {
            "Emergency": "+919952560548",
            "Follow-up": "+919952560549",
            "Regular": "+919952560550"
        }

        contact_number = department_mapping.get(prediction)
        if not contact_number:
            raise HTTPException(status_code=400, detail=f"No contact number mapped for predicted type '{prediction}'")

        # Send SMS to department
        dept_message = twilio_client.messages.create(
            body=f"A new {prediction} patient has been registered. Patient: {patient_doc['name']}, Reason: {reason_for_visit}",
            from_=twilio_number,
            to=contact_number
        )

        return {
            "message": "Prediction made and department notified successfully",
            "predicted_visit_type": prediction,
            "department_contacted": contact_number,
            "department_sms_sid": dept_message.sid
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction and notification failed: {str(e)}")


#17.GET /check notification
@app.get("/check_notification/{patient_id}")
async def check_notification(patient_id: str):
    try:
        print(f"Received patient ID: {patient_id}")
        try:
            patient_obj_id = ObjectId(patient_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid patient ID format")

        patient_doc = await patients_collection.find_one({"_id": patient_obj_id})
        if not patient_doc:
            raise HTTPException(status_code=404, detail="Patient not found")

        # Extract notification fields
        prediction = patient_doc.get("last_prediction")
        sms_sid = patient_doc.get("last_sms_sid")
        reason = patient_doc.get("last_reason", "Not provided")
        notified_at = patient_doc.get("notified_at")

        if not prediction or not sms_sid:
            return {
                "notified": False,
                "message": "No notification has been sent yet for this patient."
            }

        return {
            "notified": True,
            "predicted_visit_type": prediction,
            "reason_for_visit": reason,
            "twilio_message_sid": sms_sid,
            "notified_at": notified_at,
            "emergency_notified": prediction.lower() == "emergency"
        }

    except Exception as e:
        print("Check notification error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to check notification status")
