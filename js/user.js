"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.login(username, password);

    $loginForm.trigger("reset");

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch {
    alert(
      "Invalid Login Information. Please enter valid username and password."
    );
  }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.signup(username, password, name);

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();

    $signupForm.trigger("reset");
  } catch {
    alert("Username Taken. Please choose another.");
  }
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  $(".main-nav-links").children().addClass("hidden");
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  hidePageComponents();

  $allStoriesList.show();

  updateNavOnLogin();
}

// set-up editing capabilities for user profile

// **** UPDATE NAME ******* //
async function updateUserName(user) {
  let token = currentUser.loginToken;

  const response = await axios.patch(
    `${BASE_URL}/users/${currentUser.username}`,
    { token, user }
  );
}

$("#edit-name").one("click", function () {
  updateInputForEditingName();
});

function updateInputForEditingName() {
  $("#edit-name").text("");
  $("#edit-name").html(
    '<input type="text" placeholder="enter new name" id="updated-name" minlength="1" maxlength="55">'
  );
  $("#submit-name").removeClass("hidden");
}

$("#submit-name").on("click", async function () {
  const nameUpdated = $("#updated-name").val();
  let updatedName = { name: nameUpdated };

  await updateUserName(updatedName);
  $("#edit-name").text("");
  $("#user-profile-name").text(nameUpdated);
  $("#submit-name").addClass("hidden");
  $("#edit-name").text("edit");
  $("#edit-name").one("click", function () {
    updateInputForEditingName();
  });
});

// **** UPDATE PASSWORD ******* //
async function updatePassword(user) {
  let token = currentUser.loginToken;

  const response = await axios.patch(
    `${BASE_URL}/users/${currentUser.username}`,
    { token, user }
  );
}

$("#edit-password").one("click", function () {
  updateInputForEditingPassword();
});

function updateInputForEditingPassword() {
  $("#edit-password").text("");
  $("#edit-password").html(
    '<input type="password" id="updated-password" minlength="1" maxlength="55">'
  );
  $("#submit-password").removeClass("hidden");
}

$("#submit-password").on("click", async function () {
  const passwordUpdatedVal = $("#updated-password").val();
  let updatedPasswordObj = { password: passwordUpdatedVal };

  await updateUserName(updatedPasswordObj);
  $("#edit-password").text("");
  $("#user-password").text("********");
  $("#submit-password").addClass("hidden");
  $("#edit-password").text("edit");
  $("#edit-password").one("click", function () {
    updateInputForEditingPassword();
  });
});
