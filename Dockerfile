# Használj egy hivatalos Python image-et
FROM python:3.9-slim

# Állítsd be a munkakönyvtárat
WORKDIR /app

# Másold be a függőségeket és telepítsd őket
COPY app/requirements.txt .
RUN pip install -r requirements.txt

# Másold be a teljes alkalmazást
COPY app/ .

# Indítsd el az alkalmazást
CMD ["python", "app.py"]
