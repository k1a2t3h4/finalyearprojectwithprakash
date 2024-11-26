function createChildComponentsfromuser(parentCode,childComponents) {
    const childComponentsDiv = document.createElement('div');
    childComponentsDiv.className = 'child-components-list';
    if (childComponents && childComponents.length > 0) {
        childComponents.forEach(child => {
            const childDiv = document.createElement('div');
            childDiv.className = 'child-component';
            childDiv.innerHTML = `<p>${child.data.title}</p>`;
 
            const updateButton = document.createElement('button');
            updateButton.innerText = 'Update';
            updateButton.addEventListener('click', () => {
                createChildUpdateForm(child,parentCode);
            });

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.addEventListener('click', () => {
                showChildDeletePopup(child,parentCode); 
            });

            childDiv.appendChild(updateButton);
            childDiv.appendChild(deleteButton);
            childComponentsDiv.appendChild(childDiv);
        });
    } else {
        childComponentsDiv.innerHTML = '<p>No child components added yet.</p>';
    }

    return childComponentsDiv;
}
