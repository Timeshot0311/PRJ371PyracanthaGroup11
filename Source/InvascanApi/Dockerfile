# Use official Python base image
FROM python:3.11-slim

# Set environment variables for production
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /invascanapi
LABEL maintainer="PRJ371 Group 11"

# Install system dependencies
RUN apt-get update && apt-get install -y curl gnupg2 apt-transport-https

# Add Microsoft repository keys
RUN mkdir -p /etc/apt/keyrings
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg && \
    chmod go+r /etc/apt/keyrings/microsoft.gpg && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/11/prod bullseye main" > /etc/apt/sources.list.d/mssql-release.list

#RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -


# Add the Microsoft Ubuntu repository (adjust for your base distro version)
#RUN curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list > /etc/apt/sources.list.d/mssql-release.list

#RUN apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev
RUN apt-get update && \
    ACCEPT_EULA=Y apt-get install -y --no-install-recommends && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc && \
    #ACCEPT_EULA=Y apt-get install -y unixodbc-dev \
    apt-get install -y unixodbc-dev && \
    apt-get install -y libgssapi-krb5-2

ENV PATH="$PATH:/opt/mssql-tools/bin"

# Install other dependencies you want
RUN apt-get install -y build-essential libgl1 libglib2.0-0

# Clean up apt cache to reduce image size
RUN rm -rf /var/lib/apt/lists/*


#RUN apt-get update && apt-get install -y \
#    build-essential \
#    libgl1 \
#    libglib2.0-0 \
##    unixodbc-dev \
##    msodbcsql18 \
#    && rm -rf /var/lib/apt/lists/*
#
#
## sql server drivers and bcp
#RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
#    curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
#    apt-get update && \
#    ACCEPT_EULA=Y apt-get install -y msodbcsql17 && \
#    ACCEPT_EULA=Y apt-get install -y mssql-tools && \
#    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc && \
#    apt-get install -y unixodbc-dev && \
#    apt-get install -y libgssapi-krb5-2


# Install Python dependencies
COPY ./invascanapi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./invascanapi ./invascanapi

# Expose the port
EXPOSE 8006
EXPOSE 80


# Start Gunicorn with Uvicorn workers
#CMD ["which", "gunicorn"]
CMD ["gunicorn", "invascanapi.main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:80", "--workers", "4", "--timeout", "60"]
#CMD ["gunicorn", "webapi.maincontroller:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:80", "--workers", "4", "--timeout", "60"]
#CMD ["uvicorn", "webapi.maincontroller:app", "--host", "0.0.0.0", "--port", "8006"]
