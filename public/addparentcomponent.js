const overlay = document.getElementById('overlay');
const componentGallery = document.getElementById('component-gallery');
const formPopup = document.getElementById('form-popup');
const dynamicForm = document.getElementById('dynamic-form');
const addComponentBtn = document.getElementById('addComponentBtn');
const saveBtn = document.getElementById('saveBtn');
const closeFormBtn = document.getElementById('closeFormBtn');

let selectedParentComponent = null;

// Show the component gallery as a popup
addComponentBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';  // Show overlay to center content
    componentGallery.style.display = 'block';  // Show component gallery within overlay

    fetch('/components')
        .then(res => {
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            return res.json();
        })
        .then(components => {
            componentGallery.innerHTML = ''; 

            components.forEach(parentComponent => {
                const parentDiv = document.createElement('div');
                parentDiv.className = "parent-component";
        
                switch (parentComponent.type) {
                    case 'tree1':
                        parentDiv.innerHTML = `
                            <div class="container mx-auto p-4">
                                <h2 id="list-title" class="text-2xl font-bold mb-4 text-center">${parentComponent.data.title}</h2>
                                <div class="item-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="item-list">
                                    
                                </div>
                            </div>
                            <button class="choose-component-btn">ADD</button>
                            `;
                        if (Array.isArray(parentComponent.children)) {
                            fetchChildComponent(parentComponent.children, parentDiv.querySelector('#item-list'));
                        } else {
                            console.warn("No children found for parent component:", parentComponent);
                        }
                        const chooseComponentBtn = parentDiv.querySelector('.choose-component-btn');
                        chooseComponentBtn.addEventListener('click', () => {
                            chooseComponentBtn.style.display = 'none';
                            // Hide all other components except the selected one
                            Array.from(componentGallery.children).forEach(child => {
                                if (child !== parentDiv) {
                                    child.style.display = 'none';
                                }
                            });

                            // Show the form below the selected component
                            createForm(parentComponent.data);
                            selectedParentComponent = parentComponent; 
                            formPopup.style.display = 'block';
                            parentDiv.appendChild(formPopup);
                        });
                        break;

                    default:
                        parentDiv.innerHTML = `<h3>Unknown Component</h3>`;
                }

                componentGallery.appendChild(parentDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching components:", error);
            componentGallery.innerHTML = "<p>Error loading components: " + error.message + "</p>";
        });
});

// Save button and close form actions
saveBtn.addEventListener('click', () => {
    overlay.style.display = 'none'; // Hide overlay after saving
    formPopup.style.display = 'none';
    componentGallery.style.display = 'none';
});

closeFormBtn.addEventListener('click', () => {
    overlay.style.display = 'none'; // Hide overlay and form on close
    formPopup.style.display = 'none';
    componentGallery.style.display = 'none';
});

// Close the popup when clicking outside the component gallery or form popup
overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
        overlay.style.display = 'none';
        componentGallery.style.display = 'none';
        formPopup.style.display = 'none';
    }
});

function createForm(data) {
    dynamicForm.innerHTML = ''; 

    for (let key in data) {
        const value = data[key];
        let inputElement;

        switch (key) {
            case 'title':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = 'Enter title';
                inputElement.name = key;
                inputElement.value = value || '';
                break;
            case 'code':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = 'Enter title';
                inputElement.name = key;
                inputElement.value = value || '';
                break;
            case 'description':
                inputElement = document.createElement('textarea');
                inputElement.placeholder = 'Enter description';
                inputElement.name = key;
                inputElement.value = value || '';
                break;
            case 'image':
                inputElement = document.createElement('input');
                inputElement.type = 'url';
                inputElement.placeholder = 'Enter image URL';
                inputElement.name = key;
                inputElement.value = value || '';
                break;
            default:
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = `Enter ${key}`;
                inputElement.name = key;
                inputElement.value = value || '';
        }

        const label = document.createElement('label');
        label.innerText = key.charAt(0).toUpperCase() + key.slice(1);
        dynamicForm.appendChild(label);
        dynamicForm.appendChild(inputElement);
        
    }
}

    saveBtn.addEventListener('click', () => {
        const formData = new FormData(dynamicForm);
        const dataToSave = {};
alert(formData);
        formData.forEach((value, key) => {
            dataToSave[key] = value;
        });

        if (isFormValid(dynamicForm)) {
            const componentType = selectedParentComponent.type;
            const componentCode = dataToSave['code']; 
            fetch('/getAllComponents', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(components => {
                let instance = 1; 
                let order = 1; 
                let codeUnique = true;
                console.log("Fetched components:", components);


                if (components.length > 0) {
                    order = Math.max(...components.map(c => c.order), 0) + 1;
                    
                    const existingComponents = components.filter(c => c.type === componentType);
                    if (existingComponents.length > 0) {
                        const highestInstance = Math.max(...existingComponents.map(c => parseInt(c.instance, 10)));
                        instance = highestInstance + 1; 
                    }
                }
                
                components.forEach(component => {
                    if (component.data.code === componentCode) {
                        codeUnique = false;
                    }
                    component.childcomponent.forEach(child => {
                        if (child.data.code === componentCode) {
                            codeUnique = false;
                        }
                    });
                });
                if (!codeUnique) {
                    alert('The code already exists. Please enter a unique code.');
                    return; 
                }
                console.log("Preparing to save component with instance:", instance, "and order:", order);
                fetch('/saveComponent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: componentType,
                        instance: instance, 
                        order: order,
                        data: dataToSave ,
                        childcomponent: [] 
                    }),
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return res.json();
                })
                .then(result => {
                    console.log("Component saved:", result);
                    alert('Component saved successfully with instance: ' + instance + ' and order: ' + order);
                })
                .catch(error => {
                    console.error("Error saving component:", error);
                });

            })
            .catch(error => {
                console.error("Error fetching components:", error);
            });

        } else {
            console.error("No parent component selected.");
            alert("Please fill out all required fields.");

        }
    });
    function isFormValid(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        for (let input of inputs) {
            if (!input.value.trim()) {
                return false;
            }
        }
        return true;
    }
closeFormBtn.addEventListener('click', () => {
    formPopup.style.display = 'none';
});


