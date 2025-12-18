'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Document {
  id: string;
  filename: string;
  extractedText: string;
  createdAt: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface User {
  id: string;
  name: string;
  token: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  // --- ESTADOS DE LOGIN/CADASTRO ---
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- ESTADOS DO DASHBOARD ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- EFEITOS ---
  useEffect(() => {
    // Tenta recuperar sessão salva
    const savedUser = localStorage.getItem('paggo_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchDocuments(parsedUser.token);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- FUNÇÕES DE AUTH ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_URL}${endpoint}`, { email, password });

      if (isLoginMode) {
        // LOGIN: Salva o usuário e token
        const userData = {
          id: res.data.userId,
          name: res.data.name,
          token: res.data.access_token
        };
        setUser(userData);
        localStorage.setItem('paggo_user', JSON.stringify(userData));
        fetchDocuments(userData.token); // Já carrega os docs
      } else {
        // REGISTER: Avisa e troca para login
        alert('Conta criada! Faça login agora.');
        setIsLoginMode(true);
      }
    } catch (error) {
      alert('Erro na autenticação. Verifique os dados.');
      console.error(error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('paggo_user');
    setDocuments([]);
    setSelectedDoc(null);
  };

  // --- FUNÇÕES DO DASHBOARD ---
  const fetchDocuments = async (token: string) => {
    try {
      // Nota: Em uma app real, enviaríamos o header Authorization: Bearer token
      // Mas para o MVP funcionar com o backend atual, vamos listar tudo
      const res = await axios.get(`${API_URL}/documents`);
      setDocuments(res.data);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('userId', user.id); // Usa o ID do usuário logado!

    try {
      await axios.post(`${API_URL}/documents/upload`, formData);
      alert('Documento processado com sucesso!');
      fetchDocuments(user.token);
    } catch (error) {
      alert('Erro no upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedDoc) return;
    const userMsg = input;
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/documents/${selectedDoc.id}/chat`, {
        question: userMsg
      });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Erro na IA.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedDoc) return;
    const header = `DOCUMENTO: ${selectedDoc.filename}\nDATA: ${new Date(selectedDoc.createdAt).toLocaleString()}\n\n`;
    const originalText = `--- TEXTO EXTRAÍDO ---\n${selectedDoc.extractedText}\n\n`;
    const chatContent = chatHistory.map(msg => `[${msg.role === 'user' ? 'VOCÊ' : 'IA'}]: ${msg.content}`).join('\n\n');
    const fullContent = header + originalText + "--- HISTÓRICO DO CHAT ---\n" + chatContent;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paggo-case-${selectedDoc.filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSelectDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setChatHistory([]);
  };

  // --- RENDERIZAÇÃO: TELA DE LOGIN ---
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Case Paggo</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                required 
                className="w-full p-2 border rounded mt-1 text-gray-900 placeholder-gray-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input 
                type="password" 
                required 
                className="w-full p-2 border rounded mt-1 text-gray-900 placeholder-gray-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              {isLoginMode ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-600 cursor-pointer hover:underline"
             onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
          </p>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: DASHBOARD (Se estiver logado) ---
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* SIDEBAR */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-blue-600">Olá, {user.name}</h1>
            <button onClick={logout} className="text-xs text-red-500 hover:underline">Sair</button>
          </div>
          <label className={`flex items-center justify-center w-full p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${uploading ? 'bg-gray-100' : 'border-blue-300 hover:bg-blue-50'}`}>
            <span className="text-sm font-semibold text-blue-600">{uploading ? 'Processando...' : '+ Upload Documento'}</span>
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {documents.map(doc => (
            <div key={doc.id} onClick={() => handleSelectDocument(doc)} className={`p-4 rounded-lg cursor-pointer border ${selectedDoc?.id === doc.id ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
              <p className="font-bold text-sm truncate">{doc.filename}</p>
              <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            <div className="p-4 bg-white border-b shadow-sm flex justify-between items-center">
              <h2 className="font-bold text-lg truncate max-w-md">{selectedDoc.filename}</h2>
              <button onClick={handleDownload} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border"> Download</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              <div className="bg-yellow-50 p-4 rounded text-xs text-gray-600 mb-6"><strong>Texto:</strong> {selectedDoc.extractedText.substring(0, 150)}...</div>
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{msg.content}</div>
                </div>
              ))}
              {loading && <div className="text-xs text-gray-400 animate-pulse">Digitando...</div>}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Pergunte algo..." className="flex-1 p-3 border rounded-lg" />
              <button onClick={handleSendMessage} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">Enviar</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">Selecione um documento</div>
        )}
      </div>
    </div>
  );
}