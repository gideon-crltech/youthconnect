// ========================================
// YouthConnect - Skills & Training
// Course Search and Category Filtering
// ========================================


// STEP 1: Select the HTML elements

const courseSearch = document.getElementById("course-search");

const courseCategory = document.getElementById("course-category");

const courseResultsCount = document.getElementById("course-results-count");

const noCoursesMessage = document.getElementById("no-courses-message");


// STEP 2: Select all nine course cards

const courseCards = document.querySelectorAll(".course-card");


// STEP 3: Create the filtering function

function filterCourses() {

    // Read the search box and selected category

    const searchText = courseSearch.value.trim().toLowerCase();

    const selectedCategory = courseCategory.value;

    let visibleCourses = 0;


    // Examine every course card

    courseCards.forEach(function (card) {

        // Get the course title

        const title = card.querySelector("h3").textContent;


        // Get the course descriptions and topics

        const paragraphs = Array.from(
            card.querySelectorAll("p")
        );

        const description = paragraphs.map(function (paragraph) {

            return paragraph.textContent;

        }).join(" ");


        // Combine the information that users can search

        const searchableText = (
            card.dataset.search + " " +
            title + " " +
            description
        ).toLowerCase();


        // Check whether the search text matches

        const matchesSearch = searchableText.includes(searchText);


        // Check whether the category matches

        const matchesCategory =
            selectedCategory === "all" ||
            card.dataset.category === selectedCategory;


        // Decide whether the course should appear

        const shouldShow = matchesSearch && matchesCategory;

        card.hidden = !shouldShow;


        // Count visible courses

        if (shouldShow) {

            visibleCourses++;

        }

    });


    // STEP 4: Update the course counter

    courseResultsCount.textContent =
        `Showing ${visibleCourses} learning path${visibleCourses === 1 ? "" : "s"}`;


    // STEP 5: Display a message when there are no matches

    noCoursesMessage.hidden = visibleCourses !== 0;

}


// STEP 6: Listen for search input

courseSearch.addEventListener("input", filterCourses);


// STEP 7: Listen for category changes

courseCategory.addEventListener("change", filterCourses);


// STEP 8: Display all nine courses when the page opens

filterCourses();