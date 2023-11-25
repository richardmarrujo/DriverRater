// document.getElementById("registrationForm").addEventListener("submit", async function (event) {
//     event.preventDefault(); // Prevent form submission

//     // Get input values
//     var username = document.getElementById("username").value;
//     var password = document.getElementById("password").value;

       // 
//     // Validate password length
//     if (password.length < 8) {
//         showErrorMessage("Password must be at least 8 characters long", "passwordError");
//         return;
//     }

//     // Show success message before redirecting
//     showSuccessMessage("Registration accepted. Redirecting to login page...");
//     await delay(3000);
//     window.location.href = "/login"; // Redirect to the login page
// });

// function showErrorMessage(message, elementId) {
//     var errorElement = document.getElementById(elementId);
//     errorElement.textContent = message;
//     errorElement.style.color = "red";
// }

// function hideErrorMessage(elementId) {
//     var errorElement = document.getElementById(elementId);
//     errorElement.textContent = "";
// }

// function showSuccessMessage(message) {
//     var statusElement = document.getElementById("registrationStatus");
//     statusElement.textContent = message;
//     statusElement.style.color = "#4caf50";
// }

// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
