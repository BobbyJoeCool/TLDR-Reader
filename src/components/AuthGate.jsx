export default function AuthGate({ user, login }) {
  if (user === undefined) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1 className="auth-title">TLDR Reader</h1>
          <p className="auth-subtitle">Your personal reading queue</p>
          <button className="auth-btn" onClick={login}>
            <MicrosoftIcon />
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
