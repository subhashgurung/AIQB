/* ============================================
   AIQB Authentication UI Handler
   ============================================ */

(function () {
    // DOM Elements
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const authModalClose = document.getElementById('authModalClose');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loggedInView = document.getElementById('loggedInView');
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const loginFormEl = document.getElementById('loginFormEl');
    const signupFormEl = document.getElementById('signupFormEl');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');

    // Current user state
    let currentUser = null;

    // ============================================
    // Modal Functions
    // ============================================
    function openModal() {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Set focus to first input
        setTimeout(() => {
            const firstInput = authModal.querySelector('input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    function closeModal() {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showLoginForm() {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        loggedInView.style.display = 'none';
    }

    function showSignupForm() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        loggedInView.style.display = 'none';
    }

    function showLoggedInView(user) {
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        loggedInView.style.display = 'block';

        // Update user info
        userName.textContent = user.user_metadata?.full_name || 'User';
        userEmail.textContent = user.email;
    }

    function updateAuthButton(user) {
        if (user) {
            const name = user.user_metadata?.full_name || user.email.split('@')[0];
            authBtn.textContent = name.split(' ')[0];
            authBtn.classList.add('logged-in');
        } else {
            authBtn.textContent = 'Login';
            authBtn.classList.remove('logged-in');
        }
    }

    // ============================================
    // Auth Functions
    // ============================================
    async function handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = loginFormEl.querySelector('button[type="submit"]');

        try {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            const { user, session } = await SupabaseAuth.signIn(email, password);

            currentUser = user;
            updateAuthButton(user);
            showLoggedInView(user);

            if (window.toast) {
                toast.success('Welcome back!', { title: 'Signed In' });
            }

            // Close modal after a short delay
            setTimeout(closeModal, 1500);

        } catch (error) {
            console.error('Login error:', error);
            if (window.toast) {
                toast.error(error.message || 'Failed to sign in. Please try again.', { title: 'Login Failed' });
            } else {
                alert(error.message || 'Failed to sign in. Please try again.');
            }
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }

    async function handleSignup(e) {
        e.preventDefault();

        const fullName = document.getElementById('signupName').value;
        const phone = document.getElementById('signupPhone').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const submitBtn = signupFormEl.querySelector('button[type="submit"]');

        try {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            const { user } = await SupabaseAuth.signUp(email, password, fullName, phone);

            if (window.toast) {
                toast.success('Account created! Please check your email to verify your account.', {
                    title: 'Welcome to AIQB',
                    duration: 8000
                });
            }

            // Show login form for them to sign in after verification
            showLoginForm();

        } catch (error) {
            console.error('Signup error:', error);
            if (window.toast) {
                toast.error(error.message || 'Failed to create account. Please try again.', { title: 'Signup Failed' });
            } else {
                alert(error.message || 'Failed to create account. Please try again.');
            }
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }

    async function handleLogout() {
        try {
            await SupabaseAuth.signOut();
            currentUser = null;
            updateAuthButton(null);
            showLoginForm();
            closeModal();

            if (window.toast) {
                toast.info('You have been signed out.', { title: 'Signed Out' });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // ============================================
    // Initialize
    // ============================================
    async function init() {
        // Check for existing session
        try {
            const user = await SupabaseAuth.getCurrentUser();
            if (user) {
                currentUser = user;
                updateAuthButton(user);
            }

            // Listen for auth state changes
            SupabaseAuth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    currentUser = session.user;
                    updateAuthButton(session.user);
                } else if (event === 'SIGNED_OUT') {
                    currentUser = null;
                    updateAuthButton(null);
                }
            });
        } catch (error) {
            console.error('Auth init error:', error);
        }

        // Event listeners
        authBtn.addEventListener('click', () => {
            if (currentUser) {
                showLoggedInView(currentUser);
            } else {
                showLoginForm();
            }
            openModal();
        });

        authModalClose.addEventListener('click', closeModal);

        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                closeModal();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && authModal.classList.contains('active')) {
                closeModal();
            }
        });

        showSignupBtn.addEventListener('click', showSignupForm);
        showLoginBtn.addEventListener('click', showLoginForm);

        loginFormEl.addEventListener('submit', handleLogin);
        signupFormEl.addEventListener('submit', handleSignup);
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
