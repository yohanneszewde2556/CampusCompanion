import { useState } from 'react';
import api from '../services/api';

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('chat'); // chat, summarize, quiz
  const [inputVal, setInputVal] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // For quizzes or summaries

  const handleChat = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMessage = { role: 'user', content: inputVal };
    setChatHistory([...chatHistory, userMessage]);
    setInputVal('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai-assistant/chat', {
        message: userMessage.content,
        // sending limited history for context
        contextHistory: chatHistory.slice(-5)
      });
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Error connecting to AI Server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const { data } = await api.post('/ai-assistant/summarize', {
        title: "User Note",
        content: inputVal
      });
      setResults({ type: 'summary', content: data.summary });
    } catch (err) {
      console.error(err);
      setResults({ type: 'error', content: "Failed to summarize text." });
    } finally {
      setLoading(false);
      setInputVal('');
    }
  };

  const handleQuiz = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const { data } = await api.post('/ai-assistant/generate-quiz', {
        content: inputVal
      });
      setResults({ type: 'quiz', data: data.quizzes });
    } catch (err) {
      console.error(err);
      setResults({ type: 'error', content: "Failed to generate quiz." });
    } finally {
      setLoading(false);
      setInputVal('');
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      {/* Left Sidebar for Tabs */}
      <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3">
        <h2 className="text-xl font-bold mb-2 dark:text-white px-2">AI Tools</h2>
        <button 
          onClick={() => { setActiveTab('chat'); setResults(null); setInputVal(''); }}
          className={`p-4 rounded-xl text-left font-semibold transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1' : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
          💬 Spark Chat
        </button>
        <button 
          onClick={() => { setActiveTab('summarize'); setResults(null); setInputVal(''); }}
          className={`p-4 rounded-xl text-left font-semibold transition-all ${activeTab === 'summarize' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30  translate-x-1' : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
          📝 Quick Summarizer
        </button>
        <button 
          onClick={() => { setActiveTab('quiz'); setResults(null); setInputVal(''); }}
          className={`p-4 rounded-xl text-left font-semibold transition-all ${activeTab === 'quiz' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 translate-x-1' : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
          🎯 Generate Quiz
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full md:w-3/4 flex flex-col gap-4">
        {/* Output Display */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          
          {activeTab === 'chat' && (
            <div className="flex flex-col gap-4 h-full">
              {chatHistory.length === 0 ? (
                <div className="m-auto text-center">
                   <h3 className="text-xl font-bold dark:text-white mb-2">Hello! I'm Spark</h3>
                   <p className="text-gray-500 dark:text-gray-400">Ask me anything about your courses, schedules, or homework!</p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} className={`p-4 rounded-xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white self-end rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 self-start rounded-bl-none'}`}>
                    {msg.content}
                  </div>
                ))
              )}
              {loading && <div className="self-start p-4 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-xl rounded-bl-none animate-pulse">Spark is typing...</div>}
            </div>
          )}

          {activeTab === 'summarize' && (
             <div className="h-full">
               <h3 className="font-bold text-xl mb-4 text-emerald-700 dark:text-emerald-400">Note Summary</h3>
               {results?.type === 'summary' ? (
                 <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 text-gray-800 dark:text-gray-300 rounded-xl whitespace-pre-wrap leading-relaxed shadow-inner">{results.content}</div>
               ) : results?.type === 'error' ? (
                 <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">{results.content}</div>
               ) : (
                 <div className="text-gray-400 flex items-center justify-center h-full text-center px-10">
                   Paste your lengthy textbook chapters or lecture notes below, and I will condense them into bite-sized key points.
                 </div>
               )}
             </div>
          )}

          {activeTab === 'quiz' && (
            <div className="h-full">
              <h3 className="font-bold text-xl mb-4 text-purple-700 dark:text-purple-400">Knowledge Check</h3>
              {results?.type === 'quiz' ? (
                <div className="flex flex-col gap-6">
                  {results.data.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                      <p className="font-semibold mb-4 dark:text-white text-lg">{idx + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors shadow-sm">{opt}</div>
                        ))}
                      </div>
                      <div className="pt-3 mt-4 border-t border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                           Answer: {q.correctAnswer}
                         </span>
                         {q.explanation && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">{q.explanation}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : results?.type === 'error' ? (
                <div className="text-red-500">{results.content}</div>
              ) : (
                <div className="text-gray-400 flex items-center justify-center h-full text-center px-10">
                   Paste any study material below to generate a focused multiple-choice quiz and test your understanding dynamically. Hover over questions to reveal answers!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={activeTab === 'chat' ? handleChat : activeTab === 'summarize' ? handleSummarize : handleQuiz} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-3 items-end">
          {activeTab === 'chat' ? (
            <input 
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Message Spark AI..."
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 dark:text-white transition-all shadow-inner"
            />
          ) : (
            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={activeTab === 'summarize' ? "Paste your notes to summarize..." : "Paste study material to generate quiz..."}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 min-h-24 dark:text-white transition-all resize-none shadow-inner"
            />
          )}
          <button 
            type="submit" 
            disabled={loading}
            className={`px-8 py-4 rounded-xl text-white font-bold transition-all shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'} ${activeTab === 'chat' ? 'bg-blue-600 shadow-blue-500/30' : activeTab === 'summarize' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-purple-600 shadow-purple-500/30'}`}>
            {loading ? 'Processing...' : 'Send'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIAssistant;
