FROM python:3.9
WORKDIR /invascanapi
COPY ./webapi/requirements.txt .
RUN pip install -r requirements.txt
COPY ./webapi ./webapi
EXPOSE 8006
CMD ["uvicorn", "maincontroller:app", "--host", "0.0.0.0", "--port", "8006"]