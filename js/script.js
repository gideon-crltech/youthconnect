
/*
 * YouthConnect Website Script
 * Handles registration form navigation and page initialization.
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        // REGISTRATION FORM NAVIGATION
        const continueButton = document.getElementById("continue-button");
        const backButton = document.getElementById("back-button");
        const personalSection = document.getElementById("personal-section");
        const careerSection = document.getElementById("career-section");

        const step1 = document.getElementById("step-indicator-1");
        const step2 = document.getElementById("step-indicator-2");

        function showStep(number) {
            const secondStep = number === 2;

            if (!personalSection || !careerSection) {
                return;
            }

            personalSection.hidden = secondStep;
            careerSection.hidden = !secondStep;

            personalSection.classList.toggle("active", !secondStep);
            careerSection.classList.toggle("active", secondStep);

            if (step1) {
                step1.classList.toggle("active", !secondStep);
                step1.classList.toggle("completed", secondStep);
            }

            if (step2) {
                step2.classList.toggle("active", secondStep);
            }
        }

        if (
            continueButton &&
            backButton &&
            personalSection &&
            careerSection
        ) {
            continueButton.addEventListener("click", function () {
                const fields = personalSection.querySelectorAll(
                    "input, select, textarea"
                );

                for (const field of fields) {
                    if (!field.checkValidity()) {
                        field.reportValidity();
                        return;
                    }
                }

                showStep(2);
            });

            backButton.addEventListener("click", function () {
                showStep(1);
            });

            showStep(1);
        }

        // LOGOUT
        document.querySelectorAll(".logout-button").forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();

                sessionStorage.removeItem("access_token");

                window.location.href = "index.html";
            });
        });

        // BASIC BACKEND HEALTH CHECK
        const statusElement = document.getElementById("backend-status");

        if (statusElement && window.YouthConnectAPI) {
            window.YouthConnectAPI.request("/health")
                .then(function () {
                    statusElement.textContent = "Server connected";
                })
                .catch(function () {
                    statusElement.textContent = "Server unavailable";
                });
        }

    });
})();