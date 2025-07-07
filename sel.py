import time
import json
import firebase_admin
from firebase_admin import credentials, db
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import openai

USERNAME = "TWITTER-USERNAME"
PASSWORD = "TWITTER-PASSWORD"
SERVICE_ACCOUNT_PATH = "serviceAccountKey.json"
FIREBASE_DB_URL = "FIREBASE_DB_URL"
OPENAI_API_KEY = "OPEN_AI_API_KEY"

twitter_lists = [
    {"tag": "All", "url": "https://x.com/i/lists/ID1"},
    {"tag": "BTC", "url": "https://x.com/i/lists/ID2"},
    {"tag": "cyberseguranca", "url": "https://twitter.com/i/lists/ID3"}
]

cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred, {"databaseURL": FIREBASE_DB_URL})
openai.api_key = OPENAI_API_KEY

def analisar_tweet_com_ia(texto):
    prompt = f"""
Analise o seguinte tweet e diga se ele contém informação relevante sobre investimentos.

Responda em JSON com duas chaves: 
- "insight": um resumo da oportunidade (ou "Nenhum")
- "importance_level": número de 1 a 5 (5 = muito importante)

Tweet: "{texto}"
"""
    try:
        time.sleep(20)
        response = openai.ChatCompletion.create(
            model="gpt-4.1",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        content = response.choices[0].message.content.strip()
        return json.loads(content)
    except Exception as e:
        print("Erro na IA:", e)
        return {"insight": "Erro na IA", "importance_level": 0}

# ========== SETUP NAVEGADOR ==========
options = Options()
options.add_argument("--window-size=1200,800")
driver = webdriver.Chrome(service=Service(), options=options)

driver.get("https://twitter.com/login")
WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.NAME, "text")))
driver.find_element(By.NAME, "text").send_keys(USERNAME)
driver.find_element(By.XPATH, '//span[text()="Avançar"]').click()
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "password")))
driver.find_element(By.NAME, "password").send_keys(PASSWORD)
driver.find_element(By.XPATH, '//span[text()="Entrar"]').click()
time.sleep(5)

ref = db.reference("twitter-list-tweets")
existing_data = ref.get() or {}
existing_ids = set(v.get("tweet_id") for v in existing_data.values() if "tweet_id" in v)

for lista in twitter_lists:
    tag = lista["tag"]
    url = lista["url"]
    print(f"\n📥 Coletando da lista: {tag}")

    driver.get(url)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, "article")))
    time.sleep(2)
    driver.execute_script("window.scrollTo(0, 2000)")
    time.sleep(3)

    tweets = driver.find_elements(By.CSS_SELECTOR, "article")[:10]

    for tweet in tweets:
        try:
            text_elem = tweet.find_element(By.XPATH, './/div[@data-testid="tweetText"]')
            text = text_elem.text.strip()

            try:
                img_elem = tweet.find_element(By.XPATH, './/img[contains(@src, "twimg")]')
                img_url = img_elem.get_attribute("src")
            except:
                img_url = ""

            try:
                time_elem = tweet.find_element(By.TAG_NAME, "time")
                timestamp = time_elem.get_attribute("datetime")
            except:
                timestamp = ""

            try:
                user_elem = tweet.find_element(By.XPATH, './/div[@dir="ltr"]/span')
                username = user_elem.text
            except:
                username = ""

            try:
                tweet_link_elem = tweet.find_element(By.XPATH, './/a[contains(@href, "/status/")]')
                tweet_url = tweet_link_elem.get_attribute("href")
                tweet_id = tweet_url.split("/")[-1]
            except:
                tweet_id = None

            if tweet_id and tweet_id not in existing_ids:
                ia_result = analisar_tweet_com_ia(text)

                tweet_data = {
                    "tweet_id": tweet_id,
                    "username": username,
                    "text": text,
                    "image_url": img_url,
                    "timestamp": timestamp,
                    "source_list": tag,
                    "insight": ia_result.get("insight", ""),
                    "importance_level": ia_result.get("importance_level", 0)
                }

                ref.push(tweet_data)
                print(f"✅ Tweet salvo: {tweet_id} | Importância: {tweet_data['importance_level']}")
            else:
                print(f"⚠️ Tweet duplicado (não salvo): {tweet_id}")

        except Exception as e:
            print("❌ Erro ao processar tweet:", e)

driver.quit()
print("\n🎯 Finalizado com sucesso!")
