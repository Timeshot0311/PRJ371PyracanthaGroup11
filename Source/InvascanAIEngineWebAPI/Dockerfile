FROM python:3.9

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /invascanwebapi

COPY ./webapi /invascanwebapi/webapi

WORKDIR /invascanwebapi/webapi

RUN pip install -r requirements.txt

EXPOSE 8006

CMD ["uvicorn", "maincontroller:app", "--host", "0.0.0.0", "--port", "8006"]
