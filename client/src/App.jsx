import { useState } from "react";
import axios from "axios";
import './index.css';

function App() {
    const [input, setInput] = useState("");
    const [reply, setReply] = useState("");

    const handleAsk = async () => {
        if (!input.trim()) return;
        const res = await axios.post("http://localhost:3001/api/ask", {
            message: input,
        });
        setReply(res.data.reply);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-3xl bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-8 sm:p-12 border border-white/40">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-4 tracking-tight">
                    What 2 Wear
                </h1>
                <p className="text-center text-gray-600 mb-8 text-lg">
                    Wondering what to wear today? Ask me what to wear based on the weather in your city.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="e.g. Can I wear shorts in Amsterdam?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-grow px-5 py-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg shadow-sm transition"
                    />
                    <button
                        onClick={handleAsk}
                        className="px-6 py-4 rounded-xl bg-sky-500 text-white text-lg font-semibold hover:bg-sky-600 transition shadow-lg"
                    >
                        Ask AI
                    </button>
                </div>

                {reply && (
                    <div className="bg-white border border-sky-200 rounded-xl p-6 text-center shadow-inner">
                        <h3 className="text-xl font-semibold text-sky-700 mb-2">Answer</h3>
                        <p className="text-gray-800 text-lg">{reply}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
