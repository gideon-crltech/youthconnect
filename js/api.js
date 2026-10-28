/*
 * YouthConnect API
 * Connects the website to the FastAPI backend.
 */

(function () {
    "use strict";

    const API_BASE = "http://127.0.0.1:8000";

    async function apiRequest(endpoint, options = {}) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            body: options.body
                ? JSON.stringify(options.body)
                : undefined
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const detail = data.detail || data.message || "Request failed.";

            throw new Error(
                typeof detail === "string"
                    ? detail
                    : JSON.stringify(detail)
            );
        }

        return data;
    }

    function showMessage(form, message, isError = false) {
        let messageElement = form.querySelector(".form-message");

        if (!messageElement) {
            messageElement = document.createElement("p");
            messageElement.className = "form-message";

            const button = form.querySelector(
                'button[type="submit"], input[type="submit"]'
            );

            if (button) {
                form.insertBefore(messageElement, button);
            } else {
                form.appendChild(messageElement);
            }
        }

        messageElement.textContent = message;
        messageElement.style.color = isError ? "#b42318" : "#067647";
        messageElement.setAttribute("role", "status");
    }

    // LOGIN
    document.addEventListener("submit", async function (event) {
        const form = event.target;

        if (form.id !== "login-form") {
            return;
        }

        event.preventDefault();

        const email = form.querySelector("#email")?.value.trim();
        const password = form.querySelector("#password")?.value;

        try {
            const result = await apiRequest("/auth/login", {
                method: "POST",
                body: { email, password }
            });

            sessionStorage.setItem("access_token", result.access_token);

            window.location.href = "dashboard.html";
        } catch (error) {
            showMessage(form, error.message, true);
        }
    });

    // REGISTRATION
    document.addEventListener("submit", async function (event) {
        const form = event.target;

        if (form.id !== "register-form") {
            return;
        }

        event.preventDefault();

        const formData = new FormData(form);

        const password = form.querySelector("#register-password")?.value;
        const confirmation = form.querySelector("#confirm-password")?.value;

        if (password !== confirmation) {
            showMessage(form, "Passwords do not match.", true);
            return;
        }

        const userData = {
            first_name: formData.get("first_name")?.trim(),
            last_name: formData.get("last_name")?.trim(),
            email: formData.get("email")?.trim(),
            password: password
        };

        try {
            const result = await apiRequest("/auth/register", {
                method: "POST",
                body: userData
            });

            if (result.access_token) {
                sessionStorage.setItem("access_token", result.access_token);
            }

            window.location.href = "dashboard.html";
        } catch (error) {
            showMessage(form, error.message, true);
        }
    });

    // PUBLIC API HELPERS
        // PUBLIC API HELPERS
    window.YouthConnectAPI = {
        request: async function (endpoint, options = {}) {
            const token = sessionStorage.getItem("access_token");

            const headers = {
                ...(options.headers || {})
            };

            // Attach the JWT token to authenticated requests.
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            return apiRequest(endpoint, {
                ...options,
                headers: headers
            });
        },

        getCurrentUser: function () {
            const token = sessionStorage.getItem("access_token");

            if (!token) {
                window.location.href = "index.html";
                return Promise.reject(
                    new Error("Please log in first.")
                );
            }

            return window.YouthConnectAPI.request("/auth/me");
        },

        logout: function () {
            sessionStorage.removeItem("access_token");
            window.location.href = "index.html";
        }
    };

})();
