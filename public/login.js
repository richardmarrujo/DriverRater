document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission

    // Get input values
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Send the form data to the server for authentication
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            showStatusMessage("Login successful", true);
            // Redirect to the main page after showing the message
            await delay(1500); // Wait for 3 seconds
            window.location.href = "/"; // Redirect to the main page
        } else if (response.status === 401) {
            const data = await response.json();
            showStatusMessage(data.message, false);
            // Clear password field after delay and allow user to try again
            await delay(1500); // Wait for 3 seconds
            hideStatusMessage();
            document.getElementById("password").value = '';
            document.getElementById("password").focus();
        } else {
            throw new Error('An error occurred');
        }
    } catch (error) {
        console.error('Error during login:', error);
        showStatusMessage('An error occurred', false);
    }
});

function showStatusMessage(message, isSuccess) {
    var statusElement = document.getElementById("loginStatus");
    statusElement.textContent = message;
    statusElement.style.color = isSuccess ? "#4caf50" : "red";
}

function hideStatusMessage() {
    var statusElement = document.getElementById("loginStatus");
    statusElement.textContent = "";
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
