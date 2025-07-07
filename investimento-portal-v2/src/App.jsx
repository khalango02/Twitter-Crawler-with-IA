import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { motion, AnimatePresence } from "framer-motion";
import BitcoinChart from "./bitcoinChart";


export default function App() {
  const [tweets, setTweets] = useState([]);
  const [filterLevel, setFilterLevel] = useState("All");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState(null);

  useEffect(() => {
    const tweetsRef = ref(db, "twitter-list-tweets");
    onValue(tweetsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const list = Object.values(data).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setTweets(list);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);


  const getColorClass = (level) => {
    return {
      1: "bg-gray-500",
      2: "bg-blue-500",
      3: "bg-yellow-400",
      4: "bg-orange-500",
      5: "bg-red-600",
    }[level] || "bg-gray-500";
  };

  const filteredTweets =
    filterLevel === "All"
      ? tweets
      : tweets.filter((tweet) => tweet.importance_level === parseInt(filterLevel));

  return (
    <div className="flex h-screen bg-[#0d1117] text-white font-sans">
      <aside className="w-[320px] bg-[#161b22] border-r border-[#30363d] overflow-y-auto p-4">
        <div className="mb-4">
          <label className="block text-sm mb-1">Filtrar por importância:</label>
          <select
            className="w-full bg-[#0d1117] border border-gray-600 rounded px-2 py-1 text-white"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="All">Todos</option>
            {[1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                Nível {level}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filteredTweets.map((tweet) => (
              <motion.div
                key={tweet.tweet_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative group flex items-start space-x-3 p-2 rounded-lg hover:bg-[#21262d] transition cursor-pointer"
                onClick={() => {
                  setSelectedTweet(tweet);
                  setModalOpen(true);
                }}
              >
                <img
                  src={tweet.image_url || "/default-profile.png"}
                  alt="Usuário"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {tweet.username}
                    </span>
                    <span
                      className={`w-3 h-3 rounded-full ${getColorClass(
                        tweet.importance_level
                      )}`}
                    />
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-3 mt-1">{tweet.text}</p>
                  <p className="text-xs text-gray-300 line-clamp-3 mt-1">
                    {new Date(tweet.timestamp).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
                {tweet.insight && tweet.insight !== "Nenhum" && (
                  <div className="absolute z-50 left-full top-2 ml-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg w-64">
                    <strong>Insight:</strong> {tweet.insight}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>
      <div className="flex-1 overflow-y-auto p-4">
        <BitcoinChart />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && selectedTweet && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)} // fecha modal clicando fora
          >
            <motion.div
              className="bg-[#161b22] rounded-lg p-6 max-w-lg max-h-[80vh] overflow-auto text-white flex flex-col"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()} // previne fechar ao clicar dentro da modal
            >
              {/* Cabeçalho: imagem + nome lado a lado */}
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={selectedTweet.image_url}
                  alt="Imagem do usuário"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <h3 className="text-xl font-bold">{selectedTweet.username}</h3>
              </div>

              {/* Texto do tweet */}
              <p className="whitespace-pre-wrap mb-4">{selectedTweet.text}</p>

              {/* Insight, se houver */}
              {selectedTweet.insight && selectedTweet.insight !== "Nenhum" && (
                <p className="bg-gray-800 p-3 rounded mb-4 text-sm italic text-gray-300">
                  {selectedTweet.insight}
                </p>
              )}

              <p className="text-sm text-gray-300 mt-1">
                {new Date(selectedTweet.timestamp).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>


              {/* Botão fechar */}
              <button
                className="ml-auto bg-red-500 px-4 py-1 rounded hover:bg-red-600"
                onClick={() => setModalOpen(false)}
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
