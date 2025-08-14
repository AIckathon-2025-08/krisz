FROM python:3.9-slim

# Set the working dir
WORKDIR /app

# Copy requirements and install
COPY app/requirements.txt .
RUN pip install -r requirements.txt

# Copy the whole
COPY app/ .

# Start the app
CMD ["python", "app.py"]
