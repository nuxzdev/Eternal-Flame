// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    update,
    onValue,
    query,
    orderByChild,
    limitToLast
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBPuhy-xfMyDKdRIxJn8MkR3J6FLJ3OuCE",
    authDomain: "eternal-flame-c74e4.firebaseapp.com",
    databaseURL: "https://eternal-flame-c74e4-default-rtdb.firebaseio.com",
    projectId: "eternal-flame-c74e4",
    storageBucket: "eternal-flame-c74e4.firebasestorage.app",
    messagingSenderId: "883441410566",
    appId: "1:883441410566:web:51f384d088658a91b2d987"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Global State
let currentUser = null;
let userData = null;
let isAdmin = false;

// Skin Definitions
const SKINS = {
    basic: {
        name: "Classic Candle",
        tier: "basic",
        class: "basic-candle",
        requirement: "Default",
        unlocked: true
    },
    blue: {
        name: "Ocean Breeze",
        tier: "rare",
        class: "rare-candle",
        requirement: "Streak 7 hari",
        requiredStreak: 7
    },
    purple: {
        name: "Mystic Dream",
        tier: "epic",
        class: "epic-candle",
        requirement: "Streak 30 hari",
        requiredStreak: 30
    },
    gold: {
        name: "Golden Hope",
        tier: "legendary",
        class: "legendary-candle",
        requirement: "Streak 100 hari",
        requiredStreak: 100
    },
    rainbow: {
        name: "Eternal Spectrum",
        tier: "mythic",
        class: "mythic-candle",
        requirement: "Premium Only",
        premiumOnly: true
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthState();
});

function setupEventListeners() {
    // Login/Register
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('showRegisterBtn').addEventListener('click', () => switchScreen('register'));
    document.getElementById('showLoginBtn').addEventListener('click', () => switchScreen('login'));
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Main Actions
    document.getElementById('lightCandleBtn').addEventListener('click', lightCandle);
    document.getElementById('buyPremiumBtn').addEventListener('click', openWhatsApp);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleNavigation(e.target.closest('.nav-btn')));
    });
    
    // Admin Actions
    document.getElementById('adminBanBtn')?.addEventListener('click', () => adminAction('ban'));
    document.getElementById('adminUnbanBtn')?.addEventListener('click', () => adminAction('unban'));
    document.getElementById('adminGrantPremiumBtn')?.addEventListener('click', () => adminAction('grantPremium'));
    document.getElementById('adminRemovePremiumBtn')?.addEventListener('click', () => adminAction('removePremium'));
    document.getElementById('adminResetStreakBtn')?.addEventListener('click', () => adminAction('resetStreak'));
}

function switchScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    if (screen === 'login') {
        document.getElementById('loginScreen').classList.add('active');
    } else if (screen === 'register') {
        document.getElementById('registerScreen').classList.add('active');
    } else if (screen === 'game') {
        document.getElementById('gameScreen').classList.add('active');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Email dan password harus diisi', 'error');
        return;
    }
    
    try {
        document.getElementById('loginBtn').disabled = true;
        document.getElementById('loginBtn').textContent = 'Masuk...';
        
        await signInWithEmailAndPassword(auth, email, password);
        // Auth state change will handle the rest
    } catch (error) {
        console.error('Login error:', error);
        showMessage(getErrorMessage(error.code), 'error');
        document.getElementById('loginBtn').disabled = false;
        document.getElementById('loginBtn').textContent = 'Masuk';
    }
}

