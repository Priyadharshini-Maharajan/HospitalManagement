from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["HospitalManagementSystem"]
patients_collection = db["patients"]
doctor_collection=db["doctors"]
appointment_collection=db["appointments"]
receptionist_collection=db["receptionist"]