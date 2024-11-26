document.addEventListener("DOMContentLoaded", () => {
const choosedComponentsDiv = document.getElementById('choosedcomponents');
let selectedDeleteComponent=null;
let selectedParentComponent=null;
let selectedParentwithchildComponentcode = null;
fetch('/getChoosedParentComponents')
        .then(res => res.json())
        .then(parentComponents => {
            if (parentComponents.length > 0) {
                choosedComponentsDiv.style.display = 'block';

                parentComponents.forEach(parentComponent => {
                    const parentDiv = document.createElement('div');
                    parentDiv.className = 'parent-component';

                    switch (parentComponent.type) {
                        case 'component1':
                            parentDiv.innerHTML = `
                                <div class="parentcomponent">
                                    <button class="edit-btn">UPDATE</button>
                                    <button class="delete-btn">DELETE</button>
                                    <h2>${parentComponent.data.title}</h2>
                                    <p>${parentComponent.data.description}</p>
                                    <div class="childcomponent">
                                        <button class="add-childcomponent-btn">ADD</button>
                                    </div>
                                </div>
                            `;
                            parentDiv.querySelector('.delete-btn').addEventListener('click', () => {
                                selectedDeleteComponent = parentComponent; 
                                showDeletePopup(selectedDeleteComponent); 
                            });
                            parentDiv.querySelector('.childcomponent').appendChild(createChildComponentsfromuser(parentComponent.data.code,parentComponent.childcomponent));
                            parentDiv.querySelector('.edit-btn').addEventListener('click', () => {
                                selectedParentComponent = parentComponent; 
                                createupdateForm(parentComponent.data,selectedParentComponent); 
                                document.getElementById('edit-form-popup').style.display = 'block';
                            });
                            parentDiv.querySelector('.add-childcomponent-btn').addEventListener('click', () => {
                                selectedParentwithchildComponentcode = parentComponent.data.code;
                                findcomponentfromcollectioncomponent(parentComponent,selectedParentwithchildComponentcode);
                                childComponentGalleryPopup.style.display = 'block'; 
                            });
                            break;

                        case 'component2':
                            parentDiv.innerHTML = `
                             <button class="edit-btn">UPDATE</button>
                             <button class="delete-btn">DELETE</button>
                                <h2>${parentComponent.data.title}</h2>
                                <p>${parentComponent.data.description}</p>
                                <div class="childcomponent">
                                    <button class="add-childcomponent-btn">ADD</button>
                                </div>
                            `;
                            parentDiv.querySelector('.delete-btn').addEventListener('click', () => {
                                selectedDeleteComponent = parentComponent; 
                                showDeletePopup(selectedDeleteComponent); 
                            });
                            parentDiv.querySelector('.childcomponent').appendChild(createChildComponentsfromuser(parentComponent.data.code,parentComponent.childcomponent));
                            parentDiv.querySelector('.edit-btn').addEventListener('click', () => {
                                selectedParentComponent = parentComponent; 
                                createupdateForm(parentComponent.data,selectedParentComponent); 
                                document.getElementById('edit-form-popup').style.display = 'block';
                            });
                            parentDiv.querySelector('.add-childcomponent-btn').addEventListener('click', () => {
                                selectedParentwithchildComponentcode = parentComponent.data.code;
                                findcomponentfromcollectioncomponent(parentComponent,selectedParentwithchildComponentcode);
                                childComponentGalleryPopup.style.display = 'block'; 
                            });
                            break;

                        default:
                            parentDiv.innerHTML = `<h3>Unknown Parent Component</h3>`;
                            break;
                    }

                    choosedComponentsDiv.appendChild(parentDiv);
                });
            } else {
                choosedComponentsDiv.innerHTML = '<p>No components chosen yet.</p>';
                choosedComponentsDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error fetching components:', error);
            choosedComponentsDiv.innerHTML = '<p>Error loading components.</p>';
            choosedComponentsDiv.style.display = 'block';
        });
    });