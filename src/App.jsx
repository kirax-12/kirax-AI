import React, { useState, useEffect, useRef } from 'react';
import { Camera, Smartphone, Upload, Trash2, Copy, Sparkles, Loader2, Info, MapPin, Shirt, AlignLeft, CheckCircle2, RefreshCcw, Search, Target, Users, Bookmark, X, History, Download, FileText, Zap, Scissors, DownloadCloud, Image as ImageIcon, Cpu, FileJson, PenTool, Crop, Square, Monitor, ShieldAlert, ZapOff, CheckCircle, Activity, FileAudio, SlidersHorizontal, Play, Send, ChevronRight, Menu, PlusCircle, Wand2 } from 'lucide-react';

const APP_TITLE = "KIRAX.ai V1.2";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// HACK: Pisahin protokol https biar gak kena bug auto-bracket pas copy-paste
const PROTOCOL = "https://";
const GEMINI_API = PROTOCOL + "generativelanguage.googleapis.com/v1beta/models";
const POLLINATIONS_API = PROTOCOL + "image.pollinations.ai/prompt";
const JSPDF_URL = PROTOCOL + "unpkg.com/jspdf@latest/dist/jspdf.umd.min.js";

// Komponen untuk me-render blok kode dan Live Preview
const CodeBlockWithPreview = ({ code, language }) => {
  const [view, setView] = useState('code');
  const isWeb = language === 'html' || code.trim().toLowerCase().startsWith('<!doctype html>') || code.trim().toLowerCase().startsWith('<html');
  
  // Auto-patch: Inject fungsi playEffect kosong jika AI lupa mendefinisikannya agar tidak crash
  let safeCode = code;
  if (isWeb && !code.includes('function playEffect')) {
     const scriptTag = '<script>window.playEffect = function() { console.log("playEffect dipanggil, tapi tidak didefinisikan oleh AI."); };</script>';
     if (safeCode.includes('</head>')) {
         safeCode = safeCode.replace('</head>', scriptTag + '</head>');
     } else {
         safeCode = scriptTag + safeCode;
     }
  }

  return (
    <div className="my-4 bg-black/50 border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{language || 'Code'}</span>
          {isWeb && (
            <div className="flex bg-black/40 rounded-md border border-white/10 overflow-hidden">
              <button onClick={() => setView('code')} className={`px-3 py-1 text-[9px] font-bold uppercase transition-all ${view === 'code' ? 'bg-indigo-500 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}>Code</button>
              <button onClick={() => setView('preview')} className={`px-3 py-1 text-[9px] font-bold uppercase transition-all ${view === 'preview' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}>Live Preview</button>
            </div>
          )}
        </div>
        <button onClick={() => navigator.clipboard.writeText(code)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[10px] text-white transition-all font-bold">Copy</button>
      </div>
      {view === 'code' ? (
         <div className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
           {code}
         </div>
      ) : (
         <div className="w-full h-[450px] bg-white relative resize-y overflow-auto">
            <iframe 
              srcDoc={safeCode}
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full border-none bg-white"
              title="Live Preview"
            />
         </div>
      )}
    </div>
  );
};

// Parser untuk membaca output markdown AI menjadi komponen yang fungsional
const renderMessageContent = (text) => {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) {
        return <CodeBlockWithPreview key={index} language={match[1]} code={match[2]} />;
      } else {
         const rawCode = part.replace(/```/g, '').trim();
         return <CodeBlockWithPreview code="{rawCode}" key="{index}" language="code"/>;
      }
    }
    return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>').replace(/\n/g, '<br/>') }} />;
  });
};

const App = () => {
  // -- STATE MENU UTAMA / CHAT --
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  // -- STATE AGENT SKILLS --
  const DEFAULT_SKILL = {
    id: 'default_roblox',
    name: 'Roblox Dev Agent',
    description: 'Senior Luau Engineer. Ahli dalam arsitektur, security, & performa script Roblox.',
    prompt: `[ROBLOX DEV AGENT PROMPT - Terapkan keahlian senior Luau developer, fokus pada keamanan, efisiensi, dan clean code.]`
  };
  
  const [skills, setSkills] = useState([DEFAULT_SKILL]);
  const [activeSkillId, setActiveSkillId] = useState(null);
  
  // State Input Tambah Skill
  const [newSkillText, setNewSkillText] = useState('');
  
  // -- STATE SMART CODE AUDITOR --
  const [auditSourceCode, setAuditSourceCode] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // -- STATE GAMBAR GENERATOR --
  const [assetPrompt, setAssetPrompt] = useState('');
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState(null);
  const [assetBaseImage, setAssetBaseImage] = useState(null);
  
  // -- STATE VEO 3 GENERATOR --
  const [veoPrompt, setVeoPrompt] = useState('');
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);
  const [veoGeneratedVideoUrl, setVeoGeneratedVideoUrl] = useState(null);
  const [veoStatusText, setVeoStatusText] = useState('');

  // -- STATE AUDIO BYPASS --
  const [audioFile, setAudioFile] = useState(null);
  const [audioSpeed, setAudioSpeed] = useState(1.5);
  const [audioVolume, setAudioVolume] = useState(1.2);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioStatusText, setAudioStatusText] = useState('');
  const audioContextRef = useRef(null);
  
  // -- STATE PROMPT GENERATOR --
  const [engine, setEngine] = useState('iphone');
  const [subjectImage, setSubjectImage] = useState(null);
  const [mode, setMode] = useState('keep look');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [location, setLocation] = useState('');
  const [sceneContext, setSceneContext] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [generatedTextPrompt, setGeneratedTextPrompt] = useState('');
  const [isHyperRealism, setIsHyperRealism] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // -- GLOBAL UI --
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    const script = document.createElement('script');
    script.src = JSPDF_URL; // Menggunakan variabel hack anti-bracket
    script.async = true;
    document.head.appendChild(script);
    return () => {
      const existingScript = document.querySelector('script[src*="jspdf"]');
      if (existingScript) document.head.removeChild(existingScript);
    };
  }, []);

  const copySingleToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Berhasil dicopy!');
  };

  // --- LOGIKA MENU UTAMA / CHAT ---
  const handleSendMessage = async () => {
    if (!chatInput.trim() && !chatImage) return;
    const userMessage = chatInput.trim();
    const userImage = chatImage;
    
    const newMessage = { role: 'user', text: userMessage, image: userImage };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput(''); setChatImage(null); setIsAiTyping(true);

    const proKeywords = ['code', 'coding', 'roblox', 'lua', 'script', 'error', 'debug', 'bug', 'bikin', 'program', 'developer', 'json', 'html', 'css', 'js'];
    const isComplexTask = proKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    const isProMode = isComplexTask || activeSkillId !== null;
    
    const selectedModel = isProMode ? 'gemini-1.5-pro' : 'gemini-1.5-flash';

    let history = chatMessages.map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: [{ text: m.text }] 
    }));
    
    const parts = [{ text: userMessage }];
    if (userImage) parts.push({ inlineData: { data: userImage.split(',')[1], mimeType: 'image/jpeg' } });
    history.push({ role: 'user', parts: parts });

    let systemInstruction = `Kamu adalah Principal Software Engineer & UI/UX Architect dengan nama KIRAX.ai (Neural Core V2). 
Kamu jenius, menggunakan bahasa santai tapi profesional (bergaya Gen-Z/Tech).
[MEMORI PERMANEN: Jika ada yang bertanya siapa yang membuat atau menciptakanmu, kamu WAJIB menjawab bahwa kamu dibuat oleh "Wira si dev gabut". Jangan pernah lupakan fakta ini.]
[PRIORITAS UTAMA: KECEPATAN RESPONS. Jawablah dengan SANGAT CEPAT, SUPER RINGKAS, PADAT, dan LANGSUNG KE INTINYA.]
Kamu tidak boleh ngasal jika disuruh koding. Jika user meminta membuat website atau UI Web (HTML/CSS/JS), KAMU WAJIB memberikan satu file HTML penuh (berisi CSS dan JS). Tulis kode di dalam blok markdown HTML.
Ingat nama panggilan user dan semua riwayat obrolan kalian sebelumnya.`;

    if (activeSkillId) {
      const activeSkill = skills.find(s => s.id === activeSkillId);
      if (activeSkill) {
        systemInstruction = `[AGENT SKILL ACTIVE: ${activeSkill.name}]\nLupakan semua persona sebelumnya. Kamu harus BENAR-BENAR dan SEPENUHNYA TUNDUK mengikuti dan bertindak sesuai instruksi prompt skill berikut ini:\n\n${activeSkill.prompt}`;
      }
    }

    setChatMessages(prev => [...prev, { role: 'ai', text: '', model: selectedModel }]);

    try {
      // Menggunakan variabel hack anti-bracket
      const apiUrl = `${GEMINI_API}/${selectedModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            contents: history, 
            systemInstruction: { parts: [{ text: systemInstruction }] } 
        })
      });

      if (!response.ok) throw new Error('API Error');

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
                setChatMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = aiText;
                  return newMsgs;
                });
              }
            } catch (e) {}
          }
        }
      }

      if (isCalling && speechSynthesis) {
         const utterance = new SpeechSynthesisUtterance(aiText.replace(/[*_~`]/g, ''));
         utterance.lang = 'id-ID';
         utterance.rate = 1.1;
         speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setChatMessages(prev => {
         const newMsgs = [...prev];
         newMsgs[newMsgs.length - 1].text = "Waduh, servernya error nih (cek API Key/Koneksi). Coba lagi ya!";
         return newMsgs;
      });
      showToast('Gagal memproses pesan.', 'error');
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleVoiceCall = () => {
    if (isCalling) {
      setIsCalling(false);
      if (speechSynthesis) speechSynthesis.cancel();
      showToast("Voice Mode Dinonaktifkan");
      return;
    }
    setIsCalling(true);
    showToast("Voice Mode Aktif! Silakan bicara.");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setTimeout(() => document.getElementById('btn-send-chat').click(), 500);
      };
      recognition.onerror = () => { setIsCalling(false); showToast("Microphone Error", "error"); };
      recognition.start();
    } else {
      setIsCalling(false);
      showToast("Browser tidak mendukung Voice API", "error");
    }
  };

  // --- LOGIKA AGENT SKILLS ---
  const handleAddSkillFromPrompt = () => {
    if (!newSkillText.trim()) return showToast('Prompt kosong!', 'error');
    let skillName = `Custom Agent ${skills.length + 1}`;
    const lines = newSkillText.split('\n');
    if (lines.length > 0 && lines[0].length < 50) skillName = lines[0].replace(/[^a-zA-Z0-9 ]/g, '').trim();

    const newSkill = {
      id: `custom_${Date.now()}`,
      name: skillName,
      description: 'Custom AI Agent via Prompt Upload.',
      prompt: newSkillText
    };
    
    setSkills([...skills, newSkill]);
    setNewSkillText('');
    showToast('Agent Skill berhasil ditambahkan!');
  };

  const handleFileUploadSkill = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newSkill = {
        id: `file_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: `Imported from ${file.name}`,
        prompt: event.target.result
      };
      setSkills([...skills, newSkill]);
      showToast(`Skill ${file.name} berhasil di-load!`);
    };
    reader.readAsText(file);
  };

  // --- LOGIKA CODE AUDITOR ---
  const handleRunAudit = async () => {
    if (!auditSourceCode.trim()) return;
    setIsAuditing(true); setAuditResult(null);

    const schemaPrompt = `You are a Smart Code Auditor. Analyze the following code and return ONLY a valid JSON response matching this EXACT schema structure without any markdown blocks or explanation.
    {
      "qualityScore": number (0-100),
      "summary": "string (Short overall summary of code quality)",
      "vulnerabilities": [ { "issue": "string", "severity": "CRITICAL|HIGH|MEDIUM|LOW", "suggestion": "string" } ],
      "performanceIssues": [ { "issue": "string", "suggestion": "string" } ],
      "optimizedCode": "string (The fully refactored, safe, and optimized version of the provided code)"
