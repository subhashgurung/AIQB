/* ============================================
   AIQB Supabase Configuration
   ============================================ */

const SUPABASE_CONFIG = {
    url: 'https://lckqlaedsikqqpadrzkb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxja3FsYWVkc2lrcXFwYWRyemtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Mzk2MjgsImV4cCI6MjA4NDExNTYyOH0.87PeEfrhOBdByjhkcQmYVhriVCxkZ1fFYjVQ_hFbSMY'
};

// Initialize Supabase client
let supabase = null;

async function initSupabase() {
    if (supabase) return supabase;

    // Load Supabase from CDN if not already loaded
    if (!window.supabase) {
        await loadSupabaseScript();
    }

    supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
    );

    return supabase;
}

function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ============================================
// Authentication Functions
// ============================================

async function signUp(email, password, fullName = '', phone = '') {
    const client = await initSupabase();

    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone: phone
            }
        }
    });

    if (error) throw error;
    return data;
}

async function signIn(email, password) {
    const client = await initSupabase();

    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
}

async function signOut() {
    const client = await initSupabase();

    const { error } = await client.auth.signOut();
    if (error) throw error;
}

async function getCurrentUser() {
    const client = await initSupabase();

    const { data: { user } } = await client.auth.getUser();
    return user;
}

async function getSession() {
    const client = await initSupabase();

    const { data: { session } } = await client.auth.getSession();
    return session;
}

async function resetPassword(email) {
    const client = await initSupabase();

    const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
}

// Listen for auth state changes
async function onAuthStateChange(callback) {
    const client = await initSupabase();

    return client.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// ============================================
// Database Functions
// ============================================

async function createOrder(orderData) {
    const client = await initSupabase();
    const user = await getCurrentUser();

    const { data, error } = await client
        .from('orders')
        .insert({
            order_id: orderData.orderId,
            user_id: user?.id || null,
            full_name: orderData.fullName,
            email: orderData.email,
            phone: orderData.phone,
            size: orderData.size,
            lining_color: orderData.lining,
            address: orderData.address,
            city: orderData.city,
            landmark: orderData.landmark || null,
            payment_method: orderData.payment,
            amount_npr: orderData.amount
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function getOrders() {
    const client = await initSupabase();

    const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

async function getOrderById(orderId) {
    const client = await initSupabase();

    const { data, error } = await client
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

    if (error) throw error;
    return data;
}

async function getStockLevels() {
    const client = await initSupabase();

    const { data, error } = await client
        .from('product_sizes')
        .select('*');

    if (error) throw error;
    return data;
}

async function getTotalStock() {
    const stockLevels = await getStockLevels();

    const totals = stockLevels.reduce((acc, item) => {
        acc.total += item.total_stock;
        acc.reserved += item.reserved_stock;
        acc.available += item.available_stock;
        return acc;
    }, { total: 0, reserved: 0, available: 0 });

    return totals;
}

async function getUserProfile() {
    const client = await initSupabase();
    const user = await getCurrentUser();

    if (!user) return null;

    const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) throw error;
    return data;
}

async function updateUserProfile(profileData) {
    const client = await initSupabase();
    const user = await getCurrentUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await client
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// Export for use in main.js
// ============================================
window.SupabaseAuth = {
    init: initSupabase,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getSession,
    resetPassword,
    onAuthStateChange
};

window.SupabaseDB = {
    createOrder,
    getOrders,
    getOrderById,
    getStockLevels,
    getTotalStock,
    getUserProfile,
    updateUserProfile
};
