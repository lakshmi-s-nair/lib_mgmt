document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
    });

    if (response.ok) {
        const data = await response.json();
        alert(`Welcome, ${data.role === "admin" ? "Admin" : "Member"}!`);
        
        
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("admin-section").style.display = "block";

        
        if (data.role === "admin") {
            document.getElementById("add-form").style.display = "block";
            document.getElementById("del-form").style.display = "block";
            document.getElementById("register-form").style.display = "block";
            //document.getElementById("search").style.display = "block";
            document.getElementById("book-list").style.display = "block";
            document.getElementById("user-list").style.display = "block";
            //document.getElementById("search-list").style.display = "block";
            fetchAndDisplayUsers();
            
        } else {
            document.getElementById("book-list").style.display = "block";
            //document.getElementById("search").style.display = "block";
            //document.getElementById("search-list").style.display = "block";
            document.getElementById("add-form").style.display = "none";
            document.getElementById("register-form").style.display = "none";
            document.getElementById("user-list").style.display = "none";
        }
    } else {
        alert("Invalid credentials!");
    }
});


document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const role = document.getElementById("role").value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
        credentials: 'include',
    });

    if (response.ok) {
        alert("Registration successful.");
        document.getElementById("register-form").reset();
        fetchAndDisplayUsers()
    } else {
        alert("Registration failed.");
    }
});

document.getElementById("add-form").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;

    const response = await fetch('/add_book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author }),
        credentials: 'include',
    });

    if (response.ok) {
        alert("Added book successfully.");
        document.getElementById("add-form").reset();
        fetchAndDisplayBooks();
    }
    else{
        fetchAndDisplayBooks();
    }

});

document.getElementById("del-form").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const title = document.getElementById("del_title").value;
    const author = document.getElementById("del_author").value;

    const response = await fetch('/delete_book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author }),
        credentials: 'include',
    });

    if (response.ok) {
        alert("Book deleted successfully.");
        document.getElementById("del-form").reset();
        fetchAndDisplayBooks();
    } else {
        
        fetchAndDisplayBooks();
    }
});


// document.getElementById("search-form").addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const query = document.getElementById("search-query").value.trim();

//     if (!query) {
//         alert("Please enter a search term.");
//         return;
//     }

//     const response = await fetch(`/search_book?query=${encodeURIComponent(query)}`, {
//         method: 'GET',
//         credentials: 'include',
//     });

//     const searchResults = document.getElementById("search-results");
//     searchResults.innerHTML = "";

//     if (response.ok) {
//         const books = await response.json();
//         books.forEach((book) => {
//             const li = document.createElement("li");
//             li.textContent = `${book.title} by ${book.author}`;
//             searchResults.appendChild(li);
//         });
//     } else if (response.status === 404) {
//         alert("No books found.");
//     } else {
//         const errorMsg = await response.json();
//         alert(`Search failed: ${errorMsg.message}`);
//     }
     
// });


document.getElementById("logout").addEventListener("submit", async (e)=>{
    e.preventDefault();

    const response = await fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (response.ok) {
        alert("Logged out successfully.");
        Window.location.reload();

    } else {
        alert("Failed to log out. Please try again.");
    }
});



async function fetchAndDisplayBooks(){
    try {
        const response = await fetch('/books', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const books = await response.json();
            const bookList = document.getElementById("books");
            bookList.innerHTML = "";

            books.forEach((book) => {
                const li = document.createElement("li");
                li.textContent = `${book.title} by ${book.author}`;
                bookList.appendChild(li);
            });
        } else {
            alert("Failed to fetch books. Please try again.");
        }
    } catch (error) {
        console.error("Error fetching books:", error);
        alert("An error occurred while fetching the book list.");
    }
}

async function fetchAndDisplayUsers() {
    try {
        const response = await fetch('/users', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const users = await response.json();
            const userList = document.getElementById("users");
            userList.innerHTML = "";

            users.forEach((user) => {
                const li = document.createElement("li");
                li.textContent = `${user.id}. ${user.username}, ${user.role}`;
                userList.appendChild(li);
            });

            document.getElementById("user-list").style.display = "block"; // Ensure it's visible
        } else {
            alert("Failed to fetch users. Please try again.");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("An error occurred while fetching the user list.");
    }
}


window.addEventListener("load", fetchAndDisplayBooks);

