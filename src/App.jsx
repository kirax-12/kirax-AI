import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Image as ImageIcon, Gamepad2, 
  Terminal, Activity, Download, Trash2, Code, Zap
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageResult, setImageResult] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Logika Sistem AI & Identitas
  const getSystemPrompt = () => {
    return `Lu adalah KIRAXKLONING, asisten AI canggih, asik, dan responsif (berjiwa Gen Z) yang diciptakan oleh "Wira si dev gabut". Jawab dengan bahasa Indonesia yang santai tapi tetap akurat. Kalau ditanya soal identitas, selalu banggakan penciptamu, Wira.`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsGenerating(true);

    // DYNAMIC MODEL ROUTING: Pilih 'otak' AI berdasarkan konteks tugas
    const proKeywords = ['code', 'coding', 'roblox', 'lua', 'script', 'error', 'debug', 'bug', 'bikin', 'program', 'developer', 'json', 'html'];
    const isComplexTask = proKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    const isProMode = isComplexTask || activeTab === 'roblox' || activeTab === 'auditor';
    
    const selectedModel = isProMode ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    
    // Tambahkan pesan kosong untuk tempat ngetik AI (Streaming)
    setMessages(prev => [...prev, { role: 'ai', text: '', model: selectedModel }]);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:streamGenerateContent?alt=sse&key=${API_KEY}`;
      
      let promptContext = userMessage;
      if (activeTab === 'roblox') {
        promptContext = `[MODE ROBLOX DEV AGENT] ${userMessage}\nBantu buatkan script Lua atau solusi untuk game Roblox.`;
      } else if (activeTab === 'auditor') {
        promptContext = `[MODE SMART CODE AUDITOR] Tolong audit kode ini, cari bug, dan perbaiki sesuai JSON schema validation: ${userMessage}`;
      } else {
        promptContext = `[SYSTEM: ${getSystemPrompt()}]\n\nUser: ${userMessage}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptContext }] }]
        })
      });

      if (!response.ok) throw new Error('API Error');

      // Membaca Streaming Data per Kata
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
            } catch (e) {
              // Abaikan error parse patahan chunk
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].text = "Wah, servernya lagi ngambek nih. Coba lagi ya!";
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
    
    // Pakai Pollinations AI untuk Image/Veo Generate
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
    
    setTimeout(() => {
      setImageResult(url);
      setIsGenerating(false);
    }, 1500); // Simulasi loading singkat
  };

  const downloadImage = async () => {
    if (!imageResult) return;
    try {
      const res = await fetch(imageResult);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `KIRAXKLONING_${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error("Gagal download gambar", err);
    }
  };

  // Navigasi UI Gen Z
  const navItems = [
    { id: 'chat', icon: <Sparkles size={20} />, label: 'Neural Chat' },
    { id: 'roblox', icon: <Gamepad2 size={20} />, label: 'Rbx Agent' },
    { id: 'auditor', icon: <Code size={20} />, label: 'Code Audit' },
    { id: 'image', icon: <ImageIcon size={20} />, label: 'Veo/Image' }
  ];

  return (
    <div className="flex h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-emerald-500/30">
      
      {/* Sidebar - Sleek & Modern */}
      <aside className="w-20 md:w-64 border-r border-zinc-800 bg-[#0c0c0e] flex flex-col items-center md:items-start py-6">
        <div className="flex items-center gap-3 px-4 md:px-6 mb-10 w-full justify-center md:justify-start">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
            <Activity size={28} />
          </div>
          <h1 className="text-xl font-bold tracking-wider hidden md:block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            KIRAXKLONING
          </h1>
        </div>

        <nav className="flex flex-col gap-3 w-full px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-center md:justify-start gap-3 p-3 md:px-4 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-zinc-800/80 text-emerald-400 shadow-md border border-zinc-700/50' 
                : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              {item.icon}
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto px-4 w-full text-center md:text-left hidden md:block">
          <p className="text-xs text-zinc-600 font-mono">Build by Wira si dev gabut</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header Mode Indicator */}
        <header className="h-16 border-b border-zinc-800/50 bg-[#09090B]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-semibold flex items-center gap-2 capitalize">
            {activeTab === 'chat' && <span className="text-zinc-100">Neural Chat</span>}
            {activeTab === 'roblox' && <span className="text-blue-400">Roblox Dev Agent</span>}
            {activeTab === 'auditor' && <span className="text-orange-400">Smart Code Auditor</span>}
            {activeTab === 'image' && <span className="text-purple-400">Veo & Image Engine</span>}
          </h2>
          {activeTab !== 'image' && (
            <button 
              onClick={() => setMessages([])}
              className="text-zinc-500 hover:text-red-400 transition-colors p-2"
              title="Clear Chat"
            >
              <Trash2 size={18} />
            </button>
          )}
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          
          {/* Mode Text / Chat */}
          {activeTab !== 'image' ? (
            <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
              {messages.length === 0 && (
                <div className="text-center mt-20 text-zinc-600">
                  <Activity size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg">KIRAXKLONING siap bantu lu.</p>
                  <p className="text-sm opacity-60">Pilih mode di kiri dan ketik sesuatu di bawah.</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-zinc-800 text-zinc-100 rounded-br-sm' 
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm'
                  }`}>
                    {msg.role === 'ai' && msg.model && (
                      <div className="text-[10px] uppercase font-mono text-emerald-500/60 mb-2 flex items-center gap-1">
                        <Zap size={10} /> {msg.model}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                      {msg.text || (isGenerating && idx === messages.length - 1 ? "Mengetik..." : "")}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            
            /* Mode Image / Veo */
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 pt-10">
              <div className="w-full relative">
                <form onSubmit={handleGenerateImage} className="relative flex items-center">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Deskripsikan gambar yang pengen lu buat..."
                    className="w-full bg-zinc-900 border border-zinc-800 p-4 pr-16 rounded-2xl outline-none focus:border-purple-500/50 transition-colors text-zinc-200"
                  />
                  <button 
                    type="submit" 
                    disabled={isGenerating || !imagePrompt}
                    className="absolute right-2 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? <Activity size={20} className="animate-pulse" /> : <Sparkles size={20} />}
                  </button>
                </form>
              </div>

              {imageResult && !isGenerating && (
                <div className="relative group rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                  <img src={imageResult} alt="Generated" className="w-full max-w-lg object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={downloadImage}
                      className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors"
                    >
                      <Download size={18} /> Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        {activeTab !== 'image' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#09090B] via-[#09090B] to-transparent">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTab === 'roblox' ? "Ketik prompt Lua atau Roblox lu di sini..." : "Tanya KIRAXKLONING..."}
                disabled={isGenerating}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 pr-14 rounded-2xl outline-none focus:border-emerald-500/50 transition-colors text-zinc-200 placeholder-zinc-600"
              />
              <button 
                type="submit"
                disabled={isGenerating || !input.trim()}
                className="absolute right-2 p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl disabled:opacity-50 transition-colors"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
