import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllBusinessUsers, createUser, updateUserStatus, deleteUserById, type StoredUser } from '../../lib/userStore';

const AdminPanel: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { lang, setLang } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users, setUsers] = useState<StoredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', username: '', password: 'welcome123', company: '', plan: 'starter' });
  const [searchUsers, setSearchUsers] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const businessUsers = getAllBusinessUsers();
    setUsers(businessUsers);
    setLoadingUsers(false);
  };

  const toggleUserStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateUserStatus(id, newStatus as any);
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus as any } : u));
  };

  const handleDeleteUser = (id: string) => {
    deleteUserById(id);
    setUsers(users.filter(u => u.id !== id));
  };

  const addUser = () => {
    setSaving(true);
    setFormError('');
    try {
      createUser({
        username: userForm.username,
        password: userForm.password,
        fullName: userForm.name,
        companyName: userForm.company,
        plan: userForm.plan,
      });
      setShowUserForm(false);
      setUserForm({ name: '', username: '', password: 'welcome123', company: '', plan: 'starter' });
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user');
    }
    setSaving(false);
  };

  const filteredUsers = users.filter(u =>
    (u.fullName || '').toLowerCase().includes(searchUsers.toLowerCase()) ||
    (u.companyName || '').toLowerCase().includes(searchUsers.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchUsers.toLowerCase())
  );

  const activeUsers = users.filter(u => u.status === 'active').length;

  const navItems = [
    { id: 'dashboard', label: lang === 'en' ? 'Dashboard' : 'Paneli', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'users', label: lang === 'en' ? 'Business Users' : 'Përdoruesit', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { id: 'plans', label: lang === 'en' ? 'Plans' : 'Planet', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-700"><div className="flex items-center gap-2"><div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div><div><span className="text-lg font-bold text-white">Doorly Admin</span><p className="text-xs text-gray-400">Super Administrator</p></div></div></div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (<button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>{item.icon}{item.label}</button>))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-700"><div className="flex gap-2"><button onClick={() => setLang(lang === 'en' ? 'al' : 'en')} className="flex-1 py-2 text-xs font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">{lang === 'en' ? 'Shqip' : 'English'}</button><button onClick={onLogout} className="flex-1 py-2 text-xs font-medium text-red-400 bg-gray-700 rounded-lg hover:bg-gray-600">{lang === 'en' ? 'Logout' : 'Dilni'}</button></div></div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <h1 className="text-xl font-bold text-white">{navItems.find(n => n.id === activeTab)?.label}</h1>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: lang === 'en' ? 'Total Users' : 'Gjithsej Përdorues', value: users.length.toString(), sub: `${activeUsers} active`, color: 'from-blue-500 to-blue-600' },
                  { label: lang === 'en' ? 'Active Users' : 'Përdorues Aktivë', value: activeUsers.toString(), sub: 'Currently active', color: 'from-green-500 to-green-600' },
                  { label: lang === 'en' ? 'Suspended' : 'Pezulluar', value: (users.length - activeUsers).toString(), sub: 'Inactive', color: 'from-purple-500 to-purple-600' },
                  { label: lang === 'en' ? 'Plans Used' : 'Planet', value: [...new Set(users.map(u => u.plan))].length.toString(), sub: 'Different plans', color: 'from-orange-500 to-red-500' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white`}>
                    <p className="text-sm text-white/80">{stat.label}</p>
                    {loadingUsers ? <div className="h-9 w-16 bg-white/20 rounded animate-pulse mt-2" /> : <p className="text-3xl font-extrabold mt-2">{stat.value}</p>}
                    <p className="text-xs text-white/60 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">{lang === 'en' ? 'Recent Users' : 'Përdoruesit e Fundit'}</h3>
                {users.length === 0 ? <p className="text-gray-500 text-sm">{lang === 'en' ? 'No users yet' : 'Ende pa përdorues'}</p> : (
                  <div className="space-y-3">
                    {[...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((u, i) => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><span className="w-6 text-center text-sm font-bold text-gray-500">#{i + 1}</span><div><p className="text-sm font-medium text-white">{u.companyName || u.fullName}</p><p className="text-xs text-gray-400">@{u.username}</p></div></div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{u.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} placeholder={lang === 'en' ? 'Search users...' : 'Kërko...'} className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500" />
                </div>
                <button onClick={() => { setShowUserForm(true); setFormError(''); }} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {lang === 'en' ? 'Add User' : 'Shto Përdorues'}
                </button>
              </div>
              {showUserForm && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="font-bold text-white mb-4">{lang === 'en' ? 'New Business User' : 'Përdorues i Ri'}</h3>
                  {formError && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">{formError}</div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder={lang === 'en' ? 'Full Name' : 'Emri'} className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500" />
                    <input type="text" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} placeholder={lang === 'en' ? 'Username' : 'Emri i Përdoruesit'} className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500" />
                    <input type="text" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder={lang === 'en' ? 'Password' : 'Fjalëkalimi'} className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500" />
                    <input type="text" value={userForm.company} onChange={(e) => setUserForm({ ...userForm, company: e.target.value })} placeholder={lang === 'en' ? 'Company' : 'Kompania'} className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500" />
                    <select value={userForm.plan} onChange={(e) => setUserForm({ ...userForm, plan: e.target.value })} className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setShowUserForm(false)} className="px-5 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700">{lang === 'en' ? 'Cancel' : 'Anulo'}</button>
                    <button onClick={addUser} disabled={saving || !userForm.username || !userForm.name} className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">{saving ? '...' : (lang === 'en' ? 'Create' : 'Krijo')}</button>
                  </div>
                </div>
              )}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="bg-gray-700/50"><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{lang === 'en' ? 'User' : 'Përdoruesi'}</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{lang === 'en' ? 'Username' : 'Emri'}</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{lang === 'en' ? 'Company' : 'Kompania'}</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{lang === 'en' ? 'Plan' : 'Plani'}</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{lang === 'en' ? 'Created' : 'Krijuar'}</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">{lang === 'en' ? 'Actions' : 'Veprime'}</th></tr></thead>
                    <tbody className="divide-y divide-gray-700">
                      {loadingUsers ? (
                        <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">{lang === 'en' ? 'Loading...' : 'Duke ngarkuar...'}</td></tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">{lang === 'en' ? 'No users found' : 'Asnjë përdorues'}</td></tr>
                      ) : filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4"><p className="text-sm font-medium text-white">{u.fullName}</p></td>
                          <td className="px-6 py-4 text-sm text-gray-300">@{u.username}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{u.companyName || '-'}</td>
                          <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${u.plan === 'enterprise' ? 'bg-purple-900/50 text-purple-300' : u.plan === 'professional' ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'}`}>{u.plan}</span></td>
                          <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{u.status}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-400">{timeAgo(u.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => toggleUserStatus(u.id, u.status)} className={`p-2 transition-colors ${u.status === 'active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={u.status === 'active' ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
                              </button>
                              <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 hover:text-red-300"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white">{lang === 'en' ? 'Subscription Plans' : 'Planet e Abonimit'}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: 'Starter', price: 29, count: users.filter(u => u.plan === 'starter').length, features: ['50 quotes/month', '1 user', 'Basic calculator', 'PDF export'] },
                  { name: 'Professional', price: 79, count: users.filter(u => u.plan === 'professional').length, features: ['Unlimited quotes', '5 users', 'Custom branding', 'Invoice management'] },
                  { name: 'Enterprise', price: 199, count: users.filter(u => u.plan === 'enterprise').length, features: ['Everything in Pro', 'Unlimited users', 'API access', 'White-label'] },
                ].map((plan, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-3xl font-extrabold text-white mt-2">${plan.price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
                    <p className="text-sm text-gray-400 mt-1">{plan.count} {lang === 'en' ? 'subscribers' : 'abonentë'}</p>
                    <ul className="mt-4 space-y-2">{plan.features.map((f, fi) => (<li key={fi} className="flex items-center gap-2 text-sm text-gray-300"><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{f}</li>))}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
