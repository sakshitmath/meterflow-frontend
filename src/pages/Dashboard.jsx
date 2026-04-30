import { useState, useEffect } from "react";
import { getApis, createApi, generateKey, getCurrentBill, calculateBill } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const weeklyData = [
  { day: "Mon", requests: 120, errors: 5 },
  { day: "Tue", requests: 340, errors: 12 },
  { day: "Wed", requests: 280, errors: 8 },
  { day: "Thu", requests: 590, errors: 20 },
  { day: "Fri", requests: 430, errors: 15 },
  { day: "Sat", requests: 750, errors: 25 },
  { day: "Sun", requests: 620, errors: 18 },
];

const pieData = [
  { name: "Success", value: 73 },
  { name: "Errors", value: 12 },
  { name: "Latency", value: 15 },
];

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b"];

export default function Dashboard() {
  const [apis, setApis] = useState([]);
  const [bill, setBill] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const apisRes = await getApis();
      setApis(apisRes.data);
      const billRes = await getCurrentBill();
      setBill(billRes.data);
    } catch (err) {
      navigate("/login");
    }
  };

  const handleCreateApi = async () => {
    try {
      await createApi({ name, description, baseUrl });
      setName(""); setDescription(""); setBaseUrl("");
      setShowCreateForm(false);
      loadData();
    } catch (err) { alert("Failed to create API"); }
  };

  const handleGenerateKey = async (id) => {
    try {
      const res = await generateKey(id);
      setGeneratedKey(res.data.keyValue);
    } catch (err) { alert("Failed to generate key"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "apis", icon: "🔌", label: "My APIs" },
    { id: "keys", icon: "🔑", label: "API Keys" },
    { id: "billing", icon: "💰", label: "Billing" },
    { id: "analytics", icon: "📈", label: "Analytics" },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-blue-400">⚡ MeterFlow</h1>
              <p className="text-slate-500 text-xs">API Billing Platform</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1 rounded">
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                activeTab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
              <span className="text-base">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          {sidebarOpen && (
            <p className="text-slate-500 text-xs mb-2 truncate">{email}</p>
          )}
          <button onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg text-xs font-medium transition-colors">
            {sidebarOpen ? "Logout" : "↩"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">

        {/* Topbar */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold capitalize">{activeTab}</h2>
            <p className="text-slate-500 text-xs">MeterFlow — API Billing Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-medium">PRO</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-6">

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total APIs", value: apis.length, icon: "🔌", change: "+1 this week", color: "blue" },
                  { label: "Total Requests", value: bill?.totalRequests || 0, icon: "📈", change: "All time", color: "green" },
                  { label: "Amount Due", value: `₹${bill?.amount || 0}`, icon: "💰", change: "Current cycle", color: "yellow" },
                  { label: "Active Keys", value: apis.length, icon: "🔑", change: "All active", color: "purple" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-3 gap-4">

                {/* Area Chart */}
                <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-sm">📊 Weekly API Traffic</h3>
                    <span className="text-xs text-slate-500">Last 7 days</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                      <XAxis dataKey="day" stroke="#475569" tick={{fontSize:11}}/>
                      <YAxis stroke="#475569" tick={{fontSize:11}}/>
                      <Tooltip contentStyle={{backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"8px"}}/>
                      <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#reqGrad)" strokeWidth={2} name="Requests"/>
                      <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="url(#errGrad)" strokeWidth={2} name="Errors"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold text-sm mb-4">📉 Request Summary</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]}/>
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"8px"}}/>
                      <Legend iconSize={8} wrapperStyle={{fontSize:"11px"}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-4">📊 Daily Request Volume</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="day" stroke="#475569" tick={{fontSize:11}}/>
                    <YAxis stroke="#475569" tick={{fontSize:11}}/>
                    <Tooltip contentStyle={{backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"8px"}}/>
                    <Bar dataKey="requests" fill="#3b82f6" radius={[4,4,0,0]} name="Requests"/>
                    <Bar dataKey="errors" fill="#ef4444" radius={[4,4,0,0]} name="Errors"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent APIs */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-4">🔌 Your APIs</h3>
                {apis.length === 0 ? (
                  <p className="text-slate-500 text-sm">No APIs yet. Go to My APIs to create one.</p>
                ) : (
                  apis.map((api) => (
                    <div key={api.id} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{api.name}</p>
                        <p className="text-slate-500 text-xs">{api.baseUrl}</p>
                      </div>
                      <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full">Active</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* APIS TAB */}
          {activeTab === "apis" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Your APIs ({apis.length})</h3>
                <button onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  + Create New API
                </button>
              </div>

              {showCreateForm && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h4 className="font-semibold mb-4 text-sm">Create New API</h4>
                  <input type="text" placeholder="API Name" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 mb-3 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-blue-500"/>
                  <input type="text" placeholder="Description" value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 mb-3 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-blue-500"/>
                  <input type="text" placeholder="Base URL (e.g. https://jsonplaceholder.typicode.com)" value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-blue-500"/>
                  <div className="flex gap-3">
                    <button onClick={handleCreateApi}
                      className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium">
                      Create API
                    </button>
                    <button onClick={() => setShowCreateForm(false)}
                      className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg text-sm font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {apis.map((api) => (
                <div key={api.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{api.name}</h4>
                      <p className="text-slate-400 text-sm mt-1">{api.description}</p>
                      <p className="text-blue-400 text-xs mt-2 font-mono">{api.baseUrl}</p>
                      <p className="text-slate-600 text-xs mt-1">ID: {api.id}</p>
                    </div>
                    <button onClick={() => handleGenerateKey(api.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      🔑 Generate Key
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* KEYS TAB */}
          {activeTab === "keys" && (
            <div className="space-y-4">
              <h3 className="font-semibold">API Key Management</h3>

              {generatedKey && (
                <div className="bg-green-900/30 border border-green-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-400 font-semibold text-sm">✅ New Key Generated</span>
                  </div>
                  <p className="font-mono text-green-300 text-sm break-all bg-slate-900 p-3 rounded-lg">{generatedKey}</p>
                  <p className="text-slate-500 text-xs mt-2">⚠️ Copy this key now. It won't be shown again.</p>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="font-semibold text-sm mb-4">How to use your API Key</h4>
                <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300">
                  <p className="text-slate-500 mb-1"># Add this header to your requests:</p>
                  <p>X-API-KEY: your_key_here</p>
                  <p className="text-slate-500 mt-2 mb-1"># Example gateway call:</p>
                  <p>GET http://localhost:8080/gateway/posts/1</p>
                </div>
              </div>

              {apis.map((api) => (
                <div key={api.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{api.name}</p>
                      <p className="text-slate-400 text-sm">{api.baseUrl}</p>
                    </div>
                    <button onClick={() => handleGenerateKey(api.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors">
                      Generate Key
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">💰 Current Bill</h3>
                    <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">FREE Plan</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-400 mb-3">
                    ₹{bill?.amount || 0}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Requests</span>
                      <span className="font-medium">{bill?.totalRequests || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Free Quota</span>
                      <span className="font-medium text-green-400">1,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Status</span>
                      <span className="font-medium text-yellow-400">{bill?.status || "PENDING"}</span>
                    </div>
                  </div>
                  <button onClick={async () => { await calculateBill(); loadData(); }}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-medium transition-colors">
                    Calculate Bill
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold text-sm mb-4">📋 Subscription Plans</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-blue-400">FREE</p>
                          <p className="text-slate-400 text-xs mt-1">1,000 requests/month</p>
                        </div>
                        <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">Current</span>
                      </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">PRO</p>
                          <p className="text-slate-400 text-xs mt-1">₹0.5 per 100 requests</p>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1 rounded-full transition-colors">
                          Upgrade
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Analytics Overview</h3>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Avg Latency", value: "142ms", icon: "⚡", color: "yellow" },
                  { label: "Success Rate", value: "97.3%", icon: "✅", color: "green" },
                  { label: "Error Rate", value: "2.7%", icon: "❌", color: "red" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-4">📊 Request vs Error Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="day" stroke="#475569" tick={{fontSize:11}}/>
                    <YAxis stroke="#475569" tick={{fontSize:11}}/>
                    <Tooltip contentStyle={{backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"8px"}}/>
                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#grad1)" strokeWidth={2} name="Requests"/>
                    <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Errors"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-4">🌐 Gateway Usage</h3>
                <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-2">
                  <p><span className="text-green-400">GET</span> /gateway/posts/1 <span className="text-slate-500">→ 200 OK • 142ms</span></p>
                  <p><span className="text-green-400">GET</span> /gateway/users/5 <span className="text-slate-500">→ 200 OK • 98ms</span></p>
                  <p><span className="text-yellow-400">GET</span> /gateway/todos/3 <span className="text-slate-500">→ 200 OK • 201ms</span></p>
                  <p><span className="text-red-400">GET</span> /gateway/invalid <span className="text-slate-500">→ 404 • 45ms</span></p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}