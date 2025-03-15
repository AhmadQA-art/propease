# Troubleshooting "TypeError: Router.use() requires a middleware function" in Express

This guide provides steps to diagnose and resolve the "TypeError: Router.use() requires a middleware function" error in your Express.js application, specifically when it originates from `node_modules/express/lib/router/index.js` and is implicated in `backend/src/routes/invite.routes.js`.

## Error Description

The error "TypeError: Router.use() requires a middleware function" indicates that you are attempting to use something other than a valid middleware function with the `router.use()` method in your Express application. This method is designed to register middleware functions that process incoming requests.

## Affected Files

The following files may be affected or require updates to resolve this error:

*   `backend/src/routes/invite.routes.js`
*   `backend/src/middleware/auth.middleware.js`
*   `backend/src/middleware/auth.js`
*   `backend/src/index.js`
*   `backend/src/controllers/invite.controller.js`

## Potential Causes

1.  **Incorrect Import/Export of Middleware Functions:** The middleware function might not be correctly imported or exported from its module, resulting in a variable that is not a function being passed to `router.use()`.
2.  **Missing `next()` Calls in Middleware Functions:** While not directly causing this error, a missing `next()` call in a middleware function can prevent the request from reaching subsequent middleware or route handlers, leading to unexpected behavior and making debugging difficult.
3.  **Passing Non-Function Arguments to `router.use()`:** Accidentally passing a variable that is not a function (e.g., a string, number, or object) to `router.use()` will directly trigger this error.
4.  **Version Incompatibilities with Express:** While less common, version conflicts between Express and other middleware packages could potentially lead to this error.
5.  **Incorrect Router Setup:** There might be an issue with how the Express Router is set up or how middleware is being applied to it.

## Actionable Steps to Diagnose and Resolve

1.  **Verify Middleware Function Signatures:** Ensure that the middleware function being used has the correct signature: `(req, res, next) => { ... }`. The function must accept three arguments: the request object (`req`), the response object (`res`), and the `next` function.

    ```javascript
    // Correct middleware function signature
    const myMiddleware = (req, res, next) => {
      // ... middleware logic ...
      next(); // Call next to pass control to the next middleware/route handler
    };
    ```

2.  **Check for Missing `next()` Calls:**  Examine the middleware function for missing `next()` calls. If `next()` is not called, the request will be left hanging, and the subsequent route handlers will not be executed.

    ```javascript
    // Middleware function with a missing next() call (BAD)
    const myMiddleware = (req, res) => {
      // ... middleware logic ...
      // Missing next() call!
    };
    ```

3.  **Inspect the Arguments Passed to `router.use()`:** Use `console.log()` to inspect the value being passed to `router.use()` right before the line that throws the error. This will help you confirm whether it is indeed a function.

    ```javascript
    // Example debugging
    console.log('authMiddleware:', typeof authMiddleware); // Should output 'function'
    router.use(authMiddleware);
    ```

4.  **Review Express Version Compatibility:** Check the versions of Express and any related middleware packages in your `package.json` file. Ensure that they are compatible with each other. Consider updating or downgrading packages if necessary.

5.  **Examine the Router Setup and Middleware Pipeline:** Carefully review the `backend/src/routes/invite.routes.js` file and the `backend/src/index.js` file to understand how the router is being set up and how middleware is being applied.

    *   **invite.routes.js:**

        ```javascript
        const express = require('express');
        const router = express.Router();
        const inviteController = require('../controllers/invite.controller');
        const authMiddleware = require('../middleware/auth.middleware');

        // Apply auth middleware to all routes
        router.use(authMiddleware); // <--- CHECK THIS LINE

        // Invitation routes
        router.post('/team/invite', inviteController.inviteTeamMember);
        router.post('/tenant/invite', inviteController.inviteTenant);
        router.post('/vendor/invite', inviteController.inviteVendor);
        router.post('/owner/invite', inviteController.inviteOwner);

        // Verify invitation token
        router.get('/verify/:token', inviteController.verifyInvitation);

        module.exports = router;
        ```

    *   **index.js:**

        ```javascript
        const express = require('express');
        const inviteRoutes = require('./routes/invite.routes');
        // ... other imports

        const app = express();
        // ... other middleware

        app.use('/api/invites', inviteRoutes); // <--- CHECK THIS LINE
        ```

## Code Examples

**Correct Middleware Usage:**

```javascript
// Example of a valid middleware function
const authenticate = (req, res, next) => {
  // Check for authentication token
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Verify the token (replace 'secret' with your actual secret key)
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Attach user information to the request object
    req.user = decoded;
    next(); // Pass control to the next middleware/route handler
  });
};

// Applying the middleware to a route
router.get('/profile', authenticate, (req, res) => {
  // Access user information from req.user
  res.json({ message: `Welcome, ${req.user.username}!` });
});
```

## Debugging Techniques

*   **Console Logging:** Use `console.log()` liberally to inspect the values of variables and the flow of execution in your middleware functions and route handlers.
*   **Debugger:** Use a debugger (e.g., the one built into VS Code) to step through your code line by line and inspect the state of your application.
*   **Error Handling:** Implement robust error handling to catch and log any errors that occur in your middleware functions and route handlers.

By following these steps, you should be able to identify and resolve the "TypeError: Router.use() requires a middleware function" error in your Express application.