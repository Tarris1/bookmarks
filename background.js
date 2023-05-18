chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    // Access the bookmarks bar node
    const bookmarksBar = bookmarkTreeNodes[0].children[0];
  
    // Loop through the bookmarks in the bookmarks bar
    for (let i = 0; i < bookmarksBar.children.length; i++) {
      const bookmark = bookmarksBar.children[i];
      console.log(bookmark.title, bookmark.url);
    }
  });