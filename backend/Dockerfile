FROM python:3.9-slim

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar Poetry y agregarlo al PATH
ENV POETRY_HOME=/opt/poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry --version

# Configurar Poetry para no crear un virtualenv
RUN poetry config virtualenvs.create false

WORKDIR /app

# Copiar todo el código primero
COPY . .

# Instalar dependencias
RUN poetry install --no-interaction --no-ansi

# Exponer el puerto
EXPOSE 7013

# Comando para ejecutar la aplicación FastAPI
CMD ["poetry", "run", "uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "7013"]