
# 🧠 Coletor e Analista de Tweets com Firebase e OpenAI

## 📌 Objetivo

Este script automatiza a coleta de tweets de listas do Twitter utilizando **Selenium**, realiza uma análise semântica dos tweets com **OpenAI GPT**, e salva os dados enriquecidos no **Firebase Realtime Database**.

---

## 🧩 Tecnologias Utilizadas

- **Python 3**
- **Selenium WebDriver** (coleta de dados no Twitter)
- **Firebase Admin SDK** (armazenamento de dados)
- **OpenAI API (GPT-4.1)** (análise dos tweets)
- **ChromeDriver** (navegação automatizada)

---

## ⚙️ Configurações Necessárias

### Variáveis de Configuração

```python
USERNAME = "TWITTER-USERNAME"
PASSWORD = "TWITTER-PASSWORD"
SERVICE_ACCOUNT_PATH = "serviceAccountKey.json"
FIREBASE_DB_URL = "FIREBASE_DB_URL"
OPENAI_API_KEY = "OPEN_AI_API_KEY"
```

### Listas Monitoradas

```python
twitter_lists = [
    {"tag": "All", "url": "https://x.com/i/lists/ID1"},
    {"tag": "BTC", "url": "https://x.com/i/lists/ID2"},
    {"tag": "cyberseguranca", "url": "https://twitter.com/i/lists/ID3"}
]
```

---

## 🔐 Inicializações

### Firebase

```python
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred, {"databaseURL": FIREBASE_DB_URL})
```

### OpenAI

```python
openai.api_key = OPENAI_API_KEY
```

---

## 🧠 Função: Análise de Tweet com IA

```python
def analisar_tweet_com_ia(texto):
```

- **Entrada:** Texto de um tweet.
- **Processo:** Gera um prompt estruturado e envia à API da OpenAI (GPT-4.1).
- **Saída esperada (JSON):**

```json
{
  "insight": "Resumo da oportunidade",
  "importance_level": 1 a 5
}
```

---

## 🌐 Navegador (Selenium + Chrome)

```python
options = Options()
driver = webdriver.Chrome(service=Service(), options=options)
```

---

## 🔑 Login Automático no Twitter

Utiliza Selenium para realizar login usando as credenciais fornecidas:

1. Acessa `https://twitter.com/login`
2. Preenche usuário e senha
3. Acessa as listas configuradas

---

## 📦 Leitura de Dados Existentes no Firebase

```python
existing_data = ref.get() or {}
existing_ids = set(v.get("tweet_id") for v in existing_data.values())
```

Evita salvar tweets duplicados.

---

## 🔁 Loop de Coleta e Análise

Para cada lista no array `twitter_lists`:

1. Abre a lista no navegador.
2. Espera os tweets carregarem.
3. Coleta até 10 tweets visíveis.
4. Para cada tweet:
   - Extrai texto, imagem, timestamp, nome de usuário e ID do tweet.
   - Verifica se é novo.
   - Envia para a IA.
   - Salva no Firebase com dados enriquecidos.

---

## 📄 Estrutura dos Dados Salvos

```json
{
  "tweet_id": "1234567890",
  "username": "usuário",
  "text": "conteúdo do tweet",
  "image_url": "https://...",
  "timestamp": "2025-07-01T12:34:56.000Z",
  "source_list": "BTC",
  "insight": "possível oportunidade em ativos digitais",
  "importance_level": 4
}
```

---

## ✅ Logs de Execução

- `✅ Tweet salvo:` Novo tweet salvo com sucesso.
- `⚠️ Tweet duplicado:` Tweet já estava salvo anteriormente.
- `❌ Erro:` Falha ao processar ou extrair dados de um tweet.
- `Erro na IA:` Falha na comunicação com a OpenAI.

---

## 🧹 Finalização

```python
driver.quit()
print("\n🎯 Finalizado com sucesso!")
```

O navegador é encerrado e a execução termina.

---

## 🔐 Requisitos Adicionais

- **ChromeDriver** instalado e compatível com o navegador Chrome.
- **Proxies/VPNs** podem ser úteis para evitar bloqueios por automação.
- **Permissões adequadas no Firebase** para escrita no Realtime Database.
- **Limites de requisição da OpenAI** devem ser respeitados.

---

## 🚀 Possíveis Extensões

- Dockerização do script
- Agendamento com cron, PM2 ou n8n
- Execução headless
- Visualização dos dados em frontend (React + Tailwind + Firebase)

---
