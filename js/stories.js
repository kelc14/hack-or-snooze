"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if not logged in -- do not add favicon
  if (!currentUser) {
    return $(`
  <li id="${story.storyId}">
  <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>
`);
  } else {
    //if logged in
    // if the story is in the current users favorites, set the icon to be solid star and set dataset.favorite to be true;
    let currentFavorites = currentUser.favorites;

    //filter the currentFavorites to see if storyId is in there
    const result = currentFavorites.filter((obj) => {
      return obj.storyId === story.storyId;
    }); //returns a result array with a length > 0 if there is an item that matches

    // if it is already a favorite, set the data-favorite to true and also create a solid star
    if (result.length > 0) {
      return $(`
          <li id="${story.storyId}" data-favorite = 'true'>
          <span class='favIcon'><i class="fa-solid fa-star"></i></span>  
          <a href="${story.url}" target="a_blank" class="story-link">
              ${story.title}
            </a>
            <small class="story-hostname">(${hostName})</small>
            <small class="story-author">by ${story.author}</small>
            <small class="story-user">posted by ${story.username}</small>
          </li>
        `);
    }

    // if it is NOT, no data-favorite and also create an empty star
    else
      return $(`
        <li id="${story.storyId}">
        <span class='favIcon'><i class="fa-regular fa-star"></i></span>  
        <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </li>
      `);
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let favorite of currentUser.favorites) {
    const $favorite = generateStoryMarkup(favorite);
    $allStoriesList.append($favorite);
  }

  $allStoriesList.show();
}

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let myStory of currentUser.ownStories) {
    const $myStory = generateStoryMarkup(myStory);
    $allStoriesList.append($myStory);
  }
  $("li").prepend(
    '<span class="deleteIcon"><i class="fa-solid fa-trash"></i></span>'
  );

  $allStoriesList.show();
  checkForRememberedUser();
}

// When a new story is submitted, collect story data, remove the submit form and re-load
//    stories on page;
$newStoryForm.on("submit", putNewStoryOnPage);

async function putNewStoryOnPage(evt) {
  evt.preventDefault();

  // grab the story information
  let title = $("#story-title").val();
  let author = $("#story-author").val();
  let url = $("#story-url").val();

  let newStory = await storyList.addStory(currentUser, {
    title,
    author,
    url,
  });

  checkForRememberedUser();
  getAndShowStoriesOnStart();

  // reset and hide the form
  $("#story-title").val("");
  $("#story-url").val("");
  $("#story-author").val("");
  $newStoryForm.hide();
}

async function favoriteOrNot(event) {
  const star = event.target;
  const target = event.currentTarget;
  // let favoritedStoryItem = target.parentElement;

  const favoritedStoryItem = target.parentElement;

  const favoritedStoryId = favoritedStoryItem.getAttribute("id");

  // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& BUG TO COME BACK AND FIX %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // if its the users own story - check myStory of currentUser.ownStories for story

  // else :
  //  get the story object using its ID from the list of all stories on the page
  let storiesArray = storyList.stories;
  const result = storiesArray.filter((obj) => {
    return obj.storyId === favoritedStoryId;
  });
  const story = result[0];

  // this continues as normal
  if (!favoritedStoryItem.dataset.favorite) {
    favoritedStoryItem.dataset.favorite = true;
    star.setAttribute("class", "fa-solid fa-star");
    await currentUser.createFavorite(story);
  } else {
    favoritedStoryItem.dataset.favorite = "";
    star.setAttribute("class", "fa-regular fa-star");
    await currentUser.removeFavorite(story);
  }
}

$allStoriesList.on("click", ".favIcon", favoriteOrNot);

async function deleteMyStory(event) {
  let $target = $(event.target);
  const deletedStoryItem = $target.parent().parent();

  checkForRememberedUser();

  const deletedStoryId = deletedStoryItem.attr("id");

  const myStories = currentUser.ownStories;
  const result = myStories.filter((obj) => {
    return obj.storyId === deletedStoryId;
  });
  const story = result[0];

  await currentUser.deleteMyStoryFromApi(story);
  // also remove from DOM bc these next two functions are happening faster than the await

  const theRestOfMyStories = myStories.filter((obj) => {
    return obj.storyId !== deletedStoryId;
  });
  currentUser.ownStories = theRestOfMyStories;

  putMyStoriesOnPage();
}

$allStoriesList.on("click", ".deleteIcon", deleteMyStory);