async function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !email || !password) {
        showMessage('Semua field harus diisi', 'error');
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        showMessage('Username harus 3-20 karakter', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password minimal 6 karakter', 'error');
        return;
    }
    
    try {
        document.getElementById('registerBtn').disabled = true;
        document.getElementById('registerBtn').textContent = 'Mendaftar...';
        
        // 1. Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ User auth created:', user.uid);
        
        // 2. Prepare user data
        const userData = {
            username: username,
            email: email,
            streak: 0,
            lastUpdate: null,
            skin: 'basic',
            title: 'Wanderer',
            premium: {
                active: false,
                until: null
            },
            banned: false,
            createdAt: Date.now()
        };
        
        // 3. SAVE BOTH user data AND leaderboard data
        const updates = {
            [`users/${user.uid}`]: userData,
            [`leaderboard/${user.uid}`]: {
                username: username,
                streak: 0
            }
        };
        
        console.log('📝 Saving updates:', updates);
        
        // 4. Save all data at once
        await update(ref(db), updates);
        
        console.log('✅ All data saved successfully');
        
        showMessage('🎉 Pendaftaran berhasil!', 'success');
        
        // 5. Auto login after 1 second
        setTimeout(async () => {
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (loginError) {
                console.error('Auto-login failed:', loginError);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Register error:', error);
        showMessage(getErrorMessage(error.code), 'error');
        document.getElementById('registerBtn').disabled = false;
        document.getElementById('registerBtn').textContent = 'Daftar';
    }
}

function checkAuthState() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log('👤 User logged in:', user.uid);
            await loadUserData();
            switchScreen('game');
            initializeGame();
        } else {
            currentUser = null;
            userData = null;
            console.log('👋 No user logged in');
            switchScreen('login');
        }
    });
}

async function loadUserData() {
    if (!currentUser) {
        console.log('❌ No current user');
        return;
    }
    
    console.log('🔄 Loading data for user:', currentUser.uid);
    
    try {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            userData = snapshot.val();
            console.log('✅ User data loaded:', userData);
            
            // Check if banned
            if (userData.banned) {
                console.log('🚫 User is banned');
                await signOut(auth);
                showMessage('Akun Anda telah di-ban', 'error');
                return;
            }
            
            // Check admin status
            const adminRef = ref(db, `admins/${currentUser.uid}`);
            const adminSnapshot = await get(adminRef);
            isAdmin = adminSnapshot.exists();
            console.log('👑 Admin status:', isAdmin);
            
            updateUI();
            checkDailyReset();
            
        } else {
            console.error('❌ User data not found in database!');
            showMessage('Data pengguna tidak ditemukan', 'error');
        }
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        showMessage('Gagal memuat data pengguna', 'error');
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        showMessage('Berhasil logout', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Gagal logout', 'error');
    }
}

function initializeGame() {
    console.log('🎮 Initializing game...');
    loadLeaderboard();
    loadSkins();
    updateCandle();
    
    if (isAdmin) {
        document.getElementById('adminPanel').style.display = 'block';
        console.log('⚙️ Admin panel shown');
    }
    
    // Listen to user data changes
    onValue(ref(db, `users/${currentUser.uid}`), (snapshot) => {
        if (snapshot.exists()) {
            userData = snapshot.val();
            console.log('🔄 User data updated:', userData);
            updateUI();
        }
    });
}

function updateUI() {
    if (!userData) {
        console.log('⚠️ No user data to update UI');
        return;
    }
    
    console.log('🎨 Updating UI with data:', userData);
    
    // Update header
    document.getElementById('usernameDisplay').textContent = userData.username;
    document.getElementById('userTitle').textContent = userData.title || 'Wanderer';
    
    // Check premium
    const isPremium = userData.premium?.active && 
                     userData.premium?.until && 
                     Date.now() < userData.premium.until;
    
    document.getElementById('premiumBadge').style.display = isPremium ? 'block' : 'none';
    
    // Update streak
    document.getElementById('streakNumber').textContent = userData.streak || 0;
    
    // Update candle status
    updateCandleStatus();
}

function updateCandle() {
    if (!userData) return;
    
    const candleBody = document.getElementById('candleBody');
    const skinData = SKINS[userData.skin] || SKINS.basic;
    
    candleBody.className = 'candle-body ' + skinData.class;
    console.log('🕯️ Candle updated with skin:', skinData.name);
}

function updateCandleStatus() {
    if (!userData) return;
    
    const today = new Date().toDateString();
    const lastUpdate = userData.lastUpdate ? new Date(userData.lastUpdate).toDateString() : null;
    const canLightToday = lastUpdate !== today;
    
    const btn = document.getElementById('lightCandleBtn');
    const flame = document.getElementById('candleFlame');
    const statusMsg = document.getElementById('statusMessage');
    
    console.log('📅 Date check - Today:', today, 'Last Update:', lastUpdate, 'Can light:', canLightToday);
    
    if (canLightToday) {
        btn.disabled = false;
        btn.textContent = 'Nyalakan Lilin Hari Ini';
        flame.classList.remove('lit');
        statusMsg.textContent = '';
    } else {
        btn.disabled = true;
        btn.textContent = 'Sudah Dinyalakan Hari Ini';
        flame.classList.add('lit');
        statusMsg.textContent = '✨ Lilin sudah menyala hari ini';
    }
}

