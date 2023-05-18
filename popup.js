const appendChildren = (parent, ...children) => {children.forEach(child => {parent.appendChild(child);});}
const createButton = (li, item, type) =>  {
    const icon = type==="edit"?'<i class="fas fa-pencil-alt button-icon"></i>':'<i class="fas fa-trash button-icon"></i>';
    const button = document.createElement("button");
    button.className = type+"Btn";
    button.classList.add(type+"-button");
    button.innerHTML = icon;
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        type==="edit"?editBookmarkItem(li, item):deleteBookmarkItem(li,item);
    });
    return button;
    }

const createBookmarkDropdowns = (bookmarks, parentElement) => {
    const ul = document.createElement("ul");  
    for (const item of bookmarks) {
        const li = document.createElement("li");
        if (item.hasOwnProperty("children")) {
            const folderTitle = document.createElement("button");
            folderTitle.textContent = item.title;
            folderTitle.classList.add("folder-title", "collapsed"); // Set initial state to collapsed
            const dropdownArrow = document.createElement("span");
            dropdownArrow.innerHTML = '&#9660';
            folderTitle.appendChild(dropdownArrow);
            li.appendChild(folderTitle);
            const folderDropdown = document.createElement("ul");
            folderDropdown.className = "folderDropdown";
            folderDropdown.classList.add("folder-dropdown", "hidden"); // Set initial state to hidden
            createBookmarkDropdowns(item.children, folderDropdown);
            li.appendChild(folderDropdown);
            folderTitle.addEventListener("click", () => {
                folderTitle.classList.toggle("collapsed");
                folderDropdown.classList.toggle("hidden");
            });
            folderTitle.draggable = true;
            folderTitle.addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("text/plain", item.id);
                event.dataTransfer.effectAllowed = "move";
      });
        } else {
            const bookmarkLink = document.createElement("a");
            bookmarkLink.textContent = item.title;
            bookmarkLink.href = item.url;
            bookmarkLink.className = "linkRow"
            const editButton = createButton(li, item, "edit");
            const deleteButton = createButton(li, item, "delete")
        li.appendChild(bookmarkLink);
        const containerDiv = document.createElement("div");
        containerDiv.draggable = true;
        containerDiv.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", item.id);
            event.dataTransfer.effectAllowed = "move";
        });
        appendChildren(containerDiv, bookmarkLink, editButton, deleteButton)
        li.appendChild(containerDiv);
        }
  
      ul.appendChild(li);
    }
    parentElement.appendChild(ul);
  };
const editBookmarkItem = (li, item) => {
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = item.title;
    const linkInput = document.createElement("input");
    linkInput.type = "text";
    linkInput.value = item.url;
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
        const newTitle = titleInput.value;
        const newUrl = linkInput.value;
        chrome.bookmarks.update(item.id, { title: newTitle, url: newUrl }, (updatedBookmark) => {
            item.title = updatedBookmark.title;
            item.url = updatedBookmark.url;
            li.innerHTML = "";
            const bookmarkLink = document.createElement("a");
            bookmarkLink.textContent = item.title;
            bookmarkLink.href = item.url;
            const editButton = createButton(li, item,"edit");
            const deleteButton = createButton(li,item,"delete");  
            const containerDiv = document.createElement("div");
            appendChildren(containerDiv, bookmarkLink, editButton, deleteButton);
            li.appendChild(containerDiv);
        });
    });  
    li.innerHTML = "";
    appendChildren(li, titleInput, linkInput, saveButton);
};
  
const deleteBookmarkItem = (li, item) => {
    chrome.bookmarks.remove(item.id, () => {
        const parentFolder = item.parent;
        if (parentFolder && parentFolder.children) {
        parentFolder.children = parentFolder.children.filter(child => child !== item);
        } li.remove();
    });
  };

chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const bookmarksBar = bookmarkTreeNodes[0];
    const parentElement = document.getElementById("bookmarks-container");
    createBookmarkDropdowns(bookmarksBar.children, parentElement);
});