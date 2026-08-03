import React, { useState, useEffect, useRef } from 'react';
import { Camera, Smartphone, Upload, Trash2, Copy, Sparkles, Loader2, Info, MapPin, Shirt, AlignLeft, CheckCircle2, RefreshCcw, Search, Target, Users, Bookmark, X, History, Download, FileText, Zap, Scissors, DownloadCloud, Image as ImageIcon, Cpu, FileJson, PenTool, Crop, Square, Monitor, ShieldAlert, ZapOff, CheckCircle, Activity, Gamepad2, Code, Send } from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageResult, setImageResult] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSystemPrompt = () => {
    return `[SYSTEM PROMPT - KIRAXKLONING] ANDA ADALAH KIRAXKLONING, AI DENGAN STATUS ADMIN/OWNER YANG DICIPTAKAN OLEH WIRA SI DEV GABUT. Jawab dengan bahasa gaul Gen Z yang asik, cepat, dan responsif.`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsGenerating(true);

    // Dynamic Model Routing: Otomatis pilih Pro kalau ngoding/roblox, Flash kalau biasa biar cepat
    const proKeywords = ['code', 'coding', 'roblox', 'lua', 'script', 'error', 'debug', 'bug', 'bikin', 'program', 'developer', 'json', 'html'];
    const isComplexTask = proKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    const isProMode = isComplexTask || activeTab === 'roblox' || activeTab === 'auditor';
    const selectedModel = isProMode ? 'gemini-1.5-pro' : 'gemini-1.5-flash';

    // Placeholder buat pesan AI (Streaming real-time)
    setMessages(prev => [...prev, { role: 'ai', text: '', model: selectedModel }]);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:streamGenerateContent?alt=sse&key=${apiKey}`;
      
      let context = `${getSystemPrompt()}\n\nUser: ${userMessage}`;
      if (activeTab === 'roblox') context = `[ROBLOX DEV AGENT] ${userMessage}`;
      if (activeTab === 'auditor') context = `[CODE AUDITOR] ${userMessage}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: context }] }] })
      });

      if (!response.ok) throw new Error('Gagal menghubungi Gemini API');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              const textPart = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textPart) {
                aiText += textPart;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = aiText;
                  return newMsgs;
                });
              }
            } catch (err) {}
          }
        }
      }
    } catch (error) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].text = "Waduh, koneksi error atau API key bermasalah nih!";
        return newMsgs;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = (e) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
    setTimeout(() => {
      setImageResult(url);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans">
      {/* Sidebar Original */}
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col">
        <h1 className="text-xl font-bold tracking-wider text-emerald-400 mb-8">KIRAXKLONING</h1>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('chat')} className={`p-3 rounded-xl text-left flex items-center gap-3 ${activeTab === 'chat' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-900'}`}>
            <Sparkles size={18} /> Chat AI
          </button>
          <button onClick={() => setActiveTab('roblox')} className={`p-3 rounded-xl text-left flex items-center gap-3 ${activeTab === 'roblox' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:bg-zinc-900'}`}>
            <Gamepad2 size={18} /> Roblox Dev Agent
          </button>
          <button onClick={() => setActiveTab('auditor')} className={`p-3 rounded-xl text-left flex items-center gap-3 ${activeTab === 'auditor' ? 'bg-zinc-800 text-orange-400' : 'text-zinc-400 hover:bg-zinc-900'}`}>
            <Code size={18} /> Code Auditor
          </button>
          <button onClick={() => setActiveTab('image')} className={`p-3 rounded-xl text-left flex items-center gap-3 ${activeTab === 'image' ? 'bg-zinc-800 text-purple-400' : 'text-zinc-400 hover:bg-zinc-900'}`}>
            <ImageIcon size={18} /> Veo/Image Generator
          </button>
        </div>
        <div className="mt-auto text-xs text-zinc-600">
          Created by Wira si dev gabut
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#050505]">
          <h2 className="font-semibold uppercase text-sm tracking-wider text-zinc-300">Mode: {activeTab}</h2>
          {activeTab !== 'image' && (
            <button onClick={() => setMessages([])} className="text-zinc-500 hover:text-red-400">
              <Trash2 size={18} />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-24">
          {activeTab !== 'image' ? (
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              {messages.length === 0 && (
                <div className="text-center text-zinc-600 mt-20">
                  <Activity size={40} className="mx-auto mb-2 opacity-30" />
                  <p>KIRAXKLONING aktif. Ketik pesan di bawah...</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-200'}`}>
                    {msg.role === 'ai' && msg.model && (
                      <span className="text-[10px] font-mono text-emerald-400 block mb-1">⚡ {msg.model}</span>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text || (isGenerating && idx === messages.length - 1 ? "Mengetik..." : "")}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="max-w-xl mx-auto flex flex-col items-center gap-6 mt-10">
              <form onSubmit={handleGenerateImage} className="w-full flex gap-2">
                <input 
                  type="text" 
                  value={imagePrompt} 
                  onChange={(e) => setImagePrompt(e.target.value)} 
                  placeholder="Deskripsikan gambar..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-xl outline-none focus:border-purple-500 text-white"
                />
                <button type="submit" disabled={isGenerating} className="bg-purple-600 hover:bg-purple-700 px-6 rounded-xl font-medium">
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : 'Generate'}
                </button>
              </form>
              {imageResult && (
                <div className="border border-zinc-800 rounded-2xl overflow-hidden">
                  <img src={imageResult} alt="Result" className="w-full max-w-md object-cover" />
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab !== 'image' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#050505] border-t border-zinc-800">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-2">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesan..."
                disabled={isGenerating}
                className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-xl outline-none focus:border-emerald-500 text-white"
              />
              <button type="submit" disabled={isGenerating || !input.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-black px-5 rounded-xl font-medium disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
