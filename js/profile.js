document.addEventListener("DOMContentLoaded", async function () {
    "use strict";

    const API = window.YouthConnectAPI;
    const message = document.getElementById("profile-message");

    const firstNameElement = document.getElementById("first-name");
    const lastNameElement = document.getElementById("last-name");
    const emailElement = document.getElementById("email-address");
    const avatarElement = document.getElementById("profile-avatar");

    const educationForm = document.getElementById("education-form");
    const countryInput = document.getElementById("current-country");
    const institutionInput = document.getElementById("institution");
    const fieldOfStudyInput = document.getElementById("field-of-study");
    const educationLevelInput = document.getElementById("education-level");
    const educationStatusInput = document.getElementById("education-status");
    const startYearInput = document.getElementById("start-year");
    const graduationYearInput = document.getElementById("graduation-year");

    const skillInput = document.getElementById("skill-name");
    const skillLevelInput = document.getElementById("skill-level");
    const skillList = document.getElementById("skill-list");
    const addSkillButton = document.getElementById("add-skill");
    const skillRatingInput = document.getElementById("skill-rating");
    const skillNotesInput = document.getElementById("skill-notes");
const skillEvidenceInput = document.getElementById("skill-evidence");

    const qualificationNameInput =
        document.getElementById("qualification-name");
    const qualificationIssuerInput =
        document.getElementById("qualification-issuer");
    const qualificationYearInput =
        document.getElementById("qualification-year");
    const qualificationStatusInput =
        document.getElementById("qualification-status");
    const qualificationList =
        document.getElementById("qualification-list");
    const addQualificationButton =
        document.getElementById("add-qualification");

    const completionBar = document.getElementById("completion-bar");
    const completionText = document.getElementById("completion-text");

    let skills = [];
    let qualifications = [];

    // Display messages to the user.
    function showMessage(text, isError = false) {
        message.textContent = text;
        message.style.color = isError ? "#b91c1c" : "#0f766e";
    }

    // Send an authenticated request to the FastAPI backend.
    async function apiRequest(endpoint, options = {}) {
        try {
            return await API.request(endpoint, options);
        } catch (error) {
            if (
                error.message.includes("Invalid or expired token") ||
                error.message.includes("User not found or inactive")
            ) {
                API.logout();
            }

            throw error;
        }
    }

    // Convert an optional numeric input to a number or null.
    function optionalNumber(input) {
        const value = input.value.trim();

        return value === "" ? null : Number(value);
    }

    // Load personal information.
    async function loadUser() {
        const user = await API.getCurrentUser();

        firstNameElement.textContent = user.first_name || "";
        lastNameElement.textContent = user.last_name || "";
        emailElement.textContent = user.email || "";

        const initials =
            (user.first_name?.charAt(0) || "") +
            (user.last_name?.charAt(0) || "");

        avatarElement.textContent = initials.toUpperCase() || "YC";
    }

    // Load education information from PostgreSQL.
    async function loadEducation() {
        const profile = await apiRequest("/profile/me");

        countryInput.value = profile.current_country || "Namibia";
        institutionInput.value = profile.institution || "";
        fieldOfStudyInput.value = profile.field_of_study || "";
        educationLevelInput.value = profile.education_level || "";
        educationStatusInput.value = profile.education_status || "";

        startYearInput.value = profile.start_year ?? "";
        graduationYearInput.value = profile.graduation_year ?? "";
    }

    // Save education information.
    educationForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const startYear = optionalNumber(startYearInput);
        const graduationYear = optionalNumber(graduationYearInput);

        if (
            (startYear !== null && !Number.isInteger(startYear)) ||
            (graduationYear !== null && !Number.isInteger(graduationYear))
        ) {
            showMessage("Please enter valid whole years.", true);
            return;
        }

        if (
            startYear !== null &&
            graduationYear !== null &&
            graduationYear < startYear
        ) {
            showMessage(
                "Graduation year cannot be earlier than the starting year.",
                true
            );
            return;
        }

        const education = {
            current_country: countryInput.value,
            institution: institutionInput.value.trim() || null,
            field_of_study: fieldOfStudyInput.value.trim() || null,
            education_level: educationLevelInput.value || null,
            education_status: educationStatusInput.value || null,
            start_year: startYear,
            graduation_year: graduationYear
        };

        try {
            await apiRequest("/profile/me", {
                method: "PUT",
                body: education
            });

            showMessage("Education information saved successfully.");
            updateCompletion();
        } catch (error) {
            console.error("Unable to save education:", error);
            showMessage(
                "Unable to save education: " + error.message,
                true
            );
        }
    });

    // Display saved skills.
    function displaySkills() {
        skillList.replaceChildren();

        if (skills.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "Your skills will appear here.";
            skillList.appendChild(empty);
            return;
        }

        skills.forEach(function (skill) {
            const item = document.createElement("div");
            item.className = "profile-list-item";

            const details = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = skill.skill_name;

            const level = document.createElement("p");
            level.textContent = "Level: " + skill.skill_level;

            const rating = document.createElement("p");
            rating.textContent = "Self-rating: " +
                (skill.skill_rating != null
                    ? "★".repeat(skill.skill_rating) +
                      "☆".repeat(5 - skill.skill_rating)
                    : "Not rated");

            const notes = document.createElement("p");
            notes.textContent = "Experience: " +
                (skill.experience_notes || "No experience notes added.");

            const evidence = document.createElement("p");
            evidence.textContent = "Project/Certificate: " +
                (skill.evidence_reference || "No reference provided.");

            details.append(name, level, rating, notes, evidence);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", async function () {
                removeButton.disabled = true;

                try {
                    await apiRequest("/profile/skills/" + skill.id, {
                        method: "DELETE"
                    });

                    skills = skills.filter(
                        function (savedSkill) {
                            return savedSkill.id !== skill.id;
                        }
                    );

                    displaySkills();
                    updateCompletion();
                    showMessage("Skill removed successfully.");
                } catch (error) {
                    console.error("Unable to remove skill:", error);
                    showMessage(
                        "Unable to remove skill: " + error.message,
                        true
                    );
                    removeButton.disabled = false;
                }
            });

            item.append(details, removeButton);
            skillList.appendChild(item);
        });
    }

    // Load saved skills.
    async function loadSkills() {
        skills = await apiRequest("/profile/skills");
        displaySkills();
    }

    // Add a skill to PostgreSQL.
    addSkillButton.addEventListener("click", async function () {
        const name = skillInput.value.trim();
        const level = skillLevelInput.value;

        if (!name || !level) {
            showMessage("Enter a skill name and select its level.", true);
            return;
        }

        addSkillButton.disabled = true;

        try {
            const savedSkill = await apiRequest("/profile/skills", {
                method: "POST",
                body: {
                    skill_name: name,
                    skill_level: level,
                    skill_rating: skillRatingInput.value
                        ? Number(skillRatingInput.value)
                        : null,
                    experience_notes: skillNotesInput.value.trim() || null,
                    evidence_reference: skillEvidenceInput.value.trim() || null
                }
            });

            skills.push(savedSkill);

            skillInput.value = "";
            skillLevelInput.value = "";
            skillRatingInput.value = "";
            skillNotesInput.value = "";
            skillEvidenceInput.value = "";

            displaySkills();
            updateCompletion();
            showMessage("Skill saved successfully.");
        } catch (error) {
            console.error("Unable to save skill:", error);
            showMessage("Unable to save skill: " + error.message, true);
        } finally {
            addSkillButton.disabled = false;
        }
    });

    // Display saved qualifications.
    function displayQualifications() {
        qualificationList.replaceChildren();

        if (qualifications.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "Your qualifications will appear here.";
            qualificationList.appendChild(empty);
            return;
        }

        qualifications.forEach(function (qualification) {
            const item = document.createElement("div");
            item.className = "profile-list-item";

            const details = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = qualification.qualification_name;

            const description = document.createElement("p");

            const year = qualification.year_obtained
                ? qualification.year_obtained
                : "Year not specified";

            description.textContent =
                qualification.issuing_institution +
                " | " +
                year +
                " | " +
                qualification.status;

            details.append(name, description);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", async function () {
                removeButton.disabled = true;

                try {
                    await apiRequest(
                        "/profile/qualifications/" + qualification.id,
                        { method: "DELETE" }
                    );

                    qualifications = qualifications.filter(
                        function (savedQualification) {
                            return savedQualification.id !== qualification.id;
                        }
                    );

                    displayQualifications();
                    updateCompletion();
                    showMessage("Qualification removed successfully.");
                } catch (error) {
                    console.error(
                        "Unable to remove qualification:",
                        error
                    );

                    showMessage(
                        "Unable to remove qualification: " + error.message,
                        true
                    );

                    removeButton.disabled = false;
                }
            });

            item.append(details, removeButton);
            qualificationList.appendChild(item);
        });
    }

    // Load qualifications from PostgreSQL.
    async function loadQualifications() {
        qualifications = await apiRequest("/profile/qualifications");
        displayQualifications();
    }

    // Save a qualification to PostgreSQL.
    addQualificationButton.addEventListener(
        "click",
        async function () {
            const name = qualificationNameInput.value.trim();
            const issuer = qualificationIssuerInput.value.trim();
            const year = optionalNumber(qualificationYearInput);
            const status = qualificationStatusInput.value;

            if (!name || !issuer) {
                showMessage(
                    "Enter the qualification name and issuing institution.",
                    true
                );
                return;
            }

            if (year !== null && !Number.isInteger(year)) {
                showMessage("Enter a valid whole year.", true);
                return;
            }

            addQualificationButton.disabled = true;

            try {
                const savedQualification = await apiRequest(
                    "/profile/qualifications",
                    {
                        method: "POST",
                        body: {
                            qualification_name: name,
                            issuing_institution: issuer,
                            year_obtained: year,
                            status: status
                        }
                    }
                );

                qualifications.push(savedQualification);

                qualificationNameInput.value = "";
                qualificationIssuerInput.value = "";
                qualificationYearInput.value = "";
                qualificationStatusInput.value = "Completed";

                displayQualifications();
                updateCompletion();
                showMessage("Qualification saved successfully.");
            } catch (error) {
                console.error(
                    "Unable to save qualification:",
                    error
                );

                showMessage(
                    "Unable to save qualification: " + error.message,
                    true
                );
            } finally {
                addQualificationButton.disabled = false;
            }
        }
    );

    // Calculate profile completeness.
    function updateCompletion() {
        const checks = [
            firstNameElement.textContent.trim() !== "",
            lastNameElement.textContent.trim() !== "",
            emailElement.textContent.trim() !== "",
            countryInput.value !== "",
            institutionInput.value.trim() !== "",
            fieldOfStudyInput.value.trim() !== "",
            educationLevelInput.value !== "",
            educationStatusInput.value !== "",
           skills.some(function (skill) {
                return skill.skill_level && skill.skill_rating != null;
           }),
            qualifications.length > 0
        ];

        const completed = checks.filter(Boolean).length;
        const percentage = Math.round(
            (completed / checks.length) * 100
        );

        completionBar.style.width = percentage + "%";
        completionText.textContent =
            "Profile completion: " + percentage + "%";
    }

    // Update completion as the user edits education fields.
    document.querySelectorAll(
        "#current-country, #education-form input, #education-form select"
    ).forEach(function (field) {
        field.addEventListener("input", updateCompletion);
        field.addEventListener("change", updateCompletion);
    });

    // Log out using the existing API helper.
    document.getElementById("logout-button").addEventListener(
        "click",
        function () {
            API.logout();
        }
    );

    // Initialize the profile.
    try {
        if (!API) {
            throw new Error("The YouthConnect API helper was not loaded.");
        }

        await loadUser();

        try {
            await loadEducation();
        } catch (error) {
            console.error("Unable to load education:", error);
            showMessage(
                "Your account loaded, but education could not be loaded: " +
                    error.message,
                true
            );
        }

        try {
            await loadSkills();
        } catch (error) {
            console.error("Unable to load skills:", error);
            showMessage(
                "Unable to load skills: " + error.message,
                true
            );
        }

        try {
            await loadQualifications();
        } catch (error) {
            console.error("Unable to load qualifications:", error);
            showMessage(
                "Unable to load qualifications: " + error.message,
                true
            );
        }

        updateCompletion();
    } catch (error) {
        console.error("Unable to initialize profile:", error);
        showMessage(
            "Unable to load your profile. Please log in again.",
            true
        );
    }
});