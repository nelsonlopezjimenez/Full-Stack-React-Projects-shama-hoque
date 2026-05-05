# Mern Social Routes

## Routes no need auth
hat routes do not need authentication
Based on the route files — routes with no authCtrl.requireSignin middleware:

Method	Path	Note
POST	/auth/signin	Expected — issues the token
GET	/auth/signout	Expected — clears cookie
POST	/api/users	Expected — user registration
GET	/api/users	Lists all users with no auth
GET	/api/users/photo/:userId	Profile photo served publicly
GET	/api/users/defaultphoto	Default avatar, public
GET	/api/posts/photo/:postId	Post photo served publicly
The last three are arguably fine (serving images publicly is common). The one that stands out as a likely oversight is GET /api/users — it returns the full user list (including email, hashed_password presence, timestamps) to anyone without a token. Most social apps require at least a login to browse users.


## API Route Inventory
Auth (/auth)
Method	Path	Description
POST	/auth/signin	Validate credentials, issue JWT cookie
GET	/auth/signout	Clear JWT cookie
Users (/api/users)
Method	Path	Description
GET	/api/users	List all users
POST	/api/users	Create (register) a user
GET	/api/users/:userId	Get one user's profile
PUT	/api/users/:userId	Update user (multipart form, handles photo upload)
DELETE	/api/users/:userId	Delete user account
GET	/api/users/photo/:userId	Serve user's profile photo binary
GET	/api/users/defaultphoto	Serve default avatar
PUT	/api/users/follow	Follow another user
PUT	/api/users/unfollow	Unfollow a user
GET	/api/users/findpeople/:userId	List users not yet followed by :userId
Posts (/api/posts)
Method	Path	Description
POST	/api/posts/new/:userId	Create a post (multipart, handles photo)
GET	/api/posts/by/:userId	List posts authored by :userId
GET	/api/posts/feed/:userId	Newsfeed: posts from users :userId follows
DELETE	/api/posts/:postId	Delete a post (poster only)
GET	/api/posts/photo/:postId	Serve a post's photo binary
PUT	/api/posts/like	Add a like to a post
PUT	/api/posts/unlike	Remove a like from a post
PUT	/api/posts/comment	Add a comment to a post
PUT	/api/posts/uncomment	Remove a comment from a post
REST Best Practice Assessment
✅ What's done correctly
Standard CRUD on /api/users/:userId using GET/PUT/DELETE
POST /api/users for creation
router.param middleware for pre-loading resources (userByID, postByID) — clean pattern
Consistent /api/ prefix separation from auth routes
❌ Issues
1. Verbs in URLs (most pervasive problem)
REST URLs should identify resources, not actions. Nearly all the action-oriented routes violate this:

Current	RESTful equivalent
PUT /api/posts/like	POST /api/posts/:postId/likes
PUT /api/posts/unlike	DELETE /api/posts/:postId/likes/:userId
PUT /api/posts/comment	POST /api/posts/:postId/comments
PUT /api/posts/uncomment	DELETE /api/posts/:postId/comments/:commentId
PUT /api/users/follow	POST /api/users/:userId/followers
PUT /api/users/unfollow	DELETE /api/users/:userId/followers/:followerId
GET /api/users/findpeople/:userId	GET /api/users?exclude=following (query param)
POST /api/posts/new/:userId	POST /api/posts (:userId from token)
2. GET /auth/signout should be POST or DELETE
Signout is a state-changing operation (clears a session). GET requests should be safe and idempotent — browsers, proxies, and prefetch mechanisms can trigger them unintentionally.

3. Sub-resources not nested
/api/posts/by/:userId and /api/posts/feed/:userId describe relationships between users and posts but don't express it in the URL hierarchy:

→ GET /api/users/:userId/posts
→ GET /api/users/:userId/feed
4. POST /api/posts/new/:userId has two problems

/new is a verb segment (anti-pattern)
:userId in the URL is redundant — the JWT already identifies the caller; the server should use req.auth._id instead of a URL param
5. /api/users/photo/:userId is a flat resource, not nested
Photos are a property of a user, so GET /api/users/:userId/photo is cleaner. Same for GET /api/posts/:postId/photo.