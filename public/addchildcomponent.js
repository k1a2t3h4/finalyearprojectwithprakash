const childComponentGalleryPopup = document.getElementById('child-componentgallery-and-form-popup');
const childComponentsListDiv = document.getElementById('child-components-list');
const childComponentFormDiv = document.getElementById('child-component-form');
const saveChildBtn = document.getElementById('savechildBtn');
const closeChildFormBtn = document.getElementById('closechildFormBtn');
const closeChildEditFormBtn = document.getElementById('closeChildEditFormBtn');

function findcomponentfromcollectioncomponent(parentComponent,code) {
    fetch(`/getComponentByType?type=${parentComponent.type}`)
        .then(res => res.json())
        .then(componentData => { 
            createchildren(componentData,code);
        })
        .catch(error => {
            console.error('Error fetching component:', error);
        });
}
let selectedchildcomponent=null;
let selectedParentwithchildComponent=null;
function createchildren(componentData, code) {
    childComponentsListDiv.innerHTML = ''; 
    componentData.children.forEach(child => {
        const childDiv = document.createElement('div');
        childDiv.className = 'child-component';

        switch (child.type) {
            case 'style1':
                childDiv.innerHTML = `
                <div class='item bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-transform transform hover:translate-y-1'>
                    <img src="${child.data.image}" alt="Placeholder image of ${child.data.title}" class="w-full h-48 object-cover">
                <div class="item-content p-4">
                    <h3 class="item-titl    e text-lg font-bold mb-2">${child.data.title}</h3>
                    <a href="${child.data.link}" class="item-link inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Buy Now</a>
                </div>
                    <button class="add-child-btn">Add</button>
                `;
                break;
        }

        childDiv.querySelector('.add-child-btn').addEventListener('click', () => {
            selectedchildcomponent = child;
            selectedParentwithchildComponent = code;
            createchildForm(child.data);
        });

        childComponentsListDiv.appendChild(childDiv);
    });
}

function createchildForm(data) {
    childComponentFormDiv.innerHTML = ''; 

    const dynamicForm = document.createElement('form');
    dynamicForm.id = 'dynamicForm';

    for (let key in data) {
        const value = data[key];
        let inputElement;

        switch (key) {
            case 'title':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = 'Enter title';
                inputElement.name = key;
                inputElement.required = true; 
                inputElement.value = value || ''; 
                break;
            case 'code':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.placeholder = 'Enter code';
                inputElement.name = key;
                inputElement.required = true; 
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

    childComponentFormDiv.appendChild(dynamicForm);
}

saveChildBtn.addEventListener('click', () => {
    const formElement = document.getElementById('dynamicForm');
    const formData1 = new FormData(formElement);
    const childData = {};
    formData1.forEach((value, key) => {
        childData[key] = value;
    });

    if (isFormValid(formElement)) {
        const componentType=selectedchildcomponent.type;
        const componentCode = childData['code'];
        fetch('/getAllComponents', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(components => {
                let instance = 1;
                let order = 1;
                let codeUnique = true;
                const parentWithChildren = components.find(c => c.data.code === selectedParentwithchildComponent);
                const childComponents = parentWithChildren ? parentWithChildren.childcomponent : [];

                if (childComponents.length > 0) {
                order = Math.max(...childComponents.map(c => c.order), 0) + 1;   
                const existingComponents = childComponents.filter(c => c.type === componentType);
                if (existingComponents.length > 0) {
                    const instanceNumbers = existingComponents.map(c => c.instance);
                    if (instanceNumbers.length > 0) {
                        const highestInstance = Math.max(...instanceNumbers);
                        instance = highestInstance + 1;
                    }
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

                fetch('/saveChildComponent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        parentcode: selectedParentwithchildComponent,
                        childData: {
                            type: selectedchildcomponent.type, 
                            instance: instance,
                            order: order,
                            data: childData, 
                        },
                    }),
                })
                    .then(response => response.json())
                    .then(result => {
                        // console.log('Child component saved:', result);
                        // alert('Component saved successfully with instance: ' + instance + ' and order: ' + order);
                        setTimeout(() => {
                            location.reload();
                        }, 2000);
                        
                        childComponentGalleryPopup.style.display = 'none';
                    })
                    .catch(error => {
                        console.error('Error saving child component:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching components:', error);
            });
    } else {
        alert('Please fill out all required fields.');
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
// function isFormValid(formElement) {
//     const requiredFields = formElement.querySelectorAll('[required]');
//     for (let field of requiredFields) {
//         if (!field.value.trim()) {
//             alert(`Please fill the ${field.name} field.`);
//             return false;
//         }
//     }
//     return true;
// }
closeChildFormBtn.addEventListener('click', () => {
    childComponentGalleryPopup.style.display = 'none';
});
closeChildEditFormBtn.addEventListener('click', () =>{
    document.getElementById('edit-child-form-popup').style.display = 'none';
})
