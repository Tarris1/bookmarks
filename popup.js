const icons = {edit:'<i class="fas fa-pencil-alt button-icon"></i>', delete:'<i class="fas fa-trash button-icon"></i>', sort:'<i class="material-icons">arrow_downward</i>'}
const appendChildren = (parent, ...children) => {!children&&parent;children.forEach(child => {parent.appendChild(child);});}
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
        } li.remove();});
};

const createSortButton = (bookmarks, parentElement, searchInput) => {
    const sortOrder = document.getElementById("sort-button");
    sortOrder.addEventListener('click', () => {
      sortOrder.textContent = sortOrder.textContent === "desc" ? "asc" : "desc";
      parentElement.innerHTML = '';
      createBookmarkDropdowns(bookmarks, parentElement, searchInput.value.trim(),sortOrder.textContent);
    }); return sortOrder;
  }

const buttonFuncs = {editBookmarkItem, deleteBookmarkItem};

const createButton = (li, item, type) =>  {
    const icon = icons[type];
    const button = document.createElement("button");
    button.className = type+"Btn";
    button.classList.add(type+"-button");
    button.innerHTML = icon;
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        buttonFuncs[`${type}BookmarkItem`](li, item);
    }); return button;
}

const createBookmarkDropdowns = (bookmarks, parentElement, searchQuery="", order="desc") => {
    const ul = document.createElement("ul");
    const sortedBookmarks = sortFunction(bookmarks, order);
    for (const item of sortedBookmarks) {
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
            folderDropdown.classList.add("folder-dropdown"); // Set initial state to hidden
            createBookmarkDropdowns(item.children, folderDropdown, searchQuery, order);
            li.appendChild(folderDropdown);
            folderTitle.addEventListener("click", () => {
                folderTitle.classList.toggle("collapsed");
                folderDropdown.classList.toggle("hidden");
            });

        } else {
            if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {continue;}
            const bookmarkLink = document.createElement("a");
            bookmarkLink.textContent = item.title;
            bookmarkLink.href = item.url;
            bookmarkLink.className = "linkRow"
            const dateAdded = document.createElement("a");
            const date = new Date(item.dateAdded);
            dateAdded.textContent = " (" + (date.getDate())+"/"+(date.getMonth()+1)+"-"+date.getFullYear() + ")";
            bookmarkLink.appendChild(dateAdded)
            const editButton = createButton(li, item, "edit");
            const deleteButton = createButton(li, item, "delete")
        li.appendChild(bookmarkLink);
        const containerDiv = document.createElement("div");
        appendChildren(containerDiv, bookmarkLink, editButton, deleteButton)
        li.appendChild(containerDiv);
        }
      ul.appendChild(li);
    }
    parentElement.appendChild(ul);
  };
const sortFunction = (bookmarks, direction) => {
    const orderedBookmarks = [...bookmarks];
    const order = direction === "desc";
    orderedBookmarks.sort((a, b) => {
        if (a.hasOwnProperty("children") && b.hasOwnProperty("children")) {
          return (order ? b.dateGroupModified - a.dateGroupModified : a.dateGroupModified - b.dateGroupModified);
        } else {return order ? b.dateAdded - a.dateAdded : a.dateAdded - b.dateAdded;}});
    return orderedBookmarks
}

const createSearch = (bookmarks, parentElement) => {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.trim();
        parentElement.innerHTML = '';
        createBookmarkDropdowns(bookmarks, parentElement, searchQuery);
    }); return searchInput;
}

chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const bookmarksBar = bookmarkTreeNodes[0].children;
    const parentElement = document.getElementById("bookmarks-container");
    const searchInput = createSearch(bookmarksBar, parentElement);
    const sortOrder = createSortButton(bookmarksBar, parentElement, searchInput.value);
    const order = sortOrder.textContent;
    createBookmarkDropdowns(bookmarksBar, parentElement,searchInput.value,order);
});
  