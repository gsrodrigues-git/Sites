const loginForm = document.getElementById("loginForm");
const loginFeedback = document.getElementById("loginFeedback");

if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
}

function handleLoginSubmit(event) {
    event.preventDefault();

    const submitButton = loginForm.querySelector('button[type="submit"]');
    const redirectTarget = getSafeRedirect();

    if (loginFeedback) {
        loginFeedback.textContent = "Entrando na sua conta...";
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Entrando...";
    }

    window.setTimeout(() => {
        window.location.href = redirectTarget;
    }, 700);
}

function getSafeRedirect() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (!redirect) {
        return "index.html";
    }

    if (redirect.startsWith("http://") || redirect.startsWith("https://") || redirect.startsWith("//")) {
        return "index.html";
    }

    if (!redirect.endsWith(".html") && !redirect.includes(".html?") && !redirect.includes(".html#")) {
        return "index.html";
    }

    return redirect;
}
