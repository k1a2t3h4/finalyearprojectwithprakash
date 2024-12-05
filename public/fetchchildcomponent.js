function fetchChildComponent(children, container) {
    if (!children || children.length === 0) return;

    children.forEach(child => {
        const childDiv = document.createElement('div');
        childDiv.className = "child-component";
        switch (child.type) {
            case 'style1':
                childDiv.innerHTML = `
                <div class='item bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-transform transform hover:translate-y-1'>
                    <img src="${child.data.image}" alt="Placeholder image of ${child.data.title}" class="w-full h-48 object-cover">
                <div class="item-content p-4">
                    <h3 class="item-title text-lg font-bold mb-2">${child.data.title}</h3>
                    <a href="${child.data.link}" class="item-link inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Buy Now</a>
                </div>
                `;
                break;

            

            // Add more cases for different child types as needed

            default:
                childDiv.innerHTML = `<h4>Unknown Child Component</h4>`;
        }

        container.appendChild(childDiv);
    });
}