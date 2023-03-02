"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").children().removeClass("hidden");
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function viewUserProfile() {
  hidePageComponents();
  $profileContainer.show();
  $("#user-profile-name").text(currentUser.name);
  $("#user-profile-username").text(currentUser.username);
  $("#user-profile-password").text("**********");
}

$navUserProfile.on("click", viewUserProfile);

// these are hidden until logged in

// submit new story

function navNewStoryClick() {
  hidePageComponents();
  $newStoryForm.show();
}

$navSubmit.on("click", navNewStoryClick);

// my favorites

function navFavoritesClick() {
  hidePageComponents();
  putFavoritesOnPage();
}

$navFavorites.on("click", navFavoritesClick);

// my stories

function navMyStoriesClick() {
  hidePageComponents();
  putMyStoriesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);
