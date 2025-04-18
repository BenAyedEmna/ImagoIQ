from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, Photo
import os
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from fastapi.responses import StreamingResponse
from io import BytesIO
from fastapi.responses import JSONResponse

app = FastAPI()

# Charger le modèle BLIP
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB setup
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:adminpg@localhost/appdata_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/photo-analyze-upload/")
async def analyze_and_save(photo: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Lire l'image
        photo_data = await photo.read()
        image = Image.open(BytesIO(photo_data))

        # Analyse
        inputs = processor(images=image, return_tensors="pt")
        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)

        # Enregistrement dans la base
        new_photo = Photo(
            filename=photo.filename,
            content=photo_data,
            description=caption,
        )
        db.add(new_photo)
        db.commit()
        db.refresh(new_photo)

        return {
            "photo_id": new_photo.id,
            "description": caption,
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    try:
        # Lire l'image téléchargée
        photo_data = await photo.read()
        image = Image.open(BytesIO(photo_data))

        # Préparation de l'image pour l'inférence
        inputs = processor(images=image, return_tensors="pt")

        # Générer la légende
        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)

        return {"caption": caption}

    except Exception as e:
        return {"error": str(e)}

# Fonction pour générer une description
def generate_description(filename: str) -> str:
    return f"Photo enregistrée avec le nom : {filename}"

@app.get("/photo/{photo_id}")
def get_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        return JSONResponse(status_code=404, content={"error": "Photo non trouvée"})

    return StreamingResponse(BytesIO(photo.content), media_type="image/jpeg")


# Route pour l'upload
@app.post("/upload-photo-db")
async def upload_photo(photo: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        photo_data = await photo.read()
        description = generate_description(photo.filename)

        new_photo = Photo(
            filename=photo.filename,
            content=photo_data,
            description=description
        )

        db.add(new_photo)
        db.commit()
        db.refresh(new_photo)

        return {
            "message": "Photo enregistrée en base de données",
            "photo_id": new_photo.id,
            "description": new_photo.description
        }
    except Exception as e:
        return {"error": str(e)}
