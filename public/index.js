// Logout logic
document.getElementById("logoutButton").addEventListener("click", function () {
    // Add code for logout action
    // Perform necessary tasks such as clearing user session, resetting data, etc.

    // Redirect the user to the login page
    window.location.href = "/login";
});

// Handle Media button

document.getElementById("Media").addEventListener("click", function (e) {
    e.preventDefault()

    // Trigger the file input
    var mediaInput = document.getElementById("mediaInput");
    mediaInput.click();
});

// Handle file selection
document.getElementById("mediaInput").addEventListener("change", function (e) {
    var selectedFile = e.target.files[0];
    console.log("Selected file:", selectedFile);

    // You can upload the selected file to the server using AJAX or perform other actions as needed
});


document.getElementById("Submit").addEventListener("click", async function (e) {
    e.preventDefault();

    console.log("Submit clicked");

    // Get the form field values
    var dateValue = document.getElementById("dateValue").value;
    var rateValue = document.querySelector('input[name="rateValue"]:checked');
        // Check if a rating is selected
        if (rateValue) {
            rateValue = rateValue.value;
            console.log("Selected rateValue:", rateValue);
        } else {
            // Handle the case where no rating is selected
            alert("Please select a rating.");
        }
    var plateValue = document.getElementById("plateValue").value;
    var commentsValue = document.getElementById("commentsValue").value;

    // Create an object to hold the form data
    var formData = {
        dateValue: dateValue,
        rateValue: rateValue,
        plateValue: plateValue,
        commentsValue: commentsValue
    };

    // Check if all fields are empty
    if (dateValue === "" && rateValue === "" && plateValue === "" && commentsValue === "") {
        alert("All fields are empty. Please fill in at least the Date and Rate fields.");
        return; // Exit the function if all fields are empty
    }
    else {
        console.log("data stored",formData);
    };

    try {
        // Send the form data to the server using the Fetch API
        const response = await fetch("/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log("Form data sent successfully");

            // Handle any response from the server if needed
            // Unhide the submitted text
            var resultDiv = document.getElementById("submittedText");
            resultDiv.style.opacity = 1;
            resultDiv.style.height = "auto";

            // Fade back out after a certain duration
            setTimeout(function () {
                resultDiv.style.opacity = 0;
                resultDiv.style.height = 0;
            }, 3000); // Change the duration (in milliseconds) as needed
        } else {
            console.error("Failed to send form data to server");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }

    // Clear the form fields
    document.getElementById("dateValue").value = "";
    document.getElementById("rateValue").value = "";
    document.getElementById("plateValue").value = "";
    document.getElementById("commentsValue").value = "";
});




// Function to update the search results on the page
function updateSearchResults(results) {
    const searchResultsDiv = document.getElementById('searchResults');

    // Clear previous search results
    searchResultsDiv.innerHTML = '';

    // Check if there are any search results
    if (results.length > 0) {
        results.forEach((result) => {
            const div = document.createElement('div');
            div.classList.add('searchResults');
            div.innerHTML = `
                <h3> Search Results: </h3>
                <p>User Name: ${result.UserName}</p>
                <p>Date: ${result.dateValue}</p>
                <p>Rate: ${result.rateValue}</p>
                <p>Plate: ${result.plateValue}</p>
                <p>Comments: ${result.commentsValue}</p>
            `;
            searchResultsDiv.appendChild(div);
        });
    } else {
        const p = document.createElement('p');
        p.textContent = 'No results found.';
        searchResultsDiv.appendChild(p);
    }
}


// Add event listener to the search button
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
var count = 0;

// Add event listener to hide placeholder on focus
searchInput.addEventListener("focus", function () {
    searchInput.placeholder = "";
    count = count + 1;
    searchClose.style.display = "block";
});

// Add event listener to show placeholder on blur if the input is empty
searchInput.addEventListener("blur", function () {
    if (!searchInput.value) {
        if (count === 1) {
            searchInput.placeholder = "Search for Date";
        }
        if (count === 2) {
            searchInput.placeholder = "Search for Plate #";
        }
        if (count === 3) {
            searchInput.placeholder = "Search for User Name";
            count = 0;
        }
      searchClose.style.display = "none";
    }
});

// Add event listener to the close search button
searchClose.addEventListener('click', (e) => {
    // Prevent Default refresh 
    e.preventDefault();
    document.getElementById("searchInput").value = '';
    document.getElementById("searchResults").style.display = "none"
});

// Function to perform search when Enter key is pressed
function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchButton.click();
    }
}

// Add event listener to the search input for Enter key press
searchInput.addEventListener("keydown", handleEnterKey);

// Add event listener to the search button
searchButton.addEventListener('click', (e) => {
    // Prevent Default refresh 
    e.preventDefault();

    //Unhide searchResults div
    var searchdisplay = document.getElementById("searchResults")
    if (searchInput.value != ''){
        searchdisplay.style.display = "block";
    };    

    // Get the user's search query from the search input
    const searchTerm = searchInput.value.trim();

    // Perform the search only if the search term is not empty
    if (searchTerm !== '') {
        console.log("Performing search for:", searchTerm);

        // Make an AJAX request to the server with the search term
        const xhr = new XMLHttpRequest();
        const url = `/search?search=${encodeURIComponent(searchTerm)}`;
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status === 200) {
                // Request succeeded, update the page content with the search results
                const response = JSON.parse(xhr.response);
                const formattedResults = response.map((result) => ({
                    UserName: result.UserName,
                    dateValue: new Date(result.dateValue).toLocaleDateString('en-US'),
                    rateValue: result.rateValue,
                    plateValue: result.plateValue,
                    commentsValue: result.commentsValue,
                }));
                // Update the search results on the page
                updateSearchResults(formattedResults);
            } else {
                console.error('Request failed:', xhr.status);
            }
        };
        xhr.send();
    }
});


// Get the current date in the format YYYY-MM-DD
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Set the date input field's value to today's date
document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("dateValue");
    dateInput.value = getCurrentDate();
});