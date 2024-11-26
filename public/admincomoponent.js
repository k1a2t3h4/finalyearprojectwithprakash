document.addEventListener("DOMContentLoaded", () => {
    const componentsContainer = document.getElementById('componentsContainer');


    fetch('/components')
        .then(res => res.json())
        .then(components => {
            console.log("Components fetched: ", components);  

            if (components.length === 0) {
                componentsContainer.innerHTML = "<p>No components found</p>";
                return;
            }

            components.forEach(parentComponent => {
                const parentDiv = document.createElement('div');
                parentDiv.className = "parent-component";

                switch (parentComponent.type) {
                    case 'component1':  
                        parentDiv.innerHTML = `
                            <h2>${parentComponent.data.title}</h2>
                            <p>${parentComponent.data.description}</p>
                            <div class="links"></div>
                        `;
                        parentDiv.querySelector('.links').appendChild(createChildComponents(parentComponent.children));
                        break;

                    case 'component2': 
                        parentDiv.innerHTML = `
                            <h2>${parentComponent.data.title}</h2>
                            <p>${parentComponent.data.description}</p>
                            <div class="links"></div>
                        `;
                        parentDiv.querySelector('.links').appendChild(createChildComponents(parentComponent.children));
                        break;

                    default:
                        parentDiv.innerHTML = `<h3>Unknown Parent Component</h3>`;
                }

                componentsContainer.appendChild(parentDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching components:", error);
            componentsContainer.innerHTML = "<p>Error loading components</p>";
        });


function createChildComponents(children) {
    const childList = document.createElement('ul');
    childList.className = "child-component-list";

    children.forEach(childComponent => {
        const li = document.createElement('li');
        switch (childComponent.type) {
            case 'affiliateProduct':
                li.innerHTML = `
                    <h4>Affiliate Product</h4>
                    <img src="${childComponent.data.image}" alt="Product Image">
                    <p>${childComponent.data.description}</p>
                    <a href="${childComponent.data.link}" target="_blank">Buy Now</a>
                `;
                break;

            case 'banner':
                li.innerHTML = `
                    <h4>Banner</h4>
                    <img src="${childComponent.data.image}" alt="Banner Image">
                    <a href="${childComponent.data.buttonLink}" class="button">${childComponent.data.buttonText}</a>
                `;
                break;

            case 'review':
                li.innerHTML = `
                    <h4>Product Review</h4>
                    <img src="${childComponent.data.productImage}" alt="Review Product Image">
                    <p>Rating: ${childComponent.data.rating}</p>
                    <p>${childComponent.data.reviewText}</p>
                `;
                break;

            default:
                li.innerHTML = '<p>Unknown Child Component</p>';
        }
        childList.appendChild(li);
    });

    return childList;  
}
});
