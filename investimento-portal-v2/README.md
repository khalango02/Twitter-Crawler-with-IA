
# 🌐 Frontend de Visualização de Tweets com Insights de Investimento

## 📌 Objetivo

Esta aplicação React exibe em tempo real os tweets coletados e analisados por IA no backend. Os tweets são classificados por nível de importância e podem conter insights de investimento, exibidos em um layout moderno e responsivo.

---

## 🧩 Tecnologias Utilizadas

- **React**
- **Tailwind CSS**
- **Framer Motion** (animações)
- **Firebase Realtime Database**
- **Chart.js ou Recharts** (gráfico de Bitcoin)
- **ESLint + Prettier** (opcional)

---

## 🧠 Funcionalidades Principais

- Leitura em tempo real de tweets do Firebase
- Filtro por nível de importância (1 a 5 ou Todos)
- Modal com detalhes completos do tweet
- Animações com Framer Motion
- Tooltip com insight da IA ao passar o mouse
- Gráfico de Bitcoin exibido ao lado (componente separado)

---

## 🗂️ Organização dos Componentes

- `App.jsx`: Componente principal, gerencia estado, layout e modais
- `firebase.js`: Configuração do Firebase
- `bitcoinChart.jsx`: Componente de gráfico (ex: Bitcoin)

---

## 📦 Estados e Efeitos

### Estados
```jsx
const [tweets, setTweets] = useState([]);
const [filterLevel, setFilterLevel] = useState("All");
const [modalOpen, setModalOpen] = useState(false);
const [selectedTweet, setSelectedTweet] = useState(null);
```

### Efeitos
- Leitura em tempo real de dados do Firebase
- Fechamento da modal ao pressionar ESC

---

## 🎨 Lógica de Cor por Importância

```js
{
  1: "bg-gray-500",
  2: "bg-blue-500",
  3: "bg-yellow-400",
  4: "bg-orange-500",
  5: "bg-red-600",
}
```

---

## 🧠 Tooltip de Insight

Exibido apenas quando `tweet.insight` não for `"Nenhum"`:
```jsx
{tweet.insight && tweet.insight !== "Nenhum" && (
  <div className="tooltip">{tweet.insight}</div>
)}
```

---

## 🧵 Modal de Tweet

Exibido ao clicar em um tweet:
- Imagem de perfil
- Nome do usuário
- Texto completo
- Insight (se houver)
- Timestamp formatado
- Botão de fechar

---

## 📊 Gráfico Bitcoin

O componente `BitcoinChart` é exibido no painel direito e pode mostrar dados de mercado em tempo real.

---

## 🎯 Experiência do Usuário

- Interface escura e moderna com Tailwind CSS
- Feedback visual com animações suaves
- Responsivo e com acessibilidade básica (ESC para fechar modal)

---

## 🚀 Sugestões de Extensão

- Marcar tweets como "favoritos"
- Exportar dados
- Adicionar indicadores no gráfico (ex: RSI, MACD)
- Integração com notificações por e-mail ou Telegram
- Autenticação de usuário (ex: Firebase Auth)

---

## 📁 Estrutura do Firebase esperada

```json
{
  "tweet_id": "123",
  "username": "nome",
  "text": "conteúdo",
  "image_url": "https://...",
  "timestamp": "2025-07-01T12:00:00Z",
  "source_list": "BTC",
  "insight": "recomendação",
  "importance_level": 3
}
```

---
