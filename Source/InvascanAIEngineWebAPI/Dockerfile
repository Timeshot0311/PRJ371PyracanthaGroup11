# Use official Python base image
FROM python:3.11-slim

# Set environment variables for production
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /invascanapi
LABEL maintainer="PRJ371 Group 11"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY ./webapi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./webapi ./webapi

# Expose the port
EXPOSE 8006


# Start Gunicorn with Uvicorn workers
#CMD ["which", "gunicorn"]
CMD ["gunicorn", "webapi.maincontroller:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8006", "--workers", "4", "--timeout", "60"]
#CMD ["uvicorn", "webapi.maincontroller:app", "--host", "0.0.0.0", "--port", "8006"]
