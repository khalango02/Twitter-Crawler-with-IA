FROM python:3.11-slim

# Instala dependências do sistema
RUN apt-get update && \
    apt-get install -y \
        cron \
        wget \
        unzip \
        xvfb \
        libxi6 \
        libgconf-2-4 \
        libnss3 \
        libxss1 \
        libappindicator3-1 \
        fonts-liberation \
        libatk-bridge2.0-0 \
        libgtk-3-0 \
        libx11-xcb1 \
        libasound2 \
        gnupg \
        curl && \
    rm -rf /var/lib/apt/lists/*

# Instala o Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && apt-get install -y google-chrome-stable

# Instala o ChromeDriver compatível
RUN CHROME_VERSION=$(google-chrome --version | grep -oP '[0-9.]+' | head -1) && \
    CHROMEDRIVER_VERSION=$(curl -s "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_VERSION%.*}") && \
    wget -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin && \
    chmod +x /usr/local/bin/chromedriver

# Cria pasta do app
WORKDIR /app

# Copia arquivos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sel.py .
COPY crontab.txt .
COPY serviceAccountKey.json .

# Configura cron
RUN crontab crontab.txt

# Inicia cron + loop
CMD ["sh", "-c", "cron && tail -f /var/log/cron.log"]
