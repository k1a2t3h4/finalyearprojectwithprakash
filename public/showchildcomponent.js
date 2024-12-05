function createChildComponentsfromuser(parentCode, childComponents,container) {
    if (childComponents && childComponents.length > 0) {
        childComponents.forEach(child => {
            const childDiv = document.createElement('div');
            childDiv.className = 'child-component';

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

                default:
                    childDiv.innerHTML = `<p>Unknown Child Component</p>`;
                    break;
            }

            const updateButton = document.createElement('button');
            updateButton.innerText = 'Update';
            updateButton.addEventListener('click', () => {
                createChildUpdateForm(child, parentCode);
            });

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.addEventListener('click', () => {
                showChildDeletePopup(child, parentCode); 
            });

            childDiv.appendChild(updateButton);
            childDiv.appendChild(deleteButton);
            container.appendChild(childDiv);
        });
    } else {
        container.innerHTML = '<p>No child components added yet.</p>';
    }

}