async function lightCandle() {
    if (!currentUser || !userData) {
        console.error('❌ Cannot light candle: No user data');
        showMessage('Data pengguna tidak ditemukan', 'error');
        return;
    }
    
    const today = new Date().toDateString();
    const lastUpdate = userData.lastUpdate ? new Date(userData.lastUpdate).toDateString() : null;
    
    console.log('🔥 Light candle attempt:', { today, lastUpdate });
    
    if (lastUpdate === today) {
        console.log('⚠️ Already lit today');
        showMessage('Anda sudah menyalakan lilin hari ini', 'error');
        return;
    }
    
    try {
        const btn = document.getElementById('lightCandleBtn');
        btn.disabled = true;
        btn.textContent = 'Menyalakan...';
        
        // Calculate new streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        let newStreak = userData.streak || 0;
        
        console.log('📊 Streak calculation:', {
            yesterday: yesterdayStr,
            currentStreak: newStreak,
            lastUpdate: lastUpdate
        });
        
        if (lastUpdate === yesterdayStr) {
            // Continue streak
            newStreak += 1;
            console.log('✅ Continuing streak:', newStreak);
        } else if (lastUpdate === null) {
            // First time
            newStreak = 1;
            console.log('🎉 First time lighting:', newStreak);
        } else {
            // Streak broken
            newStreak = 1;
            console.log('🔄 Streak broken, reset to:', newStreak);
        }
        
        // Calculate title
        const newTitle = calculateTitle(newStreak);
        
        // Prepare updates
        const updates = {
            [`users/${currentUser.uid}/streak`]: newStreak,
            [`users/${currentUser.uid}/lastUpdate`]: Date.now(),
            [`users/${currentUser.uid}/title`]: newTitle,
            [`leaderboard/${currentUser.uid}/username`]: userData.username,
            [`leaderboard/${currentUser.uid}/streak`]: newStreak
        };
        
        console.log('📝 Firebase updates:', updates);
        
        // Update Firebase
        await update(ref(db), updates);
        
        console.log('✅ Firebase update successful');
        
        // Update local data immediately
        userData.streak = newStreak;
        userData.lastUpdate = Date.now();
        userData.title = newTitle;
        
        // Animate
        const flame = document.getElementById('candleFlame');
        flame.classList.add('lit');
        
        // Update button
        btn.textContent = 'Sudah Dinyalakan Hari Ini';
        
        showMessage(`🕯️ Lilin menyala! Streak: ${newStreak} hari`, 'success');
        
        // Update UI immediately
        updateUI();
        
        // Play sound effect
        playSound();
        
    } catch (error) {
        console.error('❌ Light candle error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        showMessage(`Gagal menyalakan lilin: ${error.message}`, 'error');
        
        // Reset button
        const btn = document.getElementById('lightCandleBtn');
        btn.disabled = false;
        btn.textContent = 'Nyalakan Lilin Hari Ini';
    }
}

function calculateTitle(streak) {
    if (streak >= 365) return 'Eternal Keeper';
    if (streak >= 100) return 'Flame Guardian';
    if (streak >= 30) return 'Light Bearer';
    return 'Wanderer';
}

async function checkDailyReset() {
    if (!userData || !userData.lastUpdate) return;
    
    const lastUpdateDate = new Date(userData.lastUpdate);
    const today = new Date();
    
    const diffDays = Math.floor((today - lastUpdateDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
        console.log('📅 Streak will reset on next candle light');
    }
}

function loadLeaderboard() {
    console.log('🏆 Loading leaderboard...');
    
    const leaderboardRef = query(
        ref(db, 'leaderboard'),
        orderByChild('streak'),
        limitToLast(100)
    );
    
    onValue(leaderboardRef, async (snapshot) => {
        const leaderboardDiv = document.getElementById('leaderboardList');
        leaderboardDiv.innerHTML = '';
        
        if (!snapshot.exists()) {
            console.log('📊 No leaderboard data');
            leaderboardDiv.innerHTML = '<div class="loading">Belum ada data</div>';
            return;
        }
        
        const players = [];
        snapshot.forEach((child) => {
            const data = child.val();
            players.push({
                uid: child.key,
                ...data
            });
        });
        
        // Sort descending
        players.sort((a, b) => b.streak - a.streak);
        
        console.log('📊 Leaderboard loaded:', players.length, 'players');
        
        // Display
        players.forEach((player, index) => {
            const rank = index + 1;
            const item = createLeaderboardItem(player, rank);
            leaderboardDiv.appendChild(item);
        });
    });
}

async function updateRankTitles(players) {
    const updates = {};
    
    players.forEach((player, index) => {
        const rank = index + 1;
        let title = 'Wanderer';
        
        if (rank === 1) title = 'Eternal Keeper';
        else if (rank <= 10) title = 'Flame Guardian';
        else if (rank <= 100) title = 'Light Bearer';
        
        updates[`users/${player.uid}/title`] = title;
    });
    
    if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
    }
}

function createLeaderboardItem(player, rank) {
    const div = document.createElement('div');
    div.className = 'leaderboard-item';
    
    if (rank === 1) div.classList.add('top1');
    else if (rank <= 10) div.classList.add('top10');
    else if (rank <= 100) div.classList.add('top100');
    
    let rankClass = '';
    if (rank === 1) rankClass = 'top1';
    else if (rank <= 10) rankClass = 'top10';
    else if (rank <= 100) rankClass = 'top100';
    
    let title = 'Wanderer';
    if (rank === 1) title = 'Eternal Keeper';
    else if (rank <= 10) title = 'Flame Guardian';
    else if (rank <= 100) title = 'Light Bearer';
    
    div.innerHTML = `
        <div class="rank ${rankClass}">#${rank}</div>
        <div class="player-info">
            <div class="player-name">${escapeHtml(player.username)}</div>
            <div class="player-title">${title}</div>
        </div>
        <div class="player-streak">${player.streak} 🔥</div>
    `;
    
    return div;
}

function loadSkins() {
    const skinsGrid = document.getElementById('skinsGrid');
    skinsGrid.innerHTML = '';
    
    Object.keys(SKINS).forEach(skinKey => {
        const skin = SKINS[skinKey];
        const card = createSkinCard(skinKey, skin);
        skinsGrid.appendChild(card);
    });
    
    console.log('🎨 Skins loaded');
}

function createSkinCard(skinKey, skin) {
    const div = document.createElement('div');
    div.className = 'skin-card';
    
    const isUnlocked = checkSkinUnlocked(skinKey, skin);
    const isSelected = userData.skin === skinKey;
    
    if (isUnlocked) div.classList.add('unlocked');
    if (isSelected) div.classList.add('selected');
    
    div.innerHTML = `
        <div class="skin-preview ${skin.class}"></div>
        <div class="skin-name">${skin.name}</div>
        <div class="skin-tier tier-${skin.tier}">${skin.tier.toUpperCase()}</div>
        <div class="skin-requirement">${skin.requirement}</div>
    `;
    
    if (isUnlocked) {
        div.addEventListener('click', () => selectSkin(skinKey));
    }
    
    return div;
}

function checkSkinUnlocked(skinKey, skin) {
    if (skin.unlocked) return true;
    if (skin.premiumOnly) {
        return userData.premium?.active && 
               userData.premium?.until && 
               Date.now() < userData.premium.until;
    }
    if (skin.requiredStreak) {
        return userData.streak >= skin.requiredStreak;
    }
    return false;
}

async function selectSkin(skinKey) {
    if (!currentUser) return;
    
    try {
        await update(ref(db, `users/${currentUser.uid}`), {
            skin: skinKey
        });
        
        userData.skin = skinKey;
        updateCandle();
        loadSkins();
        showMessage('Skin berhasil dipilih!', 'success');
    } catch (error) {
        console.error('Select skin error:', error);
        showMessage('Gagal memilih skin', 'error');
    }
}

function handleNavigation(btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const tab = btn.dataset.tab;
    
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    const mainArea = document.querySelector('.main-area');
    if (tab === 'home') {
        mainArea.style.display = 'flex';
    } else {
        mainArea.style.display = 'none';
        
        if (tab === 'leaderboard') {
            document.getElementById('leaderboardTab').classList.add('active');
        } else if (tab === 'skins') {
            document.getElementById('skinsTab').classList.add('active');
        } else if (tab === 'premium') {
            document.getElementById('premiumTab').classList.add('active');
        }
    }
}

function openWhatsApp() {
    window.open('https://whatsapp.com/channel/0029VbBebzhLtOjDH9Xcb23v', '_blank');
}

// Admin Functions
async function adminAction(action) {
    if (!isAdmin) {
        showMessage('Anda bukan admin', 'error');
        return;
    }
    
    const targetUID = document.getElementById('adminTargetUID').value.trim();
    if (!targetUID) {
        showMessage('Masukkan UID user', 'error');
        return;
    }
    
    try {
        const updates = {};
        
        switch(action) {
            case 'ban':
                updates[`users/${targetUID}/banned`] = true;
                showMessage('User berhasil di-ban', 'success');
                break;
                
            case 'unban':
                updates[`users/${targetUID}/banned`] = false;
                showMessage('User berhasil di-unban', 'success');
                break;
                
            case 'grantPremium':
                const until = Date.now() + (30 * 24 * 60 * 60 * 1000);
                updates[`users/${targetUID}/premium/active`] = true;
                updates[`users/${targetUID}/premium/until`] = until;
                showMessage('Premium berhasil diberikan (30 hari)', 'success');
                break;
                
            case 'removePremium':
                updates[`users/${targetUID}/premium/active`] = false;
                updates[`users/${targetUID}/premium/until`] = null;
                showMessage('Premium berhasil dihapus', 'success');
                break;
                
            case 'resetStreak':
                updates[`users/${targetUID}/streak`] = 0;
                updates[`leaderboard/${targetUID}/streak`] = 0;
                showMessage('Streak berhasil di-reset', 'success');
                break;
        }
        
        await update(ref(db), updates);
        document.getElementById('adminTargetUID').value = '';
        
    } catch (error) {
        console.error('Admin action error:', error);
        showMessage('Gagal melakukan aksi admin', 'error');
    }
}

// Helper Functions
function showMessage(message, type) {
    // Remove existing toast
    const existingToasts = document.querySelectorAll('.toast-message');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        font-weight: 500;
        text-align: center;
        min-width: 250px;
        max-width: 90%;
    `;
    
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

function playSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 528;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function getErrorMessage(errorCode) {
    switch(errorCode) {
        case 'auth/email-already-in-use':
            return 'Email sudah terdaftar';
        case 'auth/invalid-email':
            return 'Email tidak valid';
        case 'auth/weak-password':
            return 'Password terlalu lemah';
        case 'auth/user-not-found':
            return 'User tidak ditemukan';
        case 'auth/wrong-password':
            return 'Password salah';
        case 'auth/invalid-credential':
            return 'Email atau password salah';
        case 'auth/network-request-failed':
            return 'Koneksi internet bermasalah';
        case 'auth/too-many-requests':
            return 'Terlalu banyak percobaan, coba lagi nanti';
        case 'auth/operation-not-allowed':
            return 'Metode login tidak diizinkan';
        default:
            return `Terjadi kesalahan (${errorCode})`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// TEST FUNCTION - Tambahkan di akhir
async function testDatabase() {
    console.log('🧪 Running database test...');
    
    try {
        // Test 1: Write test data
        const testRef = ref(db, 'testConnection');
        await set(testRef, { 
            test: 'Database connection test',
            timestamp: Date.now() 
        });
        console.log('✅ Test 1: Write successful');
        
        // Test 2: Read test data
        const snapshot = await get(testRef);
        console.log('✅ Test 2: Read successful:', snapshot.val());
        
        // Test 3: Check if users path exists
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);
        console.log('✅ Test 3: Users path exists:', usersSnapshot.exists());
        
        return true;
    } catch (error) {
        console.error('❌ Database test failed:', error);
        return false;
    }
}

// Run test on load
setTimeout(() => {
    testDatabase();
}, 2000);