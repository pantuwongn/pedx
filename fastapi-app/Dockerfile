# fastapi
FROM python:3.10.4-alpine
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN apk add curl
RUN apk update && apk add gcc g++ unixodbc unixodbc-dev
RUN curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/msodbcsql17_17.9.1.1-1_amd64.apk
RUN curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/mssql-tools_17.9.1.1-1_amd64.apk
RUN apk add --allow-untrusted msodbcsql17_17.9.1.1-1_amd64.apk
RUN apk add --allow-untrusted mssql-tools_17.9.1.1-1_amd64.apk
RUN pip install --no-cache-dir -r /code/requirements.txt
COPY ./app /code/app
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000","--reload"]