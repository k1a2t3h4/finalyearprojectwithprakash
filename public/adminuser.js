
fetch('/users')
.then(res => res.json())
.then(users => {
    console.log("Users fetched: ", users); 

    if (users.length === 0) {
        userContainer.innerHTML = "<p>No users found</p>";
        return;
    }

    users.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h4>${user.username}</h4>
            <p>Email: ${user.email}</p>
            <p>Created At: ${new Date(user.createdAt).toLocaleDateString()}</p>
        `;
        userContainer.appendChild(li);
    });
})
.catch(error => {
    console.error("Error fetching users:", error);
    userContainer.innerHTML = "<p>Error loading users</p>";
});
