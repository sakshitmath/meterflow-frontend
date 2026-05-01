import { useState, useEffect } from "react";
import {
  getApis, createApi, generateKey,
  getCurrentBill, calculateBill
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, Legend
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

const billingHistory = [
  { date: "Apr 2026", requests: 1240, amount: "₹6.20", status: "Pending" },
  { date: "Mar 2026", requests: 3200, amount: "₹16.00", status: "Paid" },
  { date: "Feb 2026", requests: 980, amount: "₹0.00", status: "Paid" },
];

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
  const [loading, setLoading] = useState(false);
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
    if (!name || !baseUrl) {
      alert("Name and Base URL are required");
      return;
    }
    setLoading(true);
    try {
      await createApi({ name, description, baseUrl });
      setName(""); setDescription(""); setBaseUrl("");
      setShowCreateForm(false);
      loadData();
    } catch (err) {
      alert("Failed to create API");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async (id) => {
    try {
      const res = await generateKey(id);
      setGeneratedKey(res.data.keyValue);
      setActiveTab("keys");
    } catch (err) {
      alert("Failed to generate key");
    }
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
    { id: "gateway", icon: "🌐", label: "Gateway" },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">⚡</div>
                <h1 className="text-base font-bold text-white">MeterFlow</h1>
              </div>
              <p className="text-slate-500 text-xs mt-1 ml-10">API Billing Platform</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-slate-300 text-xs font-medium truncate">{email}</p>
                <p className="text-slate-500 text-xs">API Owner</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full bg-red-600/20 hover:bg-red-600 border border-red-600/30 hover:border-red-600 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-white transition-all">
            {sidebarOpen ? "Sign Out" : "↩"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-w-0">

        {/* Topbar */}
        <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-white capitalize">{activeTab}</h2>
            <p className="text-slate-500 text-xs">MeterFlow — API Billing Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">System Online</span>
            </div>
            <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-medium">PRO</span>
          </div>
        </div>

        <div className="p-6">

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total APIs", value: apis.length, icon: "🔌", sub: "Active endpoints", color: "blue" },
                  { label: "Total Requests", value: bill?.totalRequests || 0, icon: "📈", sub: "All time", color: "green" },
                  { label: "Amount Due", value: `₹${bill?.amount || 0}`, icon: "💰", sub: "Current cycle", color: "yellow" },
                  { label: "Active Keys", value: apis.length, icon: "🔑", sub: "All active", color: "purple" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all hover:shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Live</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                    <div className="text-slate-600 text-xs mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Area Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold text-sm text-white">API Traffic Overview</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Requests vs Errors this week</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Last 7 days</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                      <XAxis dataKey="day" stroke="#475569" tick={{fontSize:11}}/>
                      <YAxis stroke="#475569" tick={{fontSize:11}}/>
                      <Tooltip contentStyle={{backgroundColor:"#0f172a",border:"1px solid #1e293b",borderRadius:"8px",fontSize:"12px"}}/>
                      <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#reqGrad)" strokeWidth={2} name="Requests"/>
                      <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="url(#errGrad)" strokeWidth={2} name="Errors"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm text-white">Request Summary</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Success vs Error rate</p>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]}/>
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor:"#0f172a",border:"1px solid #1e293b",borderRadius:"8px",fontSize:"12px"}}/>
                      <Legend iconSize={8} wrapperStyle={{fontSize:"11px"}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-sm text-white">Daily Request Volume</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Requests and errors per day</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="day" stroke="#475569" tick={{fontSize:11}}/>
                    <YAxis stroke="#475569" tick={{fontSize:11}}/>
                    <Tooltip contentStyle={{backgroundColor:"#0f172a",border:"1px solid #1e293b",borderRadius:"8px",fontSize:"12px"}}/>
                    <Bar dataKey="requests" fill="#3b82f6" radius={[4,4,0,0]} name="Requests"/>
                    <Bar dataKey="errors" fill="#ef4444" radius={[4,4,0,0]} name="Errors"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* APIs Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm text-white">Your APIs</h3>
                  <button onClick={() => setActiveTab("apis")}
                    className="text-blue-400 text-xs hover:text-blue-300">
                    View all →
                  </button>
                </div>
                {apis.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No APIs yet.</p>
                    <button onClick={() => setActiveTab("apis")}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                      Create your first API
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {apis.map((api) => (
                      <div key={api.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-sm">🔌</div>
                          <div>
                            <p className="font-medium text-sm text-white">{api.name}</p>
                            <p className="text-slate-500 text-xs font-mono">{api.baseUrl}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/20">Active</span>
                          <button onClick={() => handleGenerateKey(api.id)}
                            className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg text-xs transition-colors">
                            Get Key
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* APIS TAB */}
          {activeTab === "apis" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white">My APIs</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{apis.length} APIs registered</p>
                </div>
                <button onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  + Create New API
                </button>
              </div>

              {showCreateForm && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h4 className="font-semibold mb-4 text-sm text-white">Create New API</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <input type="text" placeholder="API Name *" value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
                    <input type="text" placeholder="Description" value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
                    <input type="text" placeholder="Base URL * (e.g. https://jsonplaceholder.typicode.com)" value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleCreateApi} disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                      {loading ? "Creating..." : "Create API"}
                    </button>
                    <button onClick={() => setShowCreateForm(false)}
                      className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {apis.map((api) => (
                <div key={api.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-lg mt-0.5">🔌</div>
                      <div>
                        <h4 className="font-bold text-white">{api.name}</h4>
                        <p className="text-slate-400 text-sm mt-0.5">{api.description || "No description"}</p>
                        <p className="text-blue-400 text-xs mt-1.5 font-mono">{api.baseUrl}</p>
                        <p className="text-slate-600 text-xs mt-1">ID: {api.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20 text-center">Active</span>
                      <button onClick={() => handleGenerateKey(api.id)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                        🔑 Generate Key
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* KEYS TAB */}
          {activeTab === "keys" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white">API Key Management</h3>
                <p className="text-slate-500 text-xs mt-0.5">Generate and manage your API keys</p>
              </div>

              {generatedKey && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-400 text-lg">✅</span>
                    <span className="text-green-400 font-semibold text-sm">New API Key Generated!</span>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-green-300 break-all border border-slate-800">
                    {generatedKey}
                  </div>
                  <p className="text-slate-500 text-xs mt-2">⚠️ Copy this key now — it won't be shown again in full.</p>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="font-semibold text-sm text-white mb-3">How to use your API Key</h4>
                <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                  <p className="text-slate-500 text-xs font-mono"># Add this header to gateway requests:</p>
                  <p className="text-blue-300 text-xs font-mono">X-API-KEY: your_key_here</p>
                  <p className="text-slate-500 text-xs font-mono mt-2"># Example:</p>
                  <p className="text-green-300 text-xs font-mono">GET http://localhost:8080/gateway/posts/1</p>
                  <p className="text-green-300 text-xs font-mono">GET http://localhost:8080/gateway/users/1</p>
                </div>
              </div>

              <div className="space-y-3">
                {apis.map((api) => (
                  <div key={api.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{api.name}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{api.baseUrl}</p>
                      </div>
                      <button onClick={() => handleGenerateKey(api.id)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Generate New Key
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white">Billing & Payments</h3>
                <p className="text-slate-500 text-xs mt-0.5">Manage your subscription and payment history</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Current Bill */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-white">Current Bill</h3>
                    <span className="bg-blue-600 text-xs px-3 py-1 rounded-full font-medium">FREE Plan</span>
                  </div>
                  <div className="text-5xl font-bold text-blue-400 mb-4">
                    ₹{bill?.amount || 0}
                  </div>
                  <div className="space-y-2 mb-4">
                    {[
                      { label: "Total Requests", value: bill?.totalRequests || 0 },
                      { label: "Free Quota", value: "1,000" },
                      { label: "Rate", value: "₹0.5/100 requests" },
                      { label: "Status", value: bill?.status || "PENDING" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-sm py-1 border-b border-slate-800">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="font-medium text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={async () => { await calculateBill(); loadData(); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Calculate Current Bill
                  </button>
                </div>

                {/* Plans */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold text-sm text-white mb-4">Subscription Plans</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-600/10 border-2 border-blue-600 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-blue-400 text-lg">FREE</p>
                          <p className="text-slate-400 text-sm mt-1">1,000 requests/month</p>
                          <p className="text-slate-500 text-xs mt-1">Perfect for testing</p>
                        </div>
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">Current</span>
                      </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white text-lg">PRO</p>
                          <p className="text-slate-400 text-sm mt-1">₹0.5 per 100 requests</p>
                          <p className="text-slate-500 text-xs mt-1">For production apps</p>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full transition-colors">
                          Upgrade
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white text-lg">ENTERPRISE</p>
                          <p className="text-slate-400 text-sm mt-1">Custom pricing</p>
                          <p className="text-slate-500 text-xs mt-1">For large scale</p>
                        </div>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-full transition-colors">
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-sm text-white mb-4">Payment History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left text-slate-400 font-medium pb-3">Period</th>
                        <th className="text-left text-slate-400 font-medium pb-3">Requests</th>
                        <th className="text-left text-slate-400 font-medium pb-3">Amount</th>
                        <th className="text-left text-slate-400 font-medium pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((item, index) => (
                        <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 text-white">{item.date}</td>
                          <td className="py-3 text-slate-300">{item.requests.toLocaleString()}</td>
                          <td className="py-3 text-white font-medium">{item.amount}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              item.status === "Paid"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white">Analytics Overview</h3>
                <p className="text-slate-500 text-xs mt-0.5">Monitor your API performance</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Avg Latency", value: "142ms", icon: "⚡", color: "yellow", sub: "Last 24h" },
                  { label: "Success Rate", value: "97.3%", icon: "✅", color: "green", sub: "This week" },
                  { label: "Error Rate", value: "2.7%", icon: "❌", color: "red", sub: "This week" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="text-2xl mb-3">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                    <div className="text-slate-600 text-xs mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-sm text-white mb-4">Request vs Error Trend</h3>
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
                    <Tooltip contentStyle={{backgroundColor:"#0f172a",border:"1px solid #1e293b",borderRadius:"8px",fontSize:"12px"}}/>
                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#grad1)" strokeWidth={2} name="Requests"/>
                    <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Errors"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* GATEWAY TAB */}
          {activeTab === "gateway" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white">API Gateway</h3>
                <p className="text-slate-500 text-xs mt-0.5">All requests are validated, logged and forwarded</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Gateway Status", value: "Online", icon: "🟢" },
                  { label: "Requests Today", value: "1,240", icon: "📡" },
                  { label: "Avg Response", value: "142ms", icon: "⚡" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xl mb-2">{item.icon}</div>
                    <div className="text-xl font-bold text-white">{item.value}</div>
                    <div className="text-slate-400 text-xs mt-1">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="font-semibold text-sm text-white mb-3">How Gateway Works</h4>
                <div className="space-y-3">
                  {[
                    { step: "1", title: "Send Request", desc: "Client sends request with X-API-KEY header to /gateway/**" },
                    { step: "2", title: "Validate Key", desc: "Gateway validates API key against database" },
                    { step: "3", title: "Log Request", desc: "Request is logged with endpoint, method, timestamp" },
                    { step: "4", title: "Forward", desc: "Request forwarded to actual API base URL" },
                    { step: "5", title: "Return Response", desc: "Real API response returned to client" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="font-semibold text-sm text-white mb-3">Recent Gateway Logs</h4>
                <div className="space-y-2 font-mono text-xs">
                  {[
                    { method: "GET", path: "/gateway/posts/1", status: "200", time: "142ms", color: "green" },
                    { method: "GET", path: "/gateway/users/5", status: "200", time: "98ms", color: "green" },
                    { method: "GET", path: "/gateway/todos/3", status: "200", time: "201ms", color: "yellow" },
                    { method: "GET", path: "/gateway/invalid", status: "404", time: "45ms", color: "red" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-800 rounded-lg">
                      <span className="text-blue-400 w-10">{log.method}</span>
                      <span className="text-slate-300 flex-1">{log.path}</span>
                      <span className={`${
                        log.color === "green" ? "text-green-400" :
                        log.color === "yellow" ? "text-yellow-400" : "text-red-400"
                      }`}>{log.status}</span>
                      <span className="text-slate-500">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
s
        </div>
      </div>
    </div>
  );
}