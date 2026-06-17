<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import { createClient } from '$lib/supabase/client'
  import Toast from '$lib/components/Toast.svelte'
  import '../app.css'

  let { children, data } = $props()

  let theme = $state<'light' | 'dark'>(
    typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark'
      : 'dark'
  )
  let showUserMenu = $state(false)
  const supabase = createClient()

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  $effect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) {
      theme = saved
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme = prefersDark ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', theme)
  })

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (showUserMenu && !target.closest('.user-menu-container')) {
      showUserMenu = false
    }
  }

  function handleEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && showUserMenu) {
      showUserMenu = false
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    showUserMenu = false
    window.location.href = '/'
  }

  function getUserInitials(
    user: {
      email?: string
      user_metadata?: { full_name?: string; name?: string }
    } | null,
  ): string {
    if (!user) return ''
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      ''
    return name.charAt(0).toUpperCase()
  }
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleEscapeKey} />

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>SplitUp - Split expenses easily</title>
</svelte:head>

<div class="app">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header class="header">
    <div class="header-bg"></div>
    <div class="container header-content">
      <a href="/" class="logo">
        <span class="logo-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0z" />
            <line x1="9" y1="3" x2="9" y2="6" />
            <line x1="9" y1="12" x2="9" y2="15" />
            <line x1="3" y1="9" x2="6" y2="9" />
            <line x1="12" y1="9" x2="15" y2="9" />
          </svg>
        </span>
        <span class="logo-text">SplitUp</span>
      </a>
      <div class="actions">
        <button
          class="theme-toggle btn btn-icon btn-ghost"
          onclick={toggleTheme}
          aria-label="Toggle theme"
        >
          {#if theme === 'dark'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          {/if}
        </button>
        <div class="header-auth">
          {#if data.session?.user}
            <div class="user-menu-container">
              <button
                class="user-avatar-btn"
                onclick={() => (showUserMenu = !showUserMenu)}
                aria-expanded={showUserMenu}
                aria-label="User menu"
              >
                {#if data.session.user.user_metadata?.avatar_url}
                  <img
                    src={data.session.user.user_metadata.avatar_url}
                    alt=""
                    class="user-avatar-img"
                  />
                {:else}
                  <span class="user-avatar-initials"
                    >{getUserInitials(data.session.user)}</span
                  >
                {/if}
              </button>
              {#if showUserMenu}
                <div class="user-menu card-elevated">
                  <div class="user-menu-header">
                    <span class="user-menu-name">
                      {data.session.user.user_metadata?.full_name ||
                        data.session.user.user_metadata?.name ||
                        'User'}
                    </span>
                    <span class="user-menu-email"
                      >{data.session.user.email}</span
                    >
                  </div>
                  <div class="user-menu-divider"></div>
                  <button class="user-menu-item" onclick={signOut}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </div>
              {/if}
            </div>
          {:else}
            <button class="btn btn-primary" onclick={signInWithGoogle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0z" />
              </svg>
              Sign in with Google
            </button>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main id="main-content" class="main">
    {@render children()}
  </main>

  <Toast />
</div>

<style>
  .skip-link {
    position: fixed;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    padding: 12px 24px;
    border-radius: var(--radius-full);
    z-index: 200;
    font-weight: 600;
    transition: top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: var(--elevation-4);
  }

  .skip-link:focus {
    top: 16px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }

  .user-menu-container {
    position: relative;
  }

  .header-auth {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-avatar-btn {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    overflow: hidden;
    background: var(--color-primary-container);
    border: 2px solid var(--color-outline-variant);
    cursor: pointer;
    transition: border-color var(--transition-fast);
  }

  .user-avatar-btn:hover {
    border-color: var(--color-primary);
  }

  .user-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-avatar-initials {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: 700;
    font-size: 14px;
    color: var(--color-on-primary-container);
  }

  .user-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 220px;
    padding: 8px;
    z-index: 100;
    animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .user-menu-header {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-menu-name {
    font-weight: 600;
    font-size: 14px;
  }

  .user-menu-email {
    font-size: 12px;
    color: var(--color-on-surface-variant);
  }

  .user-menu-divider {
    height: 1px;
    background: var(--color-outline-variant);
    margin: 4px 0;
  }

  .user-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-on-surface-variant);
    transition: all var(--transition-fast);
    text-align: left;
  }

  .user-menu-item:hover {
    background: var(--color-surface-container);
    color: var(--color-on-surface);
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